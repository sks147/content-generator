import { FastMCP } from 'fastmcp';
import { z } from 'zod';
import { generatePoemText } from './tools/generatePoem.ts';

const server = new FastMCP({
	name: 'poem-generator',
	version: '0.1.0',
});

server.addTool({
	name: 'generate_poem',
	description: 'Generate a poem based on a theme, style, and length',
	parameters: z.object({
		theme: z.string().describe('Subject or theme of the poem'),
		style: z
			.enum(['free_verse', 'haiku', 'sonnet', 'limerick', 'ballad'])
			.default('free_verse')
			.describe('Poetic form'),
		length: z
			.enum(['short', 'medium', 'long'])
			.default('medium')
			.describe('Approximate length'),
	}),
	execute: async (args) => {
		const poem = await generatePoemText(args.theme, args.style, args.length);
		return poem;
	},
});

server.start({
	transportType: 'httpStream',
	httpStream: { port: 3001, host: '0.0.0.0' },
});
