'use client';

import { useCallback, useMemo, useState } from 'react';
import { ChatContainer } from '@/components/chat/chat-container';
import { ChatInput } from '@/components/chat/chat-input';
import { SchemaSearch } from '@/components/schema/schema-search';
import { SchemaStats } from '@/components/schema/schema-stats';
import { SchemaTree } from '@/components/schema/schema-tree';
import { SchemaUpload } from '@/components/upload/schema-upload';
import { expansionStore } from '@/lib/schema/expansion-store';
import { useChatHistory, usePreferences, useSchema } from '@/lib/schema/hooks';
import { schemaStore } from '@/lib/schema/store';
import type { DatabaseSchema, Message } from '@/types';

export default function Page() {
    const { schema, refresh } = useSchema();
    const { messages, addMessage, clearHistory } = useChatHistory();
    const { model, setModel, openRouterApiKey, setApiKey, customModels, setCustomModels } =
        usePreferences();
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const tableCount = useMemo(() => {
        if (!schema) return 0;
        return schema.tables.filter((t) => !t.isView).length;
    }, [schema]);

    const viewCount = useMemo(() => {
        if (!schema) return 0;
        return schema.tables.filter((t) => t.isView).length;
    }, [schema]);

    const procedureCount = useMemo(() => {
        if (!schema) return 0;
        return schema.procedures?.length || 0;
    }, [schema]);

    const columnCount = useMemo(() => {
        if (!schema) return 0;
        return schema.tables.reduce((sum, table) => sum + table.columns.length, 0);
    }, [schema]);

    const filteredTables = useMemo(() => {
        if (!schema) return [];
        if (!searchQuery) return schema.tables.filter((t) => !t.isView);

        const lowerQuery = searchQuery.toLowerCase();
        return schema.tables.filter(
            (table) =>
                !table.isView &&
                (table.name.toLowerCase().includes(lowerQuery) ||
                    table.columns.some((col) => col.name.toLowerCase().includes(lowerQuery)))
        );
    }, [schema, searchQuery]);

    const filteredViews = useMemo(() => {
        if (!schema) return [];
        if (!searchQuery) return schema.tables.filter((t) => t.isView);

        const lowerQuery = searchQuery.toLowerCase();
        return schema.tables.filter(
            (table) =>
                table.isView &&
                (table.name.toLowerCase().includes(lowerQuery) ||
                    table.columns.some((col) => col.name.toLowerCase().includes(lowerQuery)))
        );
    }, [schema, searchQuery]);

    const procedures = useMemo(() => {
        return schema?.procedures || [];
    }, [schema]);

    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleSendMessage = useCallback(
        async (message: string) => {
            if (!schema) return;

            const userMessage: Message = {
                id: crypto.randomUUID(),
                role: 'user',
                content: message,
                timestamp: new Date().toISOString(),
            };
            addMessage(userMessage);

            setIsLoading(true);

            try {
                const response = await fetch('/api/query/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        query: message,
                        schema,
                        model,
                        apiKey: openRouterApiKey,
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to generate SQL');
                }

                const data = await response.json();

                const assistantMessage: Message = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content: `Here's a SQL query for your request:`,
                    sql: data.sql,
                    timestamp: new Date().toISOString(),
                };
                addMessage(assistantMessage);
            } catch (error) {
                const errorMessage: Message = {
                    id: crypto.randomUUID(),
                    role: 'assistant',
                    content:
                        error instanceof Error ? error.message : 'Failed to generate SQL query',
                    timestamp: new Date().toISOString(),
                };
                addMessage(errorMessage);
            } finally {
                setIsLoading(false);
            }
        },
        [schema, model, addMessage, openRouterApiKey]
    );

    const handleClearHistory = useCallback(() => {
        clearHistory();
    }, [clearHistory]);

    const handleSchemaLoaded = useCallback(
        (schema: DatabaseSchema) => {
            schemaStore.setSchema(schema);
            refresh();
            clearHistory();
            expansionStore.clear();
        },
        [refresh, clearHistory]
    );

    if (!schema) {
        return <SchemaUpload onSchemaLoaded={handleSchemaLoaded} />;
    }

    return (
        <div className="flex h-screen flex-col border-r border-gray-200 dark:border-gray-700">
            <header className="flex items-center justify-between border-b-2 border-black px-6 py-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-lg font-semibold tracking-tight">Schema-to-SQL</h1>
                </div>
                <div className="flex items-center gap-4">
                    <SchemaStats
                        tableCount={tableCount}
                        columnCount={columnCount}
                        viewCount={viewCount}
                        procedureCount={procedureCount}
                        format={schema.format}
                        uploadedAt={schema.uploadedAt}
                    />
                    <button
                        type="button"
                        onClick={handleClearHistory}
                        className="rounded-sm border-2 border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-100 hover:border-black dark:border-gray-700 dark:hover:bg-white/5 dark:hover:border-white"
                    >
                        Clear Chat
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="flex w-[280px] flex-col border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
                    <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                        <SchemaSearch onSearch={handleSearch} />
                    </div>
                    <div className="flex-1 overflow-y-auto p-3">
                        <SchemaTree
                            schema={schema}
                            tables={filteredTables}
                            views={filteredViews}
                            procedures={procedures}
                            searchQuery={searchQuery}
                        />
                    </div>
                </aside>

                <main className="flex flex-1 flex-col">
                    <ChatContainer messages={messages} isLoading={isLoading} />
                    <div className="border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
                        <ChatInput
                            model={model}
                            onModelChange={setModel}
                            onSend={handleSendMessage}
                            disabled={isLoading}
                            apiKey={openRouterApiKey}
                            customModels={customModels}
                            setApiKey={setApiKey}
                            setCustomModels={setCustomModels}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
