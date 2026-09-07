// Taxpayer return tools — require an active taxpayer session.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { GstClient } from "../sandbox/client.js";
import { jsonResult, errorResult } from "./shared.js";

const period = {
  year: z.string().describe("4-digit year, e.g. 2026"),
  month: z.string().describe("2-digit month, e.g. 09"),
};

export function registerReturnTools(server: McpServer, client: GstClient): void {
  server.registerTool(
    "get_gstr3b",
    {
      title: "Get GSTR-3B",
      description:
        "Fetch GSTR-3B (monthly summary return) details for a return period. Requires an active taxpayer session.",
      inputSchema: period,
    },
    async ({ year, month }) => {
      try {
        return jsonResult(await client.getGstr3b(year, month.padStart(2, "0")));
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "get_gstr2b",
    {
      title: "Get GSTR-2B",
      description:
        "Fetch GSTR-2B (auto-drafted ITC statement of purchases) for a return period. Requires an active taxpayer session.",
      inputSchema: period,
    },
    async ({ year, month }) => {
      try {
        return jsonResult(await client.getGstr2b(year, month.padStart(2, "0")));
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "track_returns_current",
    {
      title: "Track returns (taxpayer)",
      description:
        "List the authenticated taxpayer's filed/pending returns for a return period. Requires an active taxpayer session.",
      inputSchema: period,
    },
    async ({ year, month }) => {
      try {
        return jsonResult(await client.taxpayerTrackReturns(year, month.padStart(2, "0")));
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "get_annual_turnover",
    {
      title: "Get annual aggregate turnover (AATO)",
      description:
        "Fetch the authenticated taxpayer's Annual Aggregate Turnover values. Requires an active taxpayer session.",
      inputSchema: {},
    },
    async () => {
      try {
        return jsonResult(await client.getAato());
      } catch (err) {
        return errorResult(err);
      }
    }
  );
}
