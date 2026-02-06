'use client';

import { useEffect, useState } from 'react';

interface SchemaSearchProps {
    onSearch: (query: string) => void;
}

export function SchemaSearch({ onSearch }: SchemaSearchProps) {
    const [query, setQuery] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    const handleClear = () => {
        setQuery('');
        onSearch('');
    };

    return (
        <div className="relative">
            <input
                type="text"
                placeholder="Search tables and columns..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-sm border-2 border-gray-200 bg-white px-3 py-1.5 text-xs placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-black focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600 dark:focus-visible:border-white dark:focus-visible:ring-white/10 dark:focus-visible:ring-offset-dark"
            />
            {query && (
                <button
                    type="button"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 rounded-sm border border-gray-200 bg-white p-0 text-xs text-gray-400 hover:text-black hover:border-black dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-white dark:hover:text-black"
                    onClick={handleClear}
                >
                    ×
                </button>
            )}
        </div>
    );
}
