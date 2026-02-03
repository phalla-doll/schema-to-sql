import type { ModelInfo } from '@/types';

export const AVAILABLE_MODELS: ModelInfo[] = [
    {
        id: 'openrouter/free',
        name: 'Free',
        provider: 'OpenRouter',
        isFree: true,
    },
    {
        id: 'openai/gpt-4',
        name: 'GPT-4',
        provider: 'OpenAI',
        isFree: false,
    },
    {
        id: 'anthropic/claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        isFree: false,
    },
    {
        id: 'meta-llama/llama-3.1-70b',
        name: 'Llama 3.1 70B',
        provider: 'Meta',
        isFree: true,
    },
];

export function getModelById(id: string): ModelInfo | undefined {
    return AVAILABLE_MODELS.find((model) => model.id === id);
}

export function getDefaultModel(): string {
    return 'openrouter/free';
}
