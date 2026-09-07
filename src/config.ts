// Loads and validates GST (Sandbox/Quicko) configuration from environment variables.
// A minimal .env loader is included for local development (no dotenv dependency).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export interface GstConfig {
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  apiVersion: string;
  username: string;
  gstin: string;
  taxpayerToken: string;
}

function loadDotEnv(): void {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // No .env file — rely on the host-provided environment.
  }
}

export function loadConfig(): GstConfig {
  loadDotEnv();
  return {
    apiKey: process.env.GST_API_KEY ?? "",
    apiSecret: process.env.GST_API_SECRET ?? "",
    baseUrl: process.env.GST_BASE_URL ?? "https://api.sandbox.co.in",
    apiVersion: process.env.GST_API_VERSION ?? "1.0",
    username: process.env.GST_USERNAME ?? "",
    gstin: process.env.GST_GSTIN ?? "",
    taxpayerToken: process.env.GST_TAXPAYER_TOKEN ?? "",
  };
}
