'use client';

import { Setting06Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { type KeyboardEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ModelSelector } from './model-selector';
import { SettingsDialog } from './settings-dialog';

interface ChatInputProps {
    model: string;
    onModelChange: (model: string) => void;
    onSend: (message: string) => void;
    disabled?: boolean;
    apiKey: string;
    customModels: string[];
    setApiKey: (key: string) => void;
    setCustomModels: (models: string[]) => void;
}

export function ChatInput({
    model,
    onModelChange,
    onSend,
    disabled = false,
    apiKey,
    customModels,
    setApiKey,
    setCustomModels,
}: ChatInputProps) {
    const [message, setMessage] = useState('');
    const [settingsOpen, setSettingsOpen] = useState(false);
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

    const handleSettingsSave = (newApiKey: string, newCustomModels: string[]) => {
        setApiKey(newApiKey);
        setCustomModels(newCustomModels);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <ModelSelector
                    model={model}
                    onModelChange={onModelChange}
                    apiKey={apiKey}
                    customModels={customModels}
                />
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setSettingsOpen(true)}
                >
                    <HugeiconsIcon icon={Setting06Icon} strokeWidth={2} />
                </Button>
                <SettingsDialog
                    open={settingsOpen}
                    onOpenChange={setSettingsOpen}
                    currentApiKey={apiKey}
                    currentCustomModels={customModels}
                    onSave={handleSettingsSave}
                />
            </div>
            <div className="flex gap-2">
                <Textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your database… (Cmd+Enter to send)"
                    disabled={disabled}
                    className="min-h-[60px] max-h-[200px] resize-none"
                    name="message"
                    autoComplete="off"
                />
                <Button type="button" onClick={handleSend} disabled={!message.trim() || disabled}>
                    Send
                </Button>
            </div>
        </div>
    );
}
