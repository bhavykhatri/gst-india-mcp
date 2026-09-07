# Authentication

This server uses the [Sandbox (Quicko)](https://developer.sandbox.co.in) GST API, which has **two layers** of auth.

## 1. Sandbox API token (always required)

Every call first needs a Sandbox JWT, obtained from your API Key + Secret:

```
POST /authenticate
headers: x-api-key, x-api-secret, x-api-version
-> { data: { access_token } }   // valid ~24h, NOT a Bearer token
```

The server does this automatically and caches the token. This alone is enough for the **public** tools:
`verify_gstin`, `search_gstin_by_pan`, `track_gst_returns`.

## 2. Taxpayer session (for taxpayer tools)

Reading your own returns/ledgers requires a taxpayer session on behalf of a GSTIN.

**Prerequisite:** enable API access on the portal — [gst.gov.in](https://www.gst.gov.in) → **View Profile → Manage API Access → Enable = Yes** (e.g. 30 days).

Then:

1. **`taxpayer_generate_otp`** → `POST /gst/compliance/tax-payer/otp { username, gstin }` — sends an OTP to the registered mobile/email. (The `x-source: primary` header is required and added automatically.)
2. **`taxpayer_verify_otp`** with the OTP → `POST /gst/compliance/tax-payer/otp/verify?otp=… { username, gstin }` — returns a **taxpayer access token valid ~6h**, stored in memory.
3. All taxpayer tools (`get_gstr3b`, `get_gstr2b`, `track_returns_current`, `get_annual_turnover`, `get_ledger_balance`, `get_cash_ledger`, `get_itc_ledger`) then work until the session expires.

`taxpayer_session_status` reports whether a session is active.

### Skipping OTP

If you already have a valid 6-hour taxpayer token, set `GST_TAXPAYER_TOKEN` and the taxpayer tools work immediately without the OTP steps.

> The taxpayer token lives only in the running server process (or the env var). Because MCP servers are long-lived, one OTP verification covers the whole ~6h window.
