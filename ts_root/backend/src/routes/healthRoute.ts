import type { TemplatedApp } from 'uWebSockets.js';
import * as healthController from '../controller/healthController.ts';
import * as securityMiddleware from '../middleware/security.ts';

export function setupHealthRoutes(app: TemplatedApp) {
	app.get(
		'/api/healthz',
		securityMiddleware.withSecurityHeaders(healthController.healthz),
	);
}
