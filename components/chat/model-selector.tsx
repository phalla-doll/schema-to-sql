'use client';

import { memo, useMemo } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getAvailableModels } from '@/lib/ai/model-selector';
import type { ModelInfo } from '@/types';

interface ModelSelectorProps {
    model: string;
    onModelChange: (model: string) => void;
    apiKey: string;
    customModels: string[];
}

export const ModelSelector = memo(function ModelSelector({
    model,
    onModelChange,
    apiKey,
    customModels,
}: ModelSelectorProps) {
    const availableModels = useMemo(
        () => getAvailableModels(apiKey, customModels),
        [apiKey, customModels]
    );

    const modelItems = useMemo(
        () =>
            availableModels.map((modelInfo: ModelInfo) => (
                <SelectItem key={modelInfo.id} value={modelInfo.id}>
                    <div className="flex items-center gap-2">
                        <span>{modelInfo.name}</span>
                        {modelInfo.isFree && (
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                                Free
                            </span>
                        )}
                    </div>
                </SelectItem>
            )),
        [availableModels]
    );

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Model:</span>
            <Select value={model} onValueChange={onModelChange} disabled={!apiKey}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={!apiKey ? 'Configure API Key' : 'Select a model'} />
                </SelectTrigger>
                <SelectContent>{modelItems}</SelectContent>
            </Select>
        </div>
    );
});
