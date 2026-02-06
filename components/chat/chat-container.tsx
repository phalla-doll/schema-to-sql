'use client';

import { Message01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import type { Message } from '@/types';
import { MessageBubble } from './message-bubble';

interface ChatContainerProps {
    messages: Message[];
    isLoading?: boolean;
}

export function ChatContainer({ messages, isLoading = false }: ChatContainerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: Scroll on message/ loading changes
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages.length, isLoading]);

    if (messages.length === 0 && !isLoading) {
        return (
            <div className="flex h-full items-center justify-center px-6">
                <div className="w-full max-w-lg">
                    <div className="mb-6 flex justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-black px-4 dark:bg-white dark:px-4">
                            <HugeiconsIcon
                                icon={Message01Icon}
                                strokeWidth={2}
                                className="size-7 text-white dark:text-black"
                            />
                        </div>
                    </div>
                    <h3 className="mb-2 text-center text-lg font-semibold text-black dark:text-white">
                        Start a conversation
                    </h3>
                    <p className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        Ask questions about your database schema and get AI-generated SQL queries
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                        <span className="rounded-sm border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-400">
                            Find tables with...
                        </span>
                        <span className="rounded-sm border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-400">
                            List all columns...
                        </span>
                        <span className="rounded-sm border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-400">
                            Join tables...
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <ScrollArea className="flex-1 px-3 py-3">
            <div ref={scrollRef} className="space-y-1" aria-live="polite" aria-atomic="false">
                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex gap-2">
                            <div className="flex shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground size-8">
                                <HugeiconsIcon
                                    icon={SparklesIcon}
                                    strokeWidth={2}
                                    className="size-4"
                                />
                            </div>
                            <Card className="bg-muted/20 border-border">
                                <CardContent className="px-3 py-2">
                                    <div className="flex items-center gap-1.5">
                                        <Skeleton className="h-2 w-2 rounded-full" />
                                        <Skeleton className="h-2 w-2 rounded-full" />
                                        <Skeleton className="h-2 w-2 rounded-full" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </ScrollArea>
    );
}
