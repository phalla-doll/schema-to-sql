'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@/types';
import { MessageBubble } from './message-bubble';

interface ChatContainerProps {
    messages: Message[];
    isLoading?: boolean;
}

export function ChatContainer({ messages, isLoading = false }: ChatContainerProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, []);

    if (messages.length === 0 && !isLoading) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                <p className="text-center">Start by asking a question about your database schema</p>
            </div>
        );
    }

    return (
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
            {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && (
                <div className="flex justify-start">
                    <div className="rounded-lg bg-muted px-4 py-2">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-primary delay-100" />
                            <div className="h-2 w-2 animate-bounce rounded-full bg-primary delay-200" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
