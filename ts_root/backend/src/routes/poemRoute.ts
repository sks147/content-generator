import type { TemplatedApp } from 'uWebSockets.js';
import * as poemController from '../controller/poemController.ts';
import * as securityMiddleware from '../middleware/security.ts';

export function setupPoemRoutes(app: TemplatedApp) {
	app.post(
		'/api/poems',
		securityMiddleware.withSecurityHeaders(poemController.createPoem),
	);
	app.get(
		'/api/poems/:id',
		securityMiddleware.withSecurityHeaders(poemController.getPoem),
	);
	app.get(
		'/api/poems',
		securityMiddleware.withSecurityHeaders(poemController.listPoems),
	);
}
