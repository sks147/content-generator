import type { HttpRequest, HttpResponse } from 'uWebSockets.js';
import * as mcp from 'shared/mcp';
import * as utils from '../utils/index.ts';
import { generatePoem } from '../mcp/poems.ts';
import * as poemDb from '../db/poems.ts';

export async function createPoem(res: HttpResponse, req: HttpRequest) {
	res.onAborted(() => {
		res.aborted = true;
	});

	try {
		const body = await utils.readJson(res);
		const { theme, style, length } = body as {
			theme?: string;
			style?: string;
			length?: string;
		};

		if (!theme || typeof theme !== 'string') {
			utils.sendJson(res, '400 Bad Request', {
				error: 'theme is required',
			});
			return;
		}

		const content = await generatePoem(theme, style, length);
		const poem = await poemDb.insertPoem({
			theme,
			style: style ?? 'free_verse',
			length: length ?? 'medium',
			content,
		});

		utils.sendJson(res, '201 Created', poem);
	} catch (error) {
		if (error instanceof mcp.McpClientError) {
			console.error('Poem generation failed upstream:', error);
			utils.sendJson(res, '502 Bad Gateway', {
				error: 'Poem generation failed upstream',
			});
			return;
		}

		console.error('Unexpected error creating poem:', error);
		utils.sendJson(res, '500 Internal Server Error', {
			error: 'Failed to generate poem',
		});
	}
}

export async function listPoems(res: HttpResponse, req: HttpRequest) {
	res.onAborted(() => {
		res.aborted = true;
	});

	try {
		const query = req.getQuery();
		const params = new URLSearchParams(query);
		const limit = Math.min(
			parseInt(params.get('limit') ?? '20', 10),
			100,
		);
		const offset = parseInt(params.get('offset') ?? '0', 10);

		const result = await poemDb.listPoems(limit, offset);
		utils.sendJson(res, '200 OK', result);
	} catch {
		utils.sendJson(res, '500 Internal Server Error', {
			error: 'Failed to list poems',
		});
	}
}

export async function getPoem(res: HttpResponse, req: HttpRequest) {
	res.onAborted(() => {
		res.aborted = true;
	});

	try {
		const id = parseInt(req.getParameter(0) ?? '', 10);
		if (isNaN(id)) {
			utils.sendJson(res, '400 Bad Request', {
				error: 'Invalid poem ID',
			});
			return;
		}

		const poem = await poemDb.getPoemById(id);
		if (!poem) {
			utils.sendJson(res, '404 Not Found', {
				error: 'Poem not found',
			});
			return;
		}

		utils.sendJson(res, '200 OK', poem);
	} catch {
		utils.sendJson(res, '500 Internal Server Error', {
			error: 'Failed to get poem',
		});
	}
}
