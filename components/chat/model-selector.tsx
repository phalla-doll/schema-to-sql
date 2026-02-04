'use client';

import { memo, useMemo } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AVAILABLE_MODELS } from '@/lib/ai/model-selector';
import type { ModelInfo } from '@/types';

interface ModelSelectorProps {
    model: string;
    onModelChange: (model: string) => void;
}

export const ModelSelector = memo(function ModelSelector({
    model,
    onModelChange,
}: ModelSelectorProps) {
    const modelItems = useMemo(
        () =>
            AVAILABLE_MODELS.map((modelInfo: ModelInfo) => (
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
        []
    );

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Model:</span>
            <Select value={model} onValueChange={onModelChange}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>{modelItems}</SelectContent>
            </Select>
        </div>
    );
});
