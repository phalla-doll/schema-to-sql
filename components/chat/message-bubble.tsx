'use client';

import type { Message } from '@/types';
import { SQLOutput } from './sql-output';

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
            >
                <p className="mb-2 text-sm">{message.content}</p>
                {message.sql && <SQLOutput sql={message.sql} />}
                <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
}
