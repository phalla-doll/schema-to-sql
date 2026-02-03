import type { DatabaseSchema } from '@/types';

export interface MatchedSchema {
    tables: DatabaseSchema['tables'];
    usedColumns: Map<string, string[]>;
}

export function matchSchema(query: string, schema: DatabaseSchema): MatchedSchema {
    const lowerQuery = query.toLowerCase();
    const usedTables: DatabaseSchema['tables'] = [];
    const usedColumns = new Map<string, string[]>();

    for (const table of schema.tables) {
        const lowerTableName = table.name.toLowerCase();

        if (lowerQuery.includes(lowerTableName)) {
            usedTables.push(table);
            const matchingColumns: string[] = [];

            for (const column of table.columns) {
                const lowerColumnName = column.name.toLowerCase();
                if (lowerQuery.includes(lowerColumnName)) {
                    matchingColumns.push(column.name);
                }
            }

            if (matchingColumns.length > 0) {
                usedColumns.set(table.name, matchingColumns);
            }
        }
    }

    return {
        tables: usedTables,
        usedColumns,
    };
}
