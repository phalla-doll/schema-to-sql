'use client';

import { useState } from 'react';
import { ChatContainer } from '@/components/chat/chat-container';
import { ChatInput } from '@/components/chat/chat-input';
import { SchemaSearch } from '@/components/schema/schema-search';
import { SchemaStats } from '@/components/schema/schema-stats';
import { SchemaTree } from '@/components/schema/schema-tree';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SchemaUpload } from '@/components/upload/schema-upload';
import { useChatHistory, usePreferences, useSchema } from '@/lib/schema/hooks';
import { schemaStore } from '@/lib/schema/store';
import type { DatabaseSchema, Message } from '@/types';

export default function Page() {
    const { schema, refresh } = useSchema();
    const { messages, addMessage, clearHistory } = useChatHistory();
    const { model, setModel } = usePreferences();
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [highlightedTables, setHighlightedTables] = useState<Set<string>>(new Set());

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (schema) {
            const matched = new Set<string>();
            const lowerQuery = query.toLowerCase();
            schema.tables.forEach((table) => {
                if (table.name.toLowerCase().includes(lowerQuery)) {
                    matched.add(table.name);
                }
                table.columns.forEach((column) => {
                    if (column.name.toLowerCase().includes(lowerQuery)) {
                        matched.add(table.name);
                    }
                });
            });
            setHighlightedTables(matched);
        }
    };

    const handleSendMessage = async (message: string) => {
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
                content: error instanceof Error ? error.message : 'Failed to generate SQL query',
                timestamp: new Date().toISOString(),
            };
            addMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearHistory = () => {
        clearHistory();
    };

    const handleSchemaLoaded = (schema: DatabaseSchema) => {
        schemaStore.setSchema(schema);
        refresh();
        clearHistory();
    };

    if (!schema) {
        return <SchemaUpload onSchemaLoaded={handleSchemaLoaded} />;
    }

    const tableCount = schema.tables.filter((t) => !t.isView).length;
    const viewCount = schema.tables.filter((t) => t.isView).length;
    const procedureCount = schema.procedures?.length || 0;
    const columnCount = schema.tables.reduce((sum, table) => sum + table.columns.length, 0);

    return (
        <div className="flex h-screen flex-col">
            <header className="border-b bg-background p-4">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <h1 className="text-2xl font-bold">Schema-to-SQL AI</h1>
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
                            className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
                        >
                            Clear Chat
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <aside className="w-80 border-r bg-muted/20">
                    <ScrollArea className="h-full p-4">
                        <div className="mb-4">
                            <SchemaSearch onSearch={handleSearch} />
                        </div>
                        <SchemaTree
                            schema={schema}
                            searchQuery={searchQuery}
                            highlightedTables={highlightedTables}
                        />
                    </ScrollArea>
                </aside>

                <main className="flex flex-1 flex-col">
                    <ChatContainer messages={messages} isLoading={isLoading} />
                    <div className="border-t bg-background p-4">
                        <ChatInput
                            model={model}
                            onModelChange={setModel}
                            onSend={handleSendMessage}
                            disabled={isLoading}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
}
