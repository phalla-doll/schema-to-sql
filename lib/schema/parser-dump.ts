import type { Table } from '@/types';
import type { SchemaParser } from './parser';

export class DumpParser implements SchemaParser {
    private dbms: string = 'dump';

    detect(sql: string): boolean {
        return /^#ROOT:\s+\w+\s+\(dbms:\s+\w+\)/.test(sql.trim());
    }

    getDBMS(): string {
        return this.dbms;
    }

    parse(content: string): Table[] {
        const tables: Table[] = [];
        const lines = content.split('\n');

        let currentDatabase: string | null = null;
        let currentSchema: string | null = null;
        let currentTable: Partial<Table> | null = null;
        let currentSection: string | null = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            const _indent = line.search(/\S|$/);

            if (trimmed.startsWith('#ROOT:')) {
                const dbmsMatch = trimmed.match(/dbms:\s*(\w+)/);
                if (dbmsMatch) {
                    this.dbms = dbmsMatch[1].toUpperCase();
                }
                continue;
            }

            if (trimmed.startsWith('. properties')) continue;

            const dbMatch = trimmed.match(/^(\w+):\s*database$/);
            if (dbMatch) {
                currentDatabase = dbMatch[1];
                continue;
            }

            const schemaMatch = trimmed.match(/^(\w+):\s*schema$/);
            if (schemaMatch) {
                currentSchema = schemaMatch[1];
                continue;
            }

            const tableMatch = trimmed.match(/^(\w+):\s*table$/);
            if (tableMatch) {
                if (currentTable?.name) {
                    tables.push(currentTable as Table);
                }
                currentTable = {
                    name: tableMatch[1],
                    columns: [],
                    foreignKeys: [],
                    defaults: [],
                    indices: [],
                    database: currentDatabase || undefined,
                    schema: currentSchema || undefined,
                };
                currentSection = null;
                continue;
            }

            if (trimmed.startsWith('+ ') && currentTable) {
                const section = trimmed.substring(2);

                if (section === 'columns') {
                    currentSection = 'columns';
                } else if (section === 'keys') {
                    currentSection = 'keys';
                } else if (section === 'foreign-keys') {
                    currentSection = 'foreign-keys';
                } else if (section === 'indices') {
                    currentSection = 'indices';
                } else if (section === 'defaults') {
                    currentSection = 'defaults';
                } else if (section === 'properties') {
                    currentSection = 'properties';
                }
                continue;
            }

            if (trimmed.startsWith('. properties')) {
                currentSection = 'properties';
                continue;
            }

            if (currentSection === 'columns' && currentTable) {
                const colMatch = trimmed.match(/^(\w+):\s*(.+)$/);
                if (colMatch) {
                    const [, name, typeInfo] = colMatch;
                    const parts = typeInfo.trim().split(/\s+/);
                    const type = parts[0];
                    let nullable = true;
                    let identity: number | undefined;
                    let defaultValue: string | undefined;

                    for (const part of parts.slice(1)) {
                        if (part === 'NN') {
                            nullable = false;
                        } else if (part.startsWith('identity')) {
                            const identityMatch = part.match(/identity\s*(\d+)/);
                            if (identityMatch) {
                                identity = parseInt(identityMatch[1], 10);
                            }
                        } else if (part.startsWith('default')) {
                            const defaultMatch = part.match(/default\s+(.+)/);
                            if (defaultMatch) {
                                defaultValue = defaultMatch[1];
                            }
                        }
                    }

                    if (!currentTable.columns) {
                        currentTable.columns = [];
                    }

                    currentTable.columns.push({
                        name,
                        type,
                        nullable,
                        identity,
                        defaultValue,
                    });
                }
            }

            if (currentSection === 'keys' && currentTable) {
                const pkMatch = trimmed.match(/^(\w+):\s*PK\s*\(([^)]+)\)$/);
                if (pkMatch) {
                    const pkColumns = pkMatch[2].split(',').map((c) => c.trim());
                    pkColumns.forEach((pkCol) => {
                        if (currentTable?.columns) {
                            const col = currentTable.columns.find((c) => c.name === pkCol);
                            if (col) {
                                col.primaryKey = true;
                            }
                        }
                    });
                }
            }

            if (currentSection === 'foreign-keys' && currentTable) {
                const fkMatch = trimmed.match(
                    /^(?:(\w+):\s*)?foreign\s+key\s+\(([^)]+)\)\s*->\s*(\w+)(?:\[\.?(\w+)\])?\s*\(([^)]+)\)/i
                );
                if (fkMatch && currentTable.foreignKeys) {
                    const [, _fkName, fkCol, refTable, , refCol] = fkMatch;
                    currentTable.foreignKeys.push({
                        column: fkCol.trim(),
                        refTable,
                        refColumn: refCol.trim(),
                    });
                }
            }

            if (currentSection === 'indices' && currentTable) {
                const idxMatch = trimmed.match(
                    /^(\w+):\s*(?:clustered\s*)?(?:unique\s*)?(?:index|unique)\s*\(([^)]+)\)(?:\s*include\s*\(([^)]+)\))?$/
                );
                if (idxMatch) {
                    const [, name, columnsStr, includeStr] = idxMatch;
                    const columns = columnsStr.split(',').map((c) => c.trim());
                    const include = includeStr
                        ? includeStr.split(',').map((c) => c.trim())
                        : undefined;
                    const unique = trimmed.includes('unique') && !trimmed.includes('index');
                    const clustered = trimmed.includes('clustered');

                    if (currentTable.indices) {
                        currentTable.indices.push({
                            name,
                            columns,
                            include,
                            unique,
                            clustered,
                        });
                    }
                }
            }

            if (currentSection === 'defaults' && currentTable) {
                const defaultMatch = trimmed.match(/^#\d+:\s*(\w+)\s*=\s*(.+)$/);
                if (defaultMatch && currentTable.defaults) {
                    currentTable.defaults.push({
                        column: defaultMatch[1],
                        value: defaultMatch[2],
                    });
                }
            }
        }

        if (currentTable?.name) {
            tables.push(currentTable as Table);
        }

        return tables;
    }
}
