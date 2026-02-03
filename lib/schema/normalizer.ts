import type { DatabaseSchema, Table } from '@/types';

function getTableKey(table: Table): string {
    return `${table.database || 'default'}-${table.schema || 'dbo'}-${table.name}`;
}

function mergeTables(tables: Table[]): Table[] {
    const tableMap = new Map<string, Table>();

    tables.forEach((table) => {
        const key = getTableKey(table);

        tableMap.set(key, {
            ...table,
            columns: deduplicateColumns(table.columns),
            foreignKeys: deduplicateForeignKeys(table.foreignKeys),
            defaults: table.defaults?.filter(
                (value, index, arr) => arr.findIndex((v) => v.column === value.column) === index
            ),
            indices: table.indices?.filter(
                (value, index, arr) => arr.findIndex((v) => v.name === value.name) === index
            ),
        });
    });

    return Array.from(tableMap.values()).map((table) => ({
        ...table,
        id: crypto.randomUUID(),
    }));
}

function deduplicateColumns(columns: Table['columns']): Table['columns'] {
    const columnMap = new Map<string, Table['columns'][0]>();

    columns.forEach((column) => {
        columnMap.set(column.name, column);
    });

    return Array.from(columnMap.values());
}

function deduplicateForeignKeys(foreignKeys: Table['foreignKeys']): Table['foreignKeys'] {
    const fkMap = new Map<string, Table['foreignKeys'][0]>();

    foreignKeys.forEach((fk) => {
        const key = `${fk.column}-${fk.refTable}-${fk.refColumn}`;
        fkMap.set(key, fk);
    });

    return Array.from(fkMap.values());
}

export function normalizeSchema(
    tables: Table[],
    format: 'sqlserver' | 'mysql' | 'dump',
    name: string
): DatabaseSchema {
    const deduplicatedTables = mergeTables(tables);

    return {
        id: crypto.randomUUID(),
        format,
        name: name || `Uploaded Schema (${format})`,
        uploadedAt: new Date().toISOString(),
        tables: deduplicatedTables,
    };
}
