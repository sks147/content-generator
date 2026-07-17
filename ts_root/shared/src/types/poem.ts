export interface PoemInput {
	theme: string;
	style: string;
	length: string;
	content: string;
}

export interface Poem extends PoemInput {
	id: number;
	created_at: string;
}

export interface PoemListResponse {
	poems: Poem[];
	total: number;
}

export interface CreatePoemParams {
	theme: string;
	style?: string;
	length?: string;
}

export type PoemStyle = (typeof POEM_STYLES)[number]['value'];
export type PoemLength = (typeof POEM_LENGTHS)[number]['value'];

export const POEM_STYLES = [
	{ value: 'free_verse', label: 'Free Verse' },
	{ value: 'haiku', label: 'Haiku' },
	{ value: 'sonnet', label: 'Sonnet' },
	{ value: 'limerick', label: 'Limerick' },
	{ value: 'ballad', label: 'Ballad' },
] as const;

export const POEM_LENGTHS = [
	{ value: 'short', label: 'Short (4-8 lines)' },
	{ value: 'medium', label: 'Medium (8-16 lines)' },
	{ value: 'long', label: 'Long (16-32 lines)' },
] as const;
