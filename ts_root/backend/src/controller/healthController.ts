import type { HttpRequest, HttpResponse } from 'uWebSockets.js';
import * as utils from '../utils/index.ts';

export async function healthz(res: HttpResponse, req: HttpRequest) {
	try {
		utils.sendJson(res, '200 OK', {
			status: 'ok',
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		utils.sendJson(res, '500 Internal Server Error', {
			status: 'error',
			timestamp: new Date().toISOString(),
		});
	}
}
