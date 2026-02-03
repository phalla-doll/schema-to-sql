import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { normalizeSchema } from '@/lib/schema/normalizer';
import { createParser } from '@/lib/schema/parser';
import { DumpParser } from '@/lib/schema/parser-dump';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (
            !file.name.endsWith('.sql') &&
            !file.name.endsWith('.txt') &&
            !file.name.endsWith('.dump')
        ) {
            return NextResponse.json(
                { error: 'File must be a .sql, .txt, or .dump file' },
                { status: 400 }
            );
        }

        const sqlContent = await file.text();

        if (!sqlContent.trim()) {
            return NextResponse.json({ error: 'File is empty' }, { status: 400 });
        }

        const parser = createParser(sqlContent);
        const tables = parser.parse(sqlContent);

        let format: 'sqlserver' | 'mysql' | 'dump';
        if (parser instanceof DumpParser) {
            const dbms = (parser as unknown as { getDBMS: () => string }).getDBMS();
            const dbmsMap: Record<string, 'sqlserver' | 'mysql'> = {
                AZURE: 'sqlserver',
                SQLSERVER: 'sqlserver',
                MYSQL: 'mysql',
                POSTGRESQL: 'sqlserver',
            };
            format = dbmsMap[dbms] || 'dump';
        } else {
            format = parser.detect(sqlContent) ? 'sqlserver' : 'mysql';
        }

        const fileName = file.name
            .replace(/\.sql$/, '')
            .replace(/\.txt$/, '')
            .replace(/\.dump$/, '');

        const schema = normalizeSchema(tables, format, fileName);

        return NextResponse.json({ schema });
    } catch (error) {
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to process schema file',
            },
            { status: 500 }
        );
    }
}
