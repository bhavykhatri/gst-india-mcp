import { test } from "node:test";
import assert from "node:assert/strict";
import { loadConfig } from "../src/config.js";

const KEYS = [
  "GST_API_KEY",
  "GST_API_SECRET",
  "GST_BASE_URL",
  "GST_API_VERSION",
  "GST_USERNAME",
  "GST_GSTIN",
  "GST_TAXPAYER_TOKEN",
];

function clearEnv(): void {
  for (const k of KEYS) delete process.env[k];
}

test("loadConfig applies Sandbox defaults when env is unset", () => {
  clearEnv();
  const c = loadConfig();
  assert.equal(c.baseUrl, "https://api.sandbox.co.in");
  assert.equal(c.apiVersion, "1.0");
  assert.equal(c.apiKey, "");
  assert.equal(c.apiSecret, "");
  clearEnv();
});

test("loadConfig reads values from the environment", () => {
  clearEnv();
  process.env.GST_API_KEY = "key_test_abc";
  process.env.GST_GSTIN = "29AFSPB9500E1ZY";
  process.env.GST_BASE_URL = "https://test-api.sandbox.co.in";
  const c = loadConfig();
  assert.equal(c.apiKey, "key_test_abc");
  assert.equal(c.gstin, "29AFSPB9500E1ZY");
  assert.equal(c.baseUrl, "https://test-api.sandbox.co.in");
  clearEnv();
});
