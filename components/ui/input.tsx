import type * as React from 'react';

import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                'h-9 w-full rounded-sm border-2 border-gray-200 bg-white px-3.5 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-black focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600 dark:focus-visible:border-white dark:focus-visible:ring-white/10 dark:focus-visible:ring-offset-dark',
                className
            )}
            {...props}
        />
    );
}

export { Input };
