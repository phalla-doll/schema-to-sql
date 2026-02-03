import type { Procedure, Table } from '@/types';
import type { ParseResult, SchemaParser } from './parser';

export class MySQLParser implements SchemaParser {
    detect(sql: string): boolean {
        const upperSql = sql.toUpperCase();
        return (
            upperSql.includes('CREATE TABLE `') ||
            /CREATE TABLE\s+`[^`]+`/.test(sql) ||
            /ENGINE\s*=\s*\w+/i.test(sql)
        );
    }

    parse(sql: string): ParseResult {
        const tables: Table[] = [];
        const procedures: Procedure[] = [];
        const cleanedSql = sql.replace(/IF NOT EXISTS/gi, '');

        const tableMatches = cleanedSql.matchAll(
            /CREATE TABLE\s+`(\w+)`\s*\(([\s\S]*?)\)\s*ENGINE/i
        );

        for (const match of tableMatches) {
            const tableName = match[1];
            const columnsStr = match[2];

            const { columns, foreignKeys } = this.parseTableContent(columnsStr);
            tables.push({ name: tableName, columns, foreignKeys });
        }

        const viewMatches = cleanedSql.matchAll(
            /CREATE VIEW\s+`(\w+)`(?:\s*\(([^)]+)\))?\s+AS\s+SELECT\s+([\s\S]*?);/gi
        );

        for (const match of viewMatches) {
            const viewName = match[1];
            const columnList = match[2];
            const selectStatement = match[3];

            let columns: Table['columns'] = [];

            if (columnList) {
                columns = this.parseExplicitViewColumns(columnList);
            } else {
                columns = this.parseSelectStatementColumns(selectStatement);
            }

            tables.push({ name: viewName, columns, foreignKeys: [], isView: true });
        }

        const procedureMatches = cleanedSql.matchAll(
            /CREATE\s+(?:DEFINER\s*=\s*(?:\w+|`[^`]+`)\s*@+(?:\w+|`[^`]+`)\s+)?PROCEDURE\s+`(\w+)`/gi
        );

        for (const match of procedureMatches) {
            const procedureName = match[1];
            procedures.push({ name: procedureName });
        }

        return { tables, procedures };
    }

    private parseTableContent(content: string): {
        columns: Table['columns'];
        foreignKeys: Table['foreignKeys'];
    } {
        const columns: Table['columns'] = [];
        const foreignKeys: Table['foreignKeys'] = [];

        const lines = content
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l && !l.toUpperCase().startsWith('CONSTRAINT'));

        for (const line of lines) {
            const upperLine = line.toUpperCase();

            if (upperLine.includes('FOREIGN KEY')) {
                const fkMatch = line.match(
                    /FOREIGN KEY\s+\(`?(\w+)`?\)\s+REFERENCES\s+`?(\w+)`?\s*\(`?(\w+)`?\)/i
                );
                if (fkMatch) {
                    foreignKeys.push({
                        column: fkMatch[1],
                        refTable: fkMatch[2],
                        refColumn: fkMatch[3],
                    });
                }
                continue;
            }

            const columnMatch = line.match(/^`(\w+)`\s+([\w()\d]+)(.*)$/);
            if (columnMatch) {
                const [, name, type, rest] = columnMatch;
                const upperRest = rest.toUpperCase();

                columns.push({
                    name,
                    type,
                    nullable: !upperRest.includes('NOT NULL'),
                    primaryKey: upperRest.includes('PRIMARY KEY'),
                    defaultValue: this.extractDefaultValue(rest),
                });
            }
        }

        return { columns, foreignKeys };
    }

    private extractDefaultValue(rest: string): string | undefined {
        const match = rest.match(/DEFAULT\s+((?:'[^']*'|\S+))/i);
        return match ? match[1].replace(/'/g, '') : undefined;
    }

    private parseExplicitViewColumns(columnList: string): Table['columns'] {
        const columns: Table['columns'] = [];
        const colNames = columnList.split(',').map((c) => c.trim().replace(/`/g, ''));

        for (const name of colNames) {
            columns.push({
                name,
                type: 'unknown',
                nullable: true,
                defaultValue: undefined,
                primaryKey: false,
            });
        }

        return columns;
    }

    private parseSelectStatementColumns(selectStatement: string): Table['columns'] {
        const columns: Table['columns'] = [];
        const selectPart = selectStatement.split(/FROM|WHERE|GROUP BY|HAVING|ORDER BY/i)[0];
        const columnDefs = selectPart.replace(/SELECT\s+/i, '').split(',');

        for (const def of columnDefs) {
            let name = def.trim();

            const asMatch = name.match(/\s+(?:AS\s+)?`?(\w+)`?\s*$/i);
            if (asMatch) {
                name = asMatch[1];
            } else {
                name = name.replace(/`/g, '').split('.').pop() || name;
            }

            name = name.replace(/`/g, '').trim();

            if (name && name !== '*') {
                columns.push({
                    name,
                    type: 'unknown',
                    nullable: true,
                    defaultValue: undefined,
                    primaryKey: false,
                });
            }
        }

        return columns;
    }
}
