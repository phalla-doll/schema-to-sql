'use client';

import { ArrowRight01Icon, Setting06Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { type KeyboardEvent, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupText,
    InputGroupTextarea,
} from '@/components/ui/input-group';
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
        <div className="space-y-3">
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
                            variant="outline"
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
            <InputGroup>
                <InputGroupAddon align="block-start">
                    <InputGroupTextarea
                        ref={textareaRef}
                        value={message}
                        onChange={handleInput}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about your database… (Cmd+Enter to send)"
                        disabled={disabled}
                        className="min-h-[48px] max-h-[150px] resize-none"
                        name="message"
                        autoComplete="off"
                    />
                </InputGroupAddon>
                <div className="flex items-center gap-1 px-2 pb-2">
                    <InputGroupText className="text-[0.625rem] text-muted-foreground">
                        Cmd+Enter to send
                    </InputGroupText>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <InputGroupButton
                                type="button"
                                variant={message.trim() ? 'default' : 'ghost'}
                                onClick={handleSend}
                                disabled={!message.trim() || disabled}
                            >
                                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
                            </InputGroupButton>
                        </TooltipTrigger>
                        <TooltipContent>Send message</TooltipContent>
                    </Tooltip>
                </div>
            </InputGroup>
        </div>
    );
}
