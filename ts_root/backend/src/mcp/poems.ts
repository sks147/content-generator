import * as mcp from 'shared/mcp';

const serverUrl =
	process.env['MCP_SERVER_URL'] ?? 'http://mcp-server:3001';

const client = new mcp.McpClient(serverUrl);

export async function generatePoem(
	theme: string,
	style?: string,
	length?: string,
): Promise<string> {
	return client.callTool(mcp.MCP_TOOLS.GENERATE_POEM, {
		theme,
		style: style ?? 'free_verse',
		length: length ?? 'medium',
	});
}
