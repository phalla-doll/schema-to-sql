'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DatabaseSchema, Message } from '@/types';
import { chatStore, prefsStore, schemaStore } from './store';

export function useSchema() {
    const [schema, setSchema] = useState<DatabaseSchema | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, _setError] = useState<string | null>(null);

    useEffect(() => {
        const loaded = schemaStore.getSchema();
        setSchema(loaded);
        setIsLoading(false);
    }, []);

    const refresh = useCallback(() => {
        const loaded = schemaStore.getSchema();
        setSchema(loaded);
    }, []);

    return { schema, isLoading, error, refresh };
}

export function useSchemaActions() {
    const uploadSchema = useCallback(async (file: File): Promise<DatabaseSchema> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/schema/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || 'Failed to upload schema');
        }

        const data = await response.json();
        schemaStore.setSchema(data.schema);
        return data.schema;
    }, []);

    const clearSchema = useCallback(() => {
        schemaStore.clearSchema();
    }, []);

    return { uploadSchema, clearSchema };
}

export function useChatHistory() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const history = chatStore.getHistory();
        const repairedHistory = repairMessages(history);
        if (repairedHistory !== history) {
            chatStore.clearHistory();
            for (const msg of repairedHistory) {
                chatStore.addMessage(msg);
            }
        }
        setMessages(repairedHistory);
        setIsLoading(false);
    }, []);

    const addMessage = useCallback((message: Message) => {
        setMessages((prev) => [...prev, message]);
        chatStore.addMessage(message);
    }, []);

    const clearHistory = useCallback(() => {
        setMessages([]);
        chatStore.clearHistory();
    }, []);

    return { messages, isLoading, addMessage, clearHistory };
}

function repairMessages(messages: unknown[]): Message[] {
    const repaired: Message[] = [];

    messages.forEach((msg) => {
        if (
            msg &&
            typeof msg === 'object' &&
            'role' in msg &&
            'content' in msg &&
            (msg.role === 'user' || msg.role === 'assistant')
        ) {
            repaired.push({
                id: 'id' in msg && typeof msg.id === 'string' ? msg.id : crypto.randomUUID(),
                role: msg.role,
                content: 'content' in msg && typeof msg.content === 'string' ? msg.content : '',
                sql: 'sql' in msg && typeof msg.sql === 'string' ? msg.sql : undefined,
                timestamp:
                    'timestamp' in msg && typeof msg.timestamp === 'string'
                        ? msg.timestamp
                        : new Date().toISOString(),
            });
        }
    });

    return repaired;
}

export function usePreferences() {
    const [model, setModelState] = useState<string>('openrouter/free');
    const [theme, setThemeState] = useState<string>('light');

    useEffect(() => {
        const prefs = prefsStore.getPreferences();
        setModelState(prefs.model);
        setThemeState(prefs.theme);
    }, []);

    const setModel = useCallback((newModel: string) => {
        setModelState(newModel);
        prefsStore.setPreferences({ model: newModel });
    }, []);

    return { model, setModel, theme };
}
