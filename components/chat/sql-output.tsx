'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SQLOutputProps {
    sql: string;
    dialect?: 'sqlserver' | 'mysql';
}

export function SQLOutput({ sql, dialect = 'mysql' }: SQLOutputProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(sql);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative mt-2 overflow-hidden rounded-lg bg-black text-white">
            <div className="flex items-center justify-between border-b border-gray-700 bg-gray-900 px-3 py-2">
                <Badge variant="outline" className="text-xs">
                    SQL {dialect.toUpperCase()}
                </Badge>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-6 text-xs"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </Button>
            </div>
            <pre className="overflow-x-auto p-4">
                <code>{sql}</code>
            </pre>
        </div>
    );
}
