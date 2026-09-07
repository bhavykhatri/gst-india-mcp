#!/usr/bin/env node
// GST India MCP server (stdio).
// stdout is reserved for the MCP protocol — log only to stderr.
import { readFileSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { GstClient } from "./sandbox/client.js";
import { registerAllTools } from "./tools/index.js";

const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as {
  name: string;
  version: string;
};

async function main(): Promise<void> {
  const config = loadConfig();

  const missing = (["apiKey", "apiSecret"] as const).filter((k) => !config[k]);
  if (missing.length) {
    console.error(
      `[warn] Missing Sandbox credentials: ${missing.join(", ")}. Tools will error until GST_API_KEY / GST_API_SECRET are set.`
    );
  }

  const client = new GstClient(config);
  const server = new McpServer({ name: pkg.name, version: pkg.version });
  registerAllTools(server, client, config);

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`${pkg.name} v${pkg.version} running on stdio`);

  const shutdown = async (): Promise<void> => {
    await server.close().catch(() => {});
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("Fatal error starting gst-india-mcp:", err);
  process.exit(1);
});
