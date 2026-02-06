'use client';

import { User02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { Message } from '@/types';
import { SQLOutput } from './sql-output';

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} max-w-[85%]`}>
                <div
                    className={`flex shrink-0 items-center justify-center rounded-sm ${
                        isUser
                            ? 'bg-black text-white dark:bg-white dark:text-black'
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    } size-8`}
                >
                    <HugeiconsIcon icon={User02Icon} strokeWidth={2} className="size-3.5" />
                </div>
                <div
                    data-slot="message-bubble"
                    data-role={message.role}
                    className={`flex max-w-full flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                    <div className="rounded-sm border-2 border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
                        <div className="mb-2 flex items-center gap-2">
                            {message.sql && (
                                <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                    SQL
                                </span>
                            )}
                        </div>
                        <p className="mb-3 text-sm leading-relaxed text-black dark:text-white">
                            {message.content}
                        </p>
                        {message.sql && <SQLOutput sql={message.sql} />}
                        <p className="text-xs text-gray-400 dark:text-gray-600">
                            {new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(
                                new Date(message.timestamp)
                            )}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
