// Registers every MCP tool on the server.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GstClient } from "../sandbox/client.js";
import type { GstConfig } from "../config.js";
import { registerPublicTools } from "./public.js";
import { registerSessionTools } from "./session.js";
import { registerReturnTools } from "./returns.js";
import { registerLedgerTools } from "./ledgers.js";

export function registerAllTools(server: McpServer, client: GstClient, config: GstConfig): void {
  registerPublicTools(server, client);
  registerSessionTools(server, client, config);
  registerReturnTools(server, client);
  registerLedgerTools(server, client);
}
