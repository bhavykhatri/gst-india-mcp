// Taxpayer session tools — OTP-based authentication for a specific GSTIN.
// Requires "Manage API Access" enabled on gst.gov.in for the GSTIN.
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { GstClient } from "../sandbox/client.js";
import type { GstConfig } from "../config.js";
import { jsonResult, errorResult } from "./shared.js";

export function registerSessionTools(
  server: McpServer,
  client: GstClient,
  config: GstConfig
): void {
  server.registerTool(
    "taxpayer_generate_otp",
    {
      title: "Generate taxpayer OTP",
      description:
        "Step 1 of a taxpayer session. Sends an OTP to the taxpayer's GST-registered mobile/email. Uses GST_USERNAME/GST_GSTIN from config unless overridden. Requires API access enabled on gst.gov.in.",
      inputSchema: {
        username: z
          .string()
          .optional()
          .describe("GST portal username (defaults to GST_USERNAME)"),
        gstin: z.string().optional().describe("GSTIN (defaults to GST_GSTIN)"),
      },
    },
    async ({ username, gstin }) => {
      try {
        const u = username || config.username;
        const g = gstin || config.gstin;
        if (!u || !g) {
          return errorResult(
            new Error("username and gstin are required (set GST_USERNAME / GST_GSTIN or pass them).")
          );
        }
        return jsonResult(await client.generateOtp(u, g));
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "taxpayer_verify_otp",
    {
      title: "Verify taxpayer OTP",
      description:
        "Step 2 of a taxpayer session. Verifies the OTP and starts a ~6-hour taxpayer session held in memory for subsequent taxpayer_* / get_gstr* / ledger tools.",
      inputSchema: {
        otp: z.string().describe("The OTP received on the registered mobile/email"),
        username: z.string().optional().describe("GST portal username (defaults to GST_USERNAME)"),
        gstin: z.string().optional().describe("GSTIN (defaults to GST_GSTIN)"),
      },
    },
    async ({ otp, username, gstin }) => {
      try {
        const u = username || config.username;
        const g = gstin || config.gstin;
        if (!u || !g) {
          return errorResult(
            new Error("username and gstin are required (set GST_USERNAME / GST_GSTIN or pass them).")
          );
        }
        return jsonResult(await client.verifyOtp(otp.trim(), u, g));
      } catch (err) {
        return errorResult(err);
      }
    }
  );

  server.registerTool(
    "taxpayer_session_status",
    {
      title: "Taxpayer session status",
      description:
        "Reports whether an active taxpayer session exists in this server process.",
      inputSchema: {},
    },
    async () => {
      return jsonResult({
        active: client.hasTaxpayerSession(),
        gstin: config.gstin || null,
      });
    }
  );
}
