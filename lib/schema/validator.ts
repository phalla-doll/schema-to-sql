import type { DatabaseSchema } from '@/types';

export interface ValidationError {
    isValid: boolean;
    error?: string;
}

export function validateSchema(schema: DatabaseSchema | null | undefined): ValidationError {
    if (!schema) {
        return {
            isValid: false,
            error: 'Schema is null or undefined',
        };
    }

    if (!schema.tables || schema.tables.length === 0) {
        return {
            isValid: false,
            error: 'The provided database schema is empty. No tables or columns exist to query.',
        };
    }

    return {
        isValid: true,
    };
}
