'use client';

import { CodeIcon, DatabaseIcon, EyeIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { DatabaseSchema, Procedure, Table } from '@/types';

interface SchemaTreeProps {
    schema: DatabaseSchema | null;
    searchQuery: string;
    highlightedTables: Set<string>;
}

export function SchemaTree({ schema, searchQuery, highlightedTables }: SchemaTreeProps) {
    if (!schema) {
        return <div className="text-center text-muted-foreground">No schema loaded</div>;
    }

    const tables = schema.tables.filter((t) => !t.isView);
    const views = schema.tables.filter((t) => t.isView);
    const procedures = schema.procedures || [];

    return (
        <div className="space-y-4">
            {tables.length > 0 && (
                <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <HugeiconsIcon icon={DatabaseIcon} strokeWidth={2} className="size-4" />
                        Tables ({tables.length})
                    </h3>
                    <div className="space-y-2">
                        {tables.map((table, index) => (
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
                </div>
            )}

            {views.length > 0 && (
                <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <HugeiconsIcon icon={EyeIcon} strokeWidth={2} className="size-4" />
                        Views ({views.length})
                    </h3>
                    <div className="space-y-2">
                        {views.map((table, index) => (
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
                </div>
            )}

            {procedures.length > 0 && (
                <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <HugeiconsIcon icon={CodeIcon} strokeWidth={2} className="size-4" />
                        Procedures ({procedures.length})
                    </h3>
                    <div className="space-y-2">
                        {procedures.map((procedure, index) => (
                            <ProcedureItem
                                key={procedure.id || `procedure-${index}`}
                                procedure={procedure}
                            />
                        ))}
                    </div>
                </div>
            )}
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
        <Card className={`transition-colors ${isHighlighted ? 'bg-primary/5' : ''}`}>
            <CardHeader>
                <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex w-full items-center justify-between text-left"
                >
                    <div className="flex items-center gap-2">
                        <HugeiconsIcon
                            icon={table.isView ? EyeIcon : DatabaseIcon}
                            strokeWidth={2}
                            className="size-4 text-muted-foreground"
                        />
                        <span className="font-semibold">{table.name}</span>
                    </div>
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
            </CardHeader>

            {isExpanded && (
                <CardContent className="p-0 px-2">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-full text-sm">
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
                    </div>

                    {table.foreignKeys.length > 0 && (
                        <div className="mt-2 px-2 pt-2 text-xs text-muted-foreground">
                            <Separator className="mb-2" />
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
                </CardContent>
            )}
        </Card>
    );
}

interface ProcedureItemProps {
    procedure: Procedure;
}

function ProcedureItem({ procedure }: ProcedureItemProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <HugeiconsIcon
                        icon={CodeIcon}
                        strokeWidth={2}
                        className="size-4 text-muted-foreground"
                    />
                    <span className="font-semibold">{procedure.name}</span>
                </div>
            </CardHeader>
        </Card>
    );
}
