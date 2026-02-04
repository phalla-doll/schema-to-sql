'use client';

import { Add01Icon, Delete01Icon, EyeIcon, ViewOffSlashIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from '@/components/ui/input-group';
import { Separator } from '@/components/ui/separator';

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    currentApiKey: string;
    currentCustomModels: string[];
    onSave: (apiKey: string, customModels: string[]) => void;
}

export function SettingsDialog({
    open,
    onOpenChange,
    currentApiKey,
    currentCustomModels,
    onSave,
}: SettingsDialogProps) {
    const [apiKey, setApiKey] = useState(currentApiKey);
    const [showApiKey, setShowApiKey] = useState(false);
    const [newCustomModel, setNewCustomModel] = useState('');
    const [customModels, setCustomModelsState] = useState<string[]>(currentCustomModels);

    const handleSave = () => {
        if (!apiKey.trim()) {
            toast.error('API key is required');
            return;
        }
        onSave(apiKey, customModels);
        toast.success('Settings saved successfully');
        onOpenChange(false);
    };

    const handleAddCustomModel = () => {
        const trimmed = newCustomModel.trim();
        if (!trimmed) {
            toast.error('Model ID is required');
            return;
        }
        if (customModels.includes(trimmed)) {
            toast.error('Model already exists');
            return;
        }
        setCustomModelsState((prev) => [...prev, trimmed]);
        setNewCustomModel('');
    };

    const handleRemoveCustomModel = (modelId: string) => {
        setCustomModelsState((prev) => prev.filter((m) => m !== modelId));
    };

    const handleCancel = () => {
        setApiKey(currentApiKey);
        setCustomModelsState(currentCustomModels);
        setNewCustomModel('');
        setShowApiKey(false);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>AI Settings</DialogTitle>
                    <DialogDescription>
                        Configure your OpenRouter API key and custom models
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <Field>
                        <FieldLabel>OpenRouter API Key</FieldLabel>
                        <FieldContent>
                            <InputGroup>
                                <InputGroupInput
                                    type={showApiKey ? 'text' : 'password'}
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="sk-or-..."
                                    className="font-mono text-xs"
                                />
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setShowApiKey(!showApiKey)}
                                    >
                                        <HugeiconsIcon
                                            icon={showApiKey ? EyeIcon : ViewOffSlashIcon}
                                            strokeWidth={2}
                                        />
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
                        </FieldContent>
                    </Field>

                    <Separator />

                    <Field>
                        <FieldLabel>Custom Models</FieldLabel>
                        <FieldContent>
                            {customModels.length > 0 && (
                                <div className="mb-3 space-y-2">
                                    {customModels.map((modelId) => (
                                        <div
                                            key={modelId}
                                            className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2"
                                        >
                                            <span className="text-xs font-mono">{modelId}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => handleRemoveCustomModel(modelId)}
                                            >
                                                <HugeiconsIcon
                                                    icon={Delete01Icon}
                                                    strokeWidth={2}
                                                />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <InputGroup>
                                <InputGroupInput
                                    value={newCustomModel}
                                    onChange={(e) => setNewCustomModel(e.target.value)}
                                    placeholder="e.g., anthropic/claude-3-5-sonnet"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddCustomModel();
                                        }
                                    }}
                                    className="font-mono text-xs"
                                />
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                        type="button"
                                        variant="ghost"
                                        onClick={handleAddCustomModel}
                                    >
                                        <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                                    </InputGroupButton>
                                </InputGroupAddon>
                            </InputGroup>
                        </FieldContent>
                    </Field>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleSave}>
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
