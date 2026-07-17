import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { llm } from '../llm/model.ts';

const LENGTH_GUIDANCE: Record<string, string> = {
	short: '4-8 lines',
	medium: '8-16 lines',
	long: '16-32 lines',
};

export async function generatePoemText(
	theme: string,
	style: string,
	length: string,
): Promise<string> {
	const response = await llm.invoke([
		new SystemMessage(
			'You are a poet. Return only the poem text, no titles, labels, or commentary.',
		),
		new HumanMessage(
			`Write a ${style.replace('_', ' ')} poem about "${theme}". Target length: ${LENGTH_GUIDANCE[length] ?? '8-16 lines'}.`,
		),
	]);
	return typeof response.content === 'string' ? response.content : '';
}
