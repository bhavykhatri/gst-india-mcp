import { test } from "node:test";
import assert from "node:assert/strict";
import { GstClient } from "../src/sandbox/client.js";
import { loadConfig } from "../src/config.js";

function clientWith(overrides: Record<string, string> = {}): GstClient {
  for (const k of Object.keys(process.env)) if (k.startsWith("GST_")) delete process.env[k];
  Object.assign(process.env, overrides);
  return new GstClient(loadConfig());
}

test("public calls fail fast without API credentials", async () => {
  const client = clientWith();
  await assert.rejects(() => client.verifyGstin("29AFSPB9500E1ZY"), /Missing Sandbox credentials/);
});

test("taxpayer calls fail without a session", async () => {
  const client = clientWith({ GST_API_KEY: "k", GST_API_SECRET: "s" });
  await assert.rejects(() => client.getLedgerBalance("2026", "09"), /No taxpayer session/);
});

test("GST_TAXPAYER_TOKEN seeds an active session", () => {
  const client = clientWith({ GST_API_KEY: "k", GST_API_SECRET: "s", GST_TAXPAYER_TOKEN: "tok" });
  assert.equal(client.hasTaxpayerSession(), true);
});

test("setTaxpayerToken activates a session", () => {
  const client = clientWith({ GST_API_KEY: "k", GST_API_SECRET: "s" });
  assert.equal(client.hasTaxpayerSession(), false);
  client.setTaxpayerToken("tok");
  assert.equal(client.hasTaxpayerSession(), true);
});
