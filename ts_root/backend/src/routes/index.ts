import type { TemplatedApp } from 'uWebSockets.js';
import { setupHealthRoutes } from './healthRoute.ts';

export const setupRoutes = (app: TemplatedApp) => {
	setupHealthRoutes(app);
};
