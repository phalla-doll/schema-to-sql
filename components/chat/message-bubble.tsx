'use client';

import { User02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Message } from '@/types';
import { SQLOutput } from './sql-output';

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
            <div className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-[85%]`}>
                <div
                    className={`flex shrink-0 items-center justify-center rounded-md ${
                        isUser
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                    } size-8`}
                >
                    <HugeiconsIcon icon={User02Icon} strokeWidth={2} className="size-4" />
                </div>
                <Card
                    data-slot="message-bubble"
                    data-role={message.role}
                    className={`${
                        isUser
                            ? 'bg-primary/10 border-primary/40 dark:bg-primary/15 dark:border-primary/50'
                            : 'bg-muted/30 border-border'
                    }`}
                >
                    <CardContent className="px-3 py-2">
                        <div className="mb-1.5 flex items-center gap-2">
                            {message.sql && (
                                <Badge
                                    variant="secondary"
                                    className="h-4.5 px-1.5 py-0 text-[0.5625rem]"
                                >
                                    SQL
                                </Badge>
                            )}
                        </div>
                        <p className="mb-2 text-xs leading-relaxed text-foreground">
                            {message.content}
                        </p>
                        {message.sql && <SQLOutput sql={message.sql} />}
                        <p className="mt-2 text-[0.625rem] text-muted-foreground">
                            {new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(
                                new Date(message.timestamp)
                            )}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
