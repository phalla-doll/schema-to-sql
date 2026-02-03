import type { DatabaseSchema } from '@/types';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

export function validateSQL(
    sql: string,
    schema: DatabaseSchema,
    usedTables: string[]
): ValidationResult {
    const errors: string[] = [];
    const upperSQL = sql.toUpperCase();

    for (const tableName of usedTables) {
        if (!schema.tables.find((t) => t.name.toLowerCase() === tableName.toLowerCase())) {
            errors.push(`Table "${tableName}" does not exist in schema`);
        }
    }

    const fromMatches = upperSQL.match(/FROM\s+(\w+)/gi) || [];
    const joinMatches = upperSQL.match(/JOIN\s+(\w+)/gi) || [];
    const allTables = [
        ...fromMatches.map((m) => m.replace(/FROM\s+/i, '')),
        ...joinMatches.map((m) => m.replace(/JOIN\s+/i, '')),
    ];

    for (const table of allTables) {
        const cleanTable = table.replace(/\[/g, '').replace(/\]/g, '').replace(/`/g, '');
        if (!schema.tables.find((t) => t.name.toLowerCase() === cleanTable.toLowerCase())) {
            errors.push(`Table "${cleanTable}" not found in schema`);
        }
    }

    const destructivePatterns = [
        /\bDROP\b/i,
        /\bDELETE\b/i,
        /\bTRUNCATE\b/i,
        /\bUPDATE\b/i,
        /\bINSERT\b/i,
        /\bALTER\b/i,
    ];

    for (const pattern of destructivePatterns) {
        if (pattern.test(sql)) {
            errors.push(
                `Destructive operations (${pattern.source.replace(/[\\^$*+?.()|[\]{}]/g, '$&')}) are not allowed`
            );
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
