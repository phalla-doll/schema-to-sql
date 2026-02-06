import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type * as React from 'react';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
    "focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-2 dark:focus-visible:ring-white/10 focus-visible:ring-offset-dark aria-invalid:ring-2 dark:aria-invalid:ring-2 dark:aria-invalid:ring-white/10 aria-invalid:ring-offset-2 rounded-sm border font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg:not([class*='size-')]:size-3.5 inline-flex items-center justify-center whitespace-nowrap outline-none group/button select-none",
    {
        variants: {
            variant: {
                default:
                    'bg-black text-white hover:bg-gray-900 active:bg-gray-800 aria-expanded:bg-gray-900 aria-expanded:text-white',
                outline:
                    'border-2 border-black/10 bg-white text-black dark:border-white/10 dark:bg-transparent dark:text-white dark:active:bg-white/5 dark:hover:bg-white/5 aria-expanded:border-black dark:aria-expanded:border-white',
                secondary:
                    'bg-gray-100 text-black hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 aria-expanded:bg-gray-200 dark:aria-expanded:bg-white/10 aria-expanded:text-black dark:aria-expanded:text-white',
                ghost: 'hover:bg-black/5 hover:text-black dark:hover:bg-white/5 dark:hover:text-white aria-expanded:bg-black/5 dark:aria-expanded:bg-white/5 aria-expanded:text-black dark:aria-expanded:text-white',
                destructive:
                    'bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 focus-visible:ring-red-500/30 dark:focus-visible:ring-red-500/50',
                link: 'text-black underline-offset-4 hover:underline dark:text-white',
            },
            size: {
                default:
                    "h-9 px-4 text-sm font-medium has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-')]:size-4",
                xs: "h-6 rounded-sm px-2.5 text-xs font-medium has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-')]:size-3",
                sm: "h-7 rounded-sm px-3 text-sm font-medium has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-')]:size-3.5",
                lg: "h-10 rounded-sm px-5 text-sm font-medium has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3 [&_svg:not([class*='size-')]:size-4.5",
                icon: "h-9 w-9 [&_svg:not([class*='size-')]:size-4",
                'icon-xs': "h-7 w-7 rounded-sm [&_svg:not([class*='size-')]:size-3",
                'icon-sm': "h-8 w-8 [&_svg:not([class*='size-')]:size-3.5",
                'icon-lg': "h-10 w-10 [&_svg:not([class*='size-')]:size-4.5",
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
);

function Button({
    className,
    variant = 'default',
    size = 'default',
    asChild = false,
    ...props
}: React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot.Root : 'button';

    return (
        <Comp
            data-slot="button"
            data-variant={variant}
            data-size={size}
            className={cn(buttonVariants({ variant, size, className }))}
            {...props}
        />
    );
}

export { Button, buttonVariants };
