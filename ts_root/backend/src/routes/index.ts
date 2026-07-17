import type { TemplatedApp } from 'uWebSockets.js';
import { setupHealthRoutes } from './healthRoute.ts';
import { setupPoemRoutes } from './poemRoute.ts';

export const setupRoutes = (app: TemplatedApp) => {
	setupHealthRoutes(app);
	setupPoemRoutes(app);
};
