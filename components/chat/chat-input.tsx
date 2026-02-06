'use client';

import { ArrowRight01Icon, Setting06Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { type KeyboardEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <ModelSelector
                    model={model}
                    onModelChange={onModelChange}
                    apiKey={apiKey}
                    customModels={customModels}
                />
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setSettingsOpen(true)}
                        >
                            <HugeiconsIcon icon={Setting06Icon} strokeWidth={2} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Settings</TooltipContent>
                </Tooltip>
                <SettingsDialog
                    open={settingsOpen}
                    onOpenChange={setSettingsOpen}
                    currentApiKey={apiKey}
                    currentCustomModels={customModels}
                    onSave={handleSettingsSave}
                />
            </div>
            <div className="space-y-2">
                <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your database… (Cmd+Enter to send)"
                    disabled={disabled}
                    className="w-full rounded-sm border-2 border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-black focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600 dark:focus-visible:border-white dark:focus-visible:ring-white/10 dark:focus-visible:ring-offset-dark"
                />
                <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 dark:text-gray-600">
                        Cmd+Enter to send
                    </span>
                    <Button
                        type="button"
                        variant={message.trim() ? 'default' : 'ghost'}
                        onClick={handleSend}
                        disabled={!message.trim() || disabled}
                    >
                        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="mr-1.5" />
                        Send
                    </Button>
                </div>
            </div>
        </div>
    );
}
