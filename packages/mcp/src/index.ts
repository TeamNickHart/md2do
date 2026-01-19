#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { registerTools } from './tools/index.js';
import { registerResources } from './resources/task-resources.js';
import { registerPrompts } from './prompts/templates.js';

/**
 * Main MCP server for md2do
 * Provides task querying and management capabilities via the Model Context Protocol
 */
async function main() {
  // Create server instance
  const server = new Server(
    {
      name: 'md2do-mcp',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    },
  );

  // Register all handlers
  registerTools(server);
  registerResources(server);
  registerPrompts(server);

  // Set up error handling
  server.onerror = (error) => {
    console.error('[MCP Error]', error);
  };

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('md2do MCP server running on stdio');
}

// Run server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
