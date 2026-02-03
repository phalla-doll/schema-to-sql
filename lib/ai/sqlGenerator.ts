import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import type { PromptContext } from './promptBuilder';
import { buildPrompt } from './promptBuilder';

export async function generateSQL(
    context: PromptContext,
    apiKey: string
): Promise<{ sql: string; explanation?: string }> {
    const { system, user } = buildPrompt(context);

    const openai = createOpenAI({
        apiKey,
        baseURL: 'https://openrouter.ai/api/v1',
    });

    try {
        const result = await generateText({
            model: openai(context.model),
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: user },
            ],
            temperature: 0.3,
        });

        const content = result.text.trim();
        const sqlMatch = content.match(/```sql\n([\s\S]*?)\n```/) || content.match(/([\s\S]+)/);

        return {
            sql: sqlMatch ? sqlMatch[1].trim() : content,
        };
    } catch (error) {
        throw new Error(
            `Failed to generate SQL: ${error instanceof Error ? error.message : String(error)}`
        );
    }
}
