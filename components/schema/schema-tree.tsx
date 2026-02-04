'use client';

import { CodeIcon, DatabaseIcon, EyeIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { expansionStore } from '@/lib/schema/expansion-store';
import type { DatabaseSchema, Procedure, Table } from '@/types';

interface SchemaTreeProps {
    schema: DatabaseSchema | null;
    tables: Table[];
    views: Table[];
    procedures: Procedure[];
    searchQuery: string;
}

export function SchemaTree({ schema, tables, views, procedures, searchQuery }: SchemaTreeProps) {
    const [allExpanded, setAllExpanded] = useState(false);
    const [expansionStates, setExpansionStates] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(false);
    const parentRef = useRef<HTMLDivElement>(null);

    const getTableId = useCallback((table: Table, index: number): string => {
        return (
            table.id ||
            `${table.database || 'default'}-${table.schema || 'dbo'}-${table.name}-${index}`
        );
    }, []);

    const allTableIds = useMemo(() => {
        return tables.map((table, index) => getTableId(table, index));
    }, [tables, getTableId]);

    useEffect(() => {
        if (searchQuery) {
            setIsLoading(true);
            setAllExpanded(true);
            const newStates: Record<string, boolean> = {};
            tables.forEach((table, index) => {
                const id = getTableId(table, index);
                newStates[id] = true;
            });
            views.forEach((view, index) => {
                const id = getTableId(view, index + tables.length);
                newStates[id] = true;
            });
            setExpansionStates(newStates);
            setTimeout(() => setIsLoading(false), 150);
        } else {
            setAllExpanded(false);
            const savedState = expansionStore.getState();
            setExpansionStates(savedState);
        }
    }, [searchQuery, tables, views, getTableId]);

    const handleToggleAll = useCallback(() => {
        const newState = !allExpanded;
        setAllExpanded(newState);
        expansionStore.setAllExpanded(allTableIds, newState);

        const newStates: Record<string, boolean> = {};
        tables.forEach((table, index) => {
            const id = getTableId(table, index);
            newStates[id] = newState;
        });
        views.forEach((view, index) => {
            const id = getTableId(view, index + tables.length);
            newStates[id] = newState;
        });
        setExpansionStates(newStates);
    }, [allExpanded, allTableIds, tables, views, getTableId]);

    const handleTableToggle = useCallback((tableId: string) => {
        setExpansionStates((prev) => {
            const newState = { ...prev };
            newState[tableId] = !prev[tableId];
            expansionStore.setExpanded(tableId, newState[tableId]);
            return newState;
        });
    }, []);

    const allItems = useMemo(() => {
        return [...tables, ...views].map((table, index) => ({
            table,
            index,
            id: getTableId(table, index),
            type: index < tables.length ? 'table' : 'view',
        }));
    }, [tables, views, getTableId]);

    const rowVirtualizer = useVirtualizer({
        count: allItems.length,
        getScrollElement: () => parentRef.current,
        estimateSize: useCallback(() => {
            const avgExpandedHeight = 280;
            const avgCollapsedHeight = 48;
            return allExpanded ? avgExpandedHeight : avgCollapsedHeight;
        }, [allExpanded]),
        overscan: 10,
        measureElement: useCallback((element: Element | null) => {
            return element?.getBoundingClientRect().height || 48;
        }, []),
    });

    const virtualRows = rowVirtualizer.getVirtualItems();

    if (!schema) {
        return <div className="text-center text-muted-foreground">No schema loaded</div>;
    }

    return (
        <div className="flex h-full flex-col space-y-4">
            {tables.length > 0 && (
                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                            <HugeiconsIcon icon={DatabaseIcon} strokeWidth={2} className="size-4" />
                            Tables ({tables.length})
                        </h3>
                        {!searchQuery && tables.length > 0 && (
                            <button
                                type="button"
                                onClick={handleToggleAll}
                                className="text-xs text-muted-foreground hover:text-foreground"
                            >
                                {allExpanded ? 'Collapse All' : 'Expand All'}
                            </button>
                        )}
                    </div>
                    <div ref={parentRef} className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="space-y-2 p-1">
                                {[
                                    'loading-1',
                                    'loading-2',
                                    'loading-3',
                                    'loading-4',
                                    'loading-5',
                                ].map((id) => (
                                    <div
                                        key={id}
                                        className="h-12 animate-pulse border-l-2 border-muted bg-muted/30"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div
                                style={{
                                    height: `${rowVirtualizer.getTotalSize()}px`,
                                    position: 'relative',
                                }}
                            >
                                {virtualRows.map((virtualRow) => {
                                    const item = allItems[virtualRow.index];
                                    const isExpanded = expansionStates[item.id] || false;

                                    return (
                                        <div
                                            key={item.id}
                                            data-index={virtualRow.index}
                                            ref={rowVirtualizer.measureElement}
                                            className="p-1"
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                width: '100%',
                                                transform: `translateY(${virtualRow.start}px)`,
                                            }}
                                        >
                                            <MemoizedTableItem
                                                table={item.table}
                                                isExpanded={isExpanded}
                                                onToggle={() => handleTableToggle(item.id)}
                                                searchQuery={searchQuery}
                                                shouldAutoExpand={!!searchQuery}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
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
                        {views.map((table, index) => {
                            const id = getTableId(table, index + tables.length);
                            const isExpanded = expansionStates[id] || false;
                            return (
                                <MemoizedTableItem
                                    key={id}
                                    table={table}
                                    isExpanded={isExpanded}
                                    onToggle={() => handleTableToggle(id)}
                                    searchQuery={searchQuery}
                                    shouldAutoExpand={!!searchQuery}
                                />
                            );
                        })}
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
                            <MemoizedProcedureItem
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
    isExpanded: boolean;
    onToggle: () => void;
    searchQuery: string;
    shouldAutoExpand: boolean;
}

function TableItem({ table, isExpanded, onToggle, searchQuery, shouldAutoExpand }: TableItemProps) {
    const [detailsVisible, setDetailsVisible] = useState(false);

    useEffect(() => {
        if (isExpanded && !detailsVisible) {
            const timer = setTimeout(() => setDetailsVisible(true), 0);
            return () => clearTimeout(timer);
        }
    }, [isExpanded, detailsVisible]);

    return (
        <div
            className={`border-l-2 border-primary transition-colors hover:bg-muted/50 ${searchQuery && shouldAutoExpand ? 'bg-primary/5' : ''}`}
        >
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between px-3 py-2 text-left"
            >
                <div className="flex items-center gap-2">
                    <HugeiconsIcon
                        icon={table.isView ? EyeIcon : DatabaseIcon}
                        strokeWidth={2}
                        className="size-4 text-muted-foreground"
                    />
                    <span className="text-sm font-medium">{table.name}</span>
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

            {isExpanded && detailsVisible && (
                <MemoizedTableDetails
                    table={table}
                    searchQuery={searchQuery}
                    shouldAutoExpand={shouldAutoExpand}
                />
            )}
        </div>
    );
}

interface TableDetailsProps {
    table: Table;
    searchQuery: string;
    shouldAutoExpand: boolean;
}

function TableDetails({ table, searchQuery, shouldAutoExpand }: TableDetailsProps) {
    const columns = useMemo(() => table.columns, [table.columns]);
    const foreignKeys = useMemo(() => table.foreignKeys, [table.foreignKeys]);

    return (
        <div className="px-3">
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
                        {columns.map((column, colIndex) => {
                            const isMatch =
                                searchQuery &&
                                shouldAutoExpand &&
                                column.name.toLowerCase().includes(searchQuery.toLowerCase());
                            return (
                                <tr
                                    key={`${column.name}-${colIndex}`}
                                    className={`border-t ${isMatch ? 'bg-primary/10' : ''}`}
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
                                        {foreignKeys.find((fk) => fk.column === column.name) ? (
                                            <span className="text-primary">✓</span>
                                        ) : null}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {foreignKeys.length > 0 && (
                <div className="mt-2 py-2 text-xs text-muted-foreground">
                    <Separator className="mb-2" />
                    <p className="font-semibold">Foreign Keys:</p>
                    <ul className="ml-2 mt-1 list-disc">
                        {foreignKeys.map((fk, fkIndex) => (
                            <li key={`${fk.column}-${fk.refTable}-${fk.refColumn}-${fkIndex}`}>
                                {fk.column} → {fk.refTable}.{fk.refColumn}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

interface ProcedureItemProps {
    procedure: Procedure;
}

function ProcedureItem({ procedure }: ProcedureItemProps) {
    return (
        <div className="border-l-2 border-muted-foreground/30">
            <div className="flex items-center gap-2 px-3 py-2">
                <HugeiconsIcon
                    icon={CodeIcon}
                    strokeWidth={2}
                    className="size-4 text-muted-foreground"
                />
                <span className="font-semibold">{procedure.name}</span>
            </div>
        </div>
    );
}

const MemoizedTableItem = memo(TableItem);
const MemoizedTableDetails = memo(TableDetails);
const MemoizedProcedureItem = memo(ProcedureItem);
