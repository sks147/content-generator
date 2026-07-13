import uWebSockets from 'uWebSockets.js';
import config from './config/config.json' with { type: 'json' };
import * as securityMiddleware from './middleware/security.ts';
import { setupRoutes } from './routes/index.ts';

const app = uWebSockets.App();

app.options('/*', (res, req) => {
	securityMiddleware.applySecurityHeaders(res);
	res.writeStatus('204 No Content').end();
});

const port: number = config.port || 3000;

setupRoutes(app);

async function startServer() {
	console.log(`\nStarting ${config.serviceName} server...`);
	console.log('='.repeat(50));

	app.listen(port, (listenSocket) => {
		if (listenSocket) {
			console.log(`\n${'='.repeat(50)}`);
			console.log(`${config.serviceName} server started successfully!`);
			console.log(`Server listening on port ${port}`);
			console.log(
				`Health check: http://localhost:${port}/api/healthz`,
			);
			console.log('='.repeat(50));
		} else {
			console.error(`Failed to listen on port ${port}`);
			process.exit(1);
		}
	});
}

process.on('SIGTERM', async () => {
	console.log('\nReceived SIGTERM, shutting down gracefully...');
	process.exit(0);
});

process.on('SIGINT', async () => {
	console.log('\nReceived SIGINT, shutting down gracefully...');
	process.exit(0);
});

(async () => {
	await startServer().catch((error) => {
		console.error('Failed to start server:', error);
		process.exit(1);
	});
})();
