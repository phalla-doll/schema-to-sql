export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sql?: string;
    timestamp: string;
}

export interface QueryRequest {
    query: string;
    schemaId: string;
    model?: string;
}

export interface QueryResponse {
    sql: string;
    explanation?: string;
    usedTables: string[];
}

export interface ModelInfo {
    id: string;
    name: string;
    provider: string;
    isFree: boolean;
    isCustom?: boolean;
}

export interface UserPreferences {
    model: string;
    theme: string;
    openRouterApiKey: string;
    customModels: string[];
}
