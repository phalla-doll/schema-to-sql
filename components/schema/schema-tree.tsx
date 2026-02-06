'use client';

import { CodeIcon, DatabaseIcon, EyeIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { expansionStore } from '@/lib/schema/expansion-store';
import type { DatabaseSchema, Procedure, Table } from '@/types';

const AVG_EXPANDED_HEIGHT = 280;
const AVG_COLLAPSED_HEIGHT = 48;

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
    const tablesRef = useRef<HTMLDivElement>(null);
    const viewsRef = useRef<HTMLDivElement>(null);
    const proceduresRef = useRef<HTMLDivElement>(null);

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

    const tablesData = useMemo(() => {
        return tables.map((table, index) => ({
            table,
            id: getTableId(table, index),
        }));
    }, [tables, getTableId]);

    const viewsData = useMemo(() => {
        return views.map((table, index) => ({
            table,
            id: getTableId(table, index + tables.length),
        }));
    }, [views, tables.length, getTableId]);

    const estimateItemSize = useCallback(
        (itemId: string) => {
            return expansionStates[itemId] ? AVG_EXPANDED_HEIGHT : AVG_COLLAPSED_HEIGHT;
        },
        [expansionStates]
    );

    const tablesVirtualizer = useVirtualizer({
        count: tablesData.length,
        getScrollElement: () => tablesRef.current,
        estimateSize: useCallback(
            (index) => estimateItemSize(tablesData[index]?.id || ''),
            [tablesData, estimateItemSize]
        ),
        overscan: 10,
        measureElement: useCallback((element: Element | null) => {
            return element?.getBoundingClientRect().height || AVG_COLLAPSED_HEIGHT;
        }, []),
    });

    const viewsVirtualizer = useVirtualizer({
        count: viewsData.length,
        getScrollElement: () => viewsRef.current,
        estimateSize: useCallback(
            (index) => estimateItemSize(viewsData[index]?.id || ''),
            [viewsData, estimateItemSize]
        ),
        overscan: 10,
        measureElement: useCallback((element: Element | null) => {
            return element?.getBoundingClientRect().height || AVG_COLLAPSED_HEIGHT;
        }, []),
    });

    const proceduresVirtualizer = useVirtualizer({
        count: procedures.length,
        getScrollElement: () => proceduresRef.current,
        estimateSize: () => 48,
        overscan: 10,
        measureElement: useCallback((element: Element | null) => {
            return element?.getBoundingClientRect().height || 48;
        }, []),
    });

    const tablesVirtualRows = tablesVirtualizer.getVirtualItems();
    const viewsVirtualRows = viewsVirtualizer.getVirtualItems();
    const proceduresVirtualRows = proceduresVirtualizer.getVirtualItems();

    if (!schema) {
        return (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                No schema loaded
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col space-y-3">
            {tables.length > 0 && (
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="mb-2 flex items-center justify-between shrink-0 border-b border-gray-200 pb-2 dark:border-gray-700">
                        <h3 className="flex items-center gap-2 text-xs font-semibold text-black dark:text-white">
                            <HugeiconsIcon
                                icon={DatabaseIcon}
                                strokeWidth={2}
                                className="size-3.5 text-blue-600 dark:text-blue-400"
                            />
                            Tables ({tables.length})
                        </h3>
                        {!searchQuery && tables.length > 0 && (
                            <button
                                type="button"
                                onClick={handleToggleAll}
                                className="text-xs font-medium text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white"
                            >
                                {allExpanded ? 'Collapse All' : 'Expand All'}
                            </button>
                        )}
                    </div>
                    <div ref={tablesRef} className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="space-y-1.5">
                                {[1, 2, 3, 4, 5].map((id) => (
                                    <div
                                        key={id}
                                        className="h-10 animate-pulse rounded-sm bg-gray-100 dark:bg-gray-800"
                                    />
                                ))}
                            </div>
                        ) : (
                            <div
                                style={{
                                    height: `${tablesVirtualizer.getTotalSize()}px`,
                                    position: 'relative',
                                }}
                            >
                                {tablesVirtualRows.map((virtualRow) => {
                                    const item = tablesData[virtualRow.index];
                                    const isExpanded = expansionStates[item.id] || false;

                                    return (
                                        <div
                                            key={item.id}
                                            data-index={virtualRow.index}
                                            ref={tablesVirtualizer.measureElement}
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
                <div className="flex-1 flex flex-col min-h-0">
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold text-black dark:text-white border-b border-gray-200 pb-2 dark:border-gray-700">
                        <HugeiconsIcon
                            icon={EyeIcon}
                            strokeWidth={2}
                            className="size-3.5 text-blue-600 dark:text-blue-400"
                        />
                        Views ({views.length})
                    </h3>
                    <div ref={viewsRef} className="flex-1 overflow-y-auto">
                        <div
                            style={{
                                height: `${viewsVirtualizer.getTotalSize()}px`,
                                position: 'relative',
                            }}
                        >
                            {viewsVirtualRows.map((virtualRow) => {
                                const item = viewsData[virtualRow.index];
                                const isExpanded = expansionStates[item.id] || false;
                                return (
                                    <div
                                        key={item.id}
                                        data-index={virtualRow.index}
                                        ref={viewsVirtualizer.measureElement}
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
                    </div>
                </div>
            )}

            {procedures.length > 0 && (
                <div className="flex-1 flex flex-col min-h-0">
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold text-black dark:text-white border-b border-gray-200 pb-2 dark:border-gray-700">
                        <HugeiconsIcon
                            icon={CodeIcon}
                            strokeWidth={2}
                            className="size-3.5 text-blue-600 dark:text-blue-400"
                        />
                        Procedures ({procedures.length})
                    </h3>
                    <div ref={proceduresRef} className="flex-1 overflow-y-auto">
                        <div
                            style={{
                                height: `${proceduresVirtualizer.getTotalSize()}px`,
                                position: 'relative',
                            }}
                        >
                            {proceduresVirtualRows.map((virtualRow) => {
                                const procedure = procedures[virtualRow.index];
                                return (
                                    <div
                                        key={procedure.id || `procedure-${virtualRow.index}`}
                                        data-index={virtualRow.index}
                                        ref={proceduresVirtualizer.measureElement}
                                        className="p-1"
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            transform: `translateY(${virtualRow.start}px)`,
                                        }}
                                    >
                                        <MemoizedProcedureItem procedure={procedure} />
                                    </div>
                                );
                            })}
                        </div>
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
            className={`relative border-l-2 border-black/20 pl-3 transition-all hover:border-black/40 dark:border-white/20 dark:hover:border-white/40 ${searchQuery && shouldAutoExpand ? 'bg-blue-50/50 dark:bg-blue-500/10' : ''}`}
        >
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between px-2 py-2 text-left"
            >
                <div className="flex items-center gap-2">
                    <HugeiconsIcon
                        icon={table.isView ? EyeIcon : DatabaseIcon}
                        strokeWidth={2}
                        className="size-3.5 text-gray-500 dark:text-gray-400"
                    />
                    <span className="text-xs font-semibold text-black dark:text-white">
                        {table.name}
                    </span>
                </div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-3.5 w-3.5 transform transition-transform ${
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
        <div className="px-3 pb-3">
            <div className="overflow-x-auto">
                <table className="w-full min-w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 dark:border-gray-700 dark:text-gray-400">
                            <th className="px-2 py-1.5 text-left">Column</th>
                            <th className="px-2 py-1.5 text-left">Type</th>
                            <th className="px-2 py-1.5 text-center">PK</th>
                            <th className="px-2 py-1.5 text-center">FK</th>
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
                                    className={`border-b border-gray-100 last:border-b-0 dark:border-gray-800 ${isMatch ? 'bg-blue-50/50 dark:bg-blue-500/10' : ''}`}
                                >
                                    <td className="px-2 py-1.5 text-xs text-black dark:text-white">
                                        {column.name}
                                    </td>
                                    <td className="px-2 py-1.5 text-xs text-gray-500 dark:text-gray-400">
                                        {column.type}
                                    </td>
                                    <td className="px-2 py-1.5 text-center">
                                        {column.primaryKey ? (
                                            <span className="text-sm font-semibold text-black dark:text-white">
                                                ✓
                                            </span>
                                        ) : null}
                                    </td>
                                    <td className="px-2 py-1.5 text-center">
                                        {foreignKeys.find((fk) => fk.column === column.name) ? (
                                            <span className="text-sm font-semibold text-black dark:text-white">
                                                ✓
                                            </span>
                                        ) : null}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {foreignKeys.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    <p className="mb-1.5 font-semibold text-black dark:text-white">Foreign Keys:</p>
                    <ul className="ml-2 mt-1 space-y-0.5 list-disc">
                        {foreignKeys.map((fk, fkIndex) => (
                            <li
                                key={`${fk.column}-${fk.refTable}-${fk.refColumn}-${fkIndex}`}
                                className="text-xs"
                            >
                                <span className="font-medium text-black dark:text-white">
                                    {fk.column}
                                </span>
                                <span className="mx-0.5 text-gray-400">→</span>
                                <span className="text-gray-600 dark:text-gray-400">
                                    {fk.refTable}.{fk.refColumn}
                                </span>
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
        <div className="border-l-2 border-gray-200 pl-3 dark:border-gray-700">
            <div className="flex items-center gap-2 px-2 py-2">
                <HugeiconsIcon
                    icon={CodeIcon}
                    strokeWidth={2}
                    className="size-3.5 text-gray-500 dark:text-gray-400"
                />
                <span className="text-xs font-semibold text-black dark:text-white">
                    {procedure.name}
                </span>
            </div>
        </div>
    );
}

const MemoizedTableItem = memo(TableItem);
const MemoizedTableDetails = memo(TableDetails);
const MemoizedProcedureItem = memo(ProcedureItem);
