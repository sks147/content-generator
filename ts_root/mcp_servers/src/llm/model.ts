import { ChatOpenAI } from '@langchain/openai';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

export const llm: BaseChatModel = new ChatOpenAI({
	model: process.env['LLM_MODEL'] ?? 'Qwen3-4B-MLX-4bit',
	configuration: {
		baseURL:
			process.env['LLM_BASE_URL'] ??
			'http://host.docker.internal:11434/v1',
		apiKey: process.env['LLM_API_KEY'] ?? 'not-needed',
	},
});
