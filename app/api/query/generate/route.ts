import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDefaultModel } from '@/lib/ai/model-selector';
import { generateSQL } from '@/lib/ai/sqlGenerator';
import { validateSQL } from '@/lib/ai/sqlValidator';
import { matchSchema } from '@/lib/schema/matcher';
import { validateSchema } from '@/lib/schema/validator';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query, schema, model, apiKey } = body;

        if (!query || !schema) {
            return NextResponse.json({ error: 'Query and schema are required' }, { status: 400 });
        }

        const schemaValidation = validateSchema(schema);
        if (!schemaValidation.isValid) {
            return NextResponse.json({ error: schemaValidation.error }, { status: 400 });
        }

        if (!apiKey) {
            return NextResponse.json(
                { error: 'API key is required. Please configure it in settings.' },
                { status: 400 }
            );
        }

        const matchedSchema = matchSchema(query, schema);

        const context = {
            query,
            schema: matchedSchema,
            dialect: schema.format,
            model: model || getDefaultModel(),
        };

        const result = await generateSQL(context, apiKey);

        const usedTables = matchedSchema.tables.map((t) => t.name);
        const validation = validateSQL(result.sql, schema, usedTables);

        if (!validation.isValid) {
            return NextResponse.json(
                {
                    error: 'Generated SQL is invalid',
                    details: validation.errors,
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            sql: result.sql,
            explanation: result.explanation,
            usedTables,
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to generate SQL query',
            },
            { status: 500 }
        );
    }
}
