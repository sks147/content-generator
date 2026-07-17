export class McpClientError extends Error {
	constructor(message: string, options?: ErrorOptions) {
		super(message, options);
		this.name = 'McpClientError';
	}
}

export class McpConnectionError extends McpClientError {
	readonly serverUrl: string;

	constructor(serverUrl: string, options?: ErrorOptions) {
		super(`Failed to connect to MCP server at ${serverUrl}`, options);
		this.name = 'McpConnectionError';
		this.serverUrl = serverUrl;
	}
}

export class McpToolError extends McpClientError {
	readonly toolName: string;

	constructor(toolName: string, reason: string, options?: ErrorOptions) {
		super(`MCP tool "${toolName}" failed: ${reason}`, options);
		this.name = 'McpToolError';
		this.toolName = toolName;
	}
}
