import type { DatabaseSchema, Message } from '@/types';

const SCHEMA_KEY = 'schema-to-sql:uploaded-schema';
const CHAT_KEY = 'schema-to-sql:chat-history';
const PREFS_KEY = 'schema-to-sql:preferences';
const MAX_SCHEMA_SIZE = 5 * 1024 * 1024;

let inMemorySchema: DatabaseSchema | null = null;

export const schemaStore = {
    getSchema(): DatabaseSchema | null {
        if (typeof window === 'undefined') return null;
        if (inMemorySchema) return inMemorySchema;
        const data = localStorage.getItem(SCHEMA_KEY);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch {
            return null;
        }
    },

    setSchema(schema: DatabaseSchema): void {
        if (typeof window === 'undefined') return;
        const serialized = JSON.stringify(schema);
        if (serialized.length > MAX_SCHEMA_SIZE) {
            inMemorySchema = schema;
            localStorage.removeItem(SCHEMA_KEY);
        } else {
            inMemorySchema = null;
            localStorage.setItem(SCHEMA_KEY, serialized);
        }
    },

    clearSchema(): void {
        if (typeof window === 'undefined') return;
        inMemorySchema = null;
        localStorage.removeItem(SCHEMA_KEY);
    },
};

export const chatStore = {
    getHistory(): Message[] {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(CHAT_KEY);
        if (!data) return [];
        try {
            const parsed = JSON.parse(data);
            return parsed.messages || [];
        } catch {
            return [];
        }
    },

    addMessage(message: Message): void {
        if (typeof window === 'undefined') return;
        const history = this.getHistory();
        history.push(message);
        localStorage.setItem(CHAT_KEY, JSON.stringify({ messages: history }));
    },

    clearHistory(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(CHAT_KEY);
    },
};

export const prefsStore = {
    getPreferences(): { model: string; theme: string } {
        if (typeof window === 'undefined') {
            return { model: 'openrouter/free', theme: 'light' };
        }
        const data = localStorage.getItem(PREFS_KEY);
        if (!data) return { model: 'openrouter/free', theme: 'light' };
        try {
            const prefs = JSON.parse(data);
            return {
                model: prefs.model || 'openrouter/free',
                theme: prefs.theme || 'light',
            };
        } catch {
            return { model: 'openrouter/free', theme: 'light' };
        }
    },

    setPreferences(prefs: Partial<{ model: string; theme: string }>): void {
        if (typeof window === 'undefined') return;
        const current = this.getPreferences();
        const updated = { ...current, ...prefs };
        localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
    },
};
