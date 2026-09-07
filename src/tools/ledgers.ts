// Taxpayer ledger tools — require an active taxpayer session.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { GstClient } from "../sandbox/client.js";
import { jsonResult, errorResult } from "./shared.js";

export function registerLedgerTools(server: McpServer, client: GstClient): void {
  server.registerTool(
    "get_ledger_balance",
    {
      title: "Get cash + ITC balance",
      description:
        "Fetch the taxpayer's Cash and ITC ledger balances as on a return period (year/month). Requires an active taxpayer session.",
      inputSchema: {
        year: z.string().describe("4-digit year, e.g. 2026"),
        month: z.string().describe("2-digit month, e.g. 09"),
      },
    },
    async ({ year, month }) => {
      try {
        return jsonResult(await client.getLedgerBalance(year, month.padStart(2, "0")));
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "get_cash_ledger",
    {
      title: "Get cash ledger",
      description:
        "Fetch the electronic cash ledger transactions for a date range. Requires an active taxpayer session.",
      inputSchema: {
        from: z.string().describe("From date, DD/MM/YYYY"),
        to: z.string().describe("To date, DD/MM/YYYY"),
      },
    },
    async ({ from, to }) => {
      try {
        return jsonResult(await client.getCashLedger(from, to));
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "get_itc_ledger",
    {
      title: "Get ITC ledger",
      description:
        "Fetch the electronic Input Tax Credit (ITC) ledger transactions for a date range. Requires an active taxpayer session.",
      inputSchema: {
        from: z.string().describe("From date, DD/MM/YYYY"),
        to: z.string().describe("To date, DD/MM/YYYY"),
      },
    },
    async ({ from, to }) => {
      try {
        return jsonResult(await client.getItcLedger(from, to));
      } catch (err) {
        return errorResult(err);
      }
    }
  );
}
