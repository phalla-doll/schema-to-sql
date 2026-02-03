'use client';

import { useState } from 'react';
import type { DatabaseSchema, Table } from '@/types';

interface SchemaTreeProps {
    schema: DatabaseSchema | null;
    searchQuery: string;
    highlightedTables: Set<string>;
}

export function SchemaTree({ schema, searchQuery, highlightedTables }: SchemaTreeProps) {
    if (!schema) {
        return <div className="text-center text-muted-foreground">No schema loaded</div>;
    }

    return (
        <div className="space-y-2">
            {schema.tables.map((table, index) => (
                <TableItem
                    key={
                        table.id ||
                        `${table.database || 'default'}-${table.schema || 'dbo'}-${table.name}-${index}`
                    }
                    table={table}
                    isHighlighted={highlightedTables.has(table.name)}
                    searchQuery={searchQuery}
                />
            ))}
        </div>
    );
}

interface TableItemProps {
    table: Table;
    isHighlighted: boolean;
    searchQuery: string;
}

function TableItem({ table, isHighlighted, searchQuery }: TableItemProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div
            className={`rounded-lg border transition-colors ${
                isHighlighted ? 'border-primary bg-primary/5' : 'border-border'
            }`}
        >
            <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex w-full items-center justify-between px-3 py-2 text-left"
            >
                <span className="font-semibold">{table.name}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transform transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <title>Expand</title>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                    />
                </svg>
            </button>

            {isExpanded && (
                <div className="border-t px-3 py-2">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-muted-foreground">
                                <th className="px-2 py-1 text-left">Column</th>
                                <th className="px-2 py-1 text-left">Type</th>
                                <th className="px-2 py-1 text-center">PK</th>
                                <th className="px-2 py-1 text-center">FK</th>
                            </tr>
                        </thead>
                        <tbody>
                            {table.columns.map((column, colIndex) => (
                                <tr
                                    key={`${column.name}-${colIndex}`}
                                    className={`border-t ${
                                        searchQuery &&
                                        column.name
                                            .toLowerCase()
                                            .includes(searchQuery.toLowerCase())
                                            ? 'bg-primary/10'
                                            : ''
                                    }`}
                                >
                                    <td className="px-2 py-1">{column.name}</td>
                                    <td className="px-2 py-1 text-muted-foreground">
                                        {column.type}
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                        {column.primaryKey ? (
                                            <span className="text-primary">✓</span>
                                        ) : null}
                                    </td>
                                    <td className="px-2 py-1 text-center">
                                        {table.foreignKeys.find(
                                            (fk) => fk.column === column.name
                                        ) ? (
                                            <span className="text-primary">✓</span>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {table.foreignKeys.length > 0 && (
                        <div className="mt-2 border-t pt-2 text-xs text-muted-foreground">
                            <p className="font-semibold">Foreign Keys:</p>
                            <ul className="ml-2 mt-1 list-disc">
                                {table.foreignKeys.map((fk, fkIndex) => (
                                    <li
                                        key={`${fk.column}-${fk.refTable}-${fk.refColumn}-${fkIndex}`}
                                    >
                                        {fk.column} → {fk.refTable}.{fk.refColumn}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
