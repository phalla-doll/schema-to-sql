import type { Table } from '@/types';
import type { SchemaParser } from './parser';

export class SQLServerParser implements SchemaParser {
    detect(sql: string): boolean {
        const upperSql = sql.toUpperCase();
        return (
            upperSql.includes('CREATE TABLE [dbo].[') ||
            upperSql.includes('CREATE TABLE [') ||
            /CREATE TABLE\s+\[.*?\]/.test(sql)
        );
    }

    parse(sql: string): Table[] {
        const tables: Table[] = [];
        const cleanedSql = sql.replace(/\[\dbo\]\./g, '');

        const tableMatches = cleanedSql.matchAll(/CREATE TABLE\s+\[(\w+)\]\s*\(([\s\S]*?)\);/gi);

        for (const match of tableMatches) {
            const tableName = match[1];
            const columnsStr = match[2];

            const { columns, foreignKeys } = this.parseTableContent(columnsStr);
            tables.push({ name: tableName, columns, foreignKeys });
        }

        return tables;
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
            .filter((l) => l && !l.toUpperCase().includes('CONSTRAINT'));

        for (const line of lines) {
            const upperLine = line.toUpperCase();

            if (upperLine.startsWith('CONSTRAINT') && upperLine.includes('FOREIGN KEY')) {
                const fkMatch = line.match(
                    /FOREIGN KEY\s+\[(\w+)\]\s+REFERENCES\s+\[(\w+)\]\s+\[(\w+)\]/i
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

            const columnMatch = line.match(/^\[(\w+)\]\s+([\w()\d]+)(.*)$/);
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
}
