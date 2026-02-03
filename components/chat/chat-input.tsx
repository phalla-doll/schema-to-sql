'use client';

import { type KeyboardEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ModelSelector } from './model-selector';

interface ChatInputProps {
    model: string;
    onModelChange: (model: string) => void;
    onSend: (message: string) => void;
    disabled?: boolean;
}

export function ChatInput({ model, onModelChange, onSend, disabled = false }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        if (message.trim() && !disabled) {
            onSend(message.trim());
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        const textarea = e.target;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
    };

    return (
        <div className="space-y-2">
            <ModelSelector model={model} onModelChange={onModelChange} />
            <div className="flex gap-2">
                <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your database... (Cmd+Enter to send)"
                    disabled={disabled}
                    className="min-h-[60px] max-h-[200px] resize-none"
                />
                <Button type="button" onClick={handleSend} disabled={!message.trim() || disabled}>
                    Send
                </Button>
            </div>
        </div>
    );
}
