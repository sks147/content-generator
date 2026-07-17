import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { MCP_CLIENT_NAME, MCP_CLIENT_VERSION } from '../constants/mcp.ts';
import { McpConnectionError, McpToolError } from '../errors/mcpError.ts';
import type { McpTextContent, McpToolArgs } from '../types/mcp.ts';

const isTextContent = (value: unknown): value is McpTextContent => {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	const candidate = value as Partial<McpTextContent>;
	return candidate.type === 'text' && typeof candidate.text === 'string';
};

const extractText = (toolName: string, content: unknown): string => {
	if (!Array.isArray(content)) {
		throw new McpToolError(toolName, 'result had no content blocks');
	}

	const [first] = content;
	if (!isTextContent(first)) {
		throw new McpToolError(toolName, 'result had no text content');
	}

	return first.text;
};

export class McpClient {
	private serverUrl: string;

	constructor(serverUrl: string) {
		this.serverUrl = serverUrl;
	}

	async callTool(name: string, args: McpToolArgs): Promise<string> {
		const client = new Client({
			name: MCP_CLIENT_NAME,
			version: MCP_CLIENT_VERSION,
		});
		const transport = new StreamableHTTPClientTransport(
			new URL(`${this.serverUrl}/mcp`),
		);

		try {
			await client.connect(transport);
		} catch (cause) {
			throw new McpConnectionError(this.serverUrl, { cause });
		}

		try {
			const result = await client.callTool({ name, arguments: args });
			return extractText(name, result.content);
		} catch (cause) {
			if (cause instanceof McpToolError) {
				throw cause;
			}
			throw new McpToolError(name, 'invocation failed', { cause });
		} finally {
			await client.close();
		}
	}
}
