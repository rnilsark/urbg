# MCP servers used

## Git
https://github.com/modelcontextprotocol/servers/tree/main/src/git#usage-with-vs-code
- install uv (like npm for python, similar to pip but better and has uvx): winget install --id=astral-sh.uv  -e

## Postgres
https://github.com/modelcontextprotocol/servers/tree/main/src/postgres#npx

## Browser Tools
https://github.com/AgentDeskAI/browser-tools-mcp?tab=readme-ov-file#quickstart-guide
1. Install extension 
2. In cursor, add:
{
  "mcpServers": {
    "browser-tools": {
      "command": "npx",
      "args": ["@agentdeskai/browser-tools-mcp@latest"]
    }
  }
}
3. Run npx @agentdeskai/browser-tools-server@latest in a terminal, it will be the collector of logs
4. Open Developer Tools and find the BrowserTool MCP tab, it should connect to the server above and stream the developer stuff to the server
5. Use agent mode to use the tools