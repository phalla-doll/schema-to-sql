import type { MatchedSchema } from '@/lib/schema/matcher';

export interface PromptContext {
    query: string;
    schema: MatchedSchema;
    dialect: 'sqlserver' | 'mysql';
    model: string;
}

export function buildPrompt(context: PromptContext): {
    system: string;
    user: string;
} {
    const { query, schema, dialect } = context;

    const schemaJSON = JSON.stringify(schema.tables, null, 2);

    return {
        system: `Generate SQL queries using only the provided database schema. 
Do not add any tables or columns that are not in the schema.
Use ${dialect.toUpperCase()} syntax and best practices.
Return only the SQL query without explanation unless explicitly asked.
If the query cannot be answered with the provided schema, explain what information is missing.`,
        user: `Database Schema:
${schemaJSON}

User Query: ${query}

Generate a SQL query to answer the user's question.`,
    };
}
