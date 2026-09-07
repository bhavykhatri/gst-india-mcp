// Public GST tools — no OTP session required (use the Sandbox API token only).
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { GstClient } from "../sandbox/client.js";
import { jsonResult, errorResult } from "./shared.js";

export function registerPublicTools(server: McpServer, client: GstClient): void {
  server.registerTool(
    "verify_gstin",
    {
      title: "Verify GSTIN",
      description:
        "Verify a GST-registered business by its 15-character GSTIN. Returns legal/trade name, status, taxpayer type, constitution, e-invoice enablement, and registered address. No taxpayer session required.",
      inputSchema: {
        gstin: z.string().describe("15-character GSTIN, e.g. 29AFSPB9500E1ZY"),
      },
    },
    async ({ gstin }) => {
      try {
        return jsonResult(await client.verifyGstin(gstin.trim()));
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "search_gstin_by_pan",
    {
      title: "Search GSTINs by PAN",
      description:
        "Find all GSTINs registered against a PAN across states. Useful to discover a business's registrations. No taxpayer session required.",
      inputSchema: {
        pan: z.string().describe("10-character PAN, e.g. AAACJ2440E"),
      },
    },
    async ({ pan }) => {
      try {
        return jsonResult(await client.searchGstinByPan(pan.trim()));
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "track_gst_returns",
    {
      title: "Track GST returns (public)",
      description:
        "Check the GST return filing status/history for a GSTIN (GSTR-1, GSTR-3B, etc.). Optionally filter by financial year (e.g. 2025-26). No taxpayer session required.",
      inputSchema: {
        gstin: z.string().describe("15-character GSTIN"),
        financial_year: z
          .string()
          .optional()
          .describe("Financial year like 2025-26 (optional)"),
      },
    },
    async ({ gstin, financial_year }) => {
      try {
        return jsonResult(await client.trackReturnsPublic(gstin.trim(), financial_year));
      } catch (err) {
        return errorResult(err);
      }
    }
  );
}
