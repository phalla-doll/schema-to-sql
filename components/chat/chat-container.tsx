'use client';

import { Message01Icon, SparklesIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
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
            <div className="flex h-full items-center justify-center px-4">
                <Card className="border-dashed bg-muted/20 max-w-md text-center">
                    <CardContent className="space-y-3 px-6 py-8">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
                            <HugeiconsIcon
                                icon={Message01Icon}
                                strokeWidth={2}
                                className="size-6 text-primary"
                            />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-semibold">Start a conversation</h3>
                            <p className="text-xs text-muted-foreground">
                                Ask questions about your database schema and get AI-generated SQL
                                queries
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            <Badge variant="outline" className="h-5 text-[0.625rem]">
                                Find tables with...
                            </Badge>
                            <Badge variant="outline" className="h-5 text-[0.625rem]">
                                List all columns...
                            </Badge>
                            <Badge variant="outline" className="h-5 text-[0.625rem]">
                                Join tables...
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
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
