'use client';

import { useState } from 'react';

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
        <div className="mt-2 overflow-hidden rounded-sm border-2 border-gray-200 bg-gray-900 dark:border-gray-700 dark:bg-black">
            <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-3 py-2 dark:border-gray-600 dark:bg-gray-950">
                <span className="text-xs font-semibold text-white dark:text-gray-200">
                    SQL {dialect.toUpperCase()}
                </span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="text-xs font-medium text-white hover:text-blue-400 dark:text-gray-300 dark:hover:text-blue-300"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="overflow-x-auto p-4">
                <code className="text-xs text-gray-300 dark:text-gray-400">{sql}</code>
            </pre>
        </div>
    );
}
