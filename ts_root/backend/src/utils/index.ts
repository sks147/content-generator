import type { HttpResponse } from 'uWebSockets.js';
import { applySecurityHeaders } from '../middleware/security.ts';

export async function readJson(res: HttpResponse): Promise<any> {
	const buffer = await new Promise<Buffer>((resolve, reject) => {
		const chunks: Buffer[] = [];
		res.onData((chunk, isLast) => {
			chunks.push(Buffer.from(chunk));
			if (isLast) {
				resolve(Buffer.concat(chunks));
			}
		});
		res.onAborted(() => {
			reject(new Error('Request aborted'));
		});
	});
	return JSON.parse(buffer.toString());
}

export function sendJson(
	res: HttpResponse,
	statusCode: string,
	data: any,
): void {
	if (res.aborted) {
		return;
	}
	res.cork(() => {
		res.writeStatus(statusCode);

		if ((res as any)._applySecurityHeaders) {
			applySecurityHeaders(res);
		}

		res.writeHeader('Content-Type', 'application/json').end(
			JSON.stringify(data),
		);
	});
}
