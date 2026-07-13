import type { HttpRequest, HttpResponse } from 'uWebSockets.js';

export function applySecurityHeaders(res: HttpResponse) {
	res.writeHeader('Access-Control-Allow-Origin', '*');
	res.writeHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PUT, DELETE, OPTIONS',
	);
	res.writeHeader(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization',
	);

	res.writeHeader(
		'Content-Security-Policy',
		"default-src 'self';base-uri 'self';font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self';script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests",
	);
	res.writeHeader('Cross-Origin-Opener-Policy', 'same-origin');
	res.writeHeader('Cross-Origin-Resource-Policy', 'same-origin');
	res.writeHeader('Origin-Agent-Cluster', '?1');
	res.writeHeader('Referrer-Policy', 'no-referrer');
	res.writeHeader(
		'Strict-Transport-Security',
		'max-age=15552000; includeSubDomains',
	);
	res.writeHeader('X-Content-Type-Options', 'nosniff');
	res.writeHeader('X-DNS-Prefetch-Control', 'off');
	res.writeHeader('X-Download-Options', 'noopen');
	res.writeHeader('X-Frame-Options', 'SAMEORIGIN');
	res.writeHeader('X-Permitted-Cross-Domain-Policies', 'none');
	res.writeHeader('X-XSS-Protection', '0');
}

export function withSecurityHeaders(
	handler: (res: HttpResponse, req: HttpRequest) => void | Promise<void>,
) {
	return (res: HttpResponse, req: HttpRequest) => {
		(res as any)._applySecurityHeaders = true;
		return handler(res, req);
	};
}
