# GST India MCP

[![npm version](https://img.shields.io/npm/v/gst-india-mcp)](https://www.npmjs.com/package/gst-india-mcp)
[![npm downloads](https://img.shields.io/npm/dt/gst-india-mcp?label=npm%20installs)](https://www.npmjs.com/package/gst-india-mcp)
[![VS Code installs](https://img.shields.io/visual-studio-marketplace/i/bhavykhatri.gst-india-mcp-vscode?label=vs%20code%20installs)](https://marketplace.visualstudio.com/items?itemName=bhavykhatri.gst-india-mcp-vscode)
[![license](https://img.shields.io/npm/l/gst-india-mcp)](LICENSE)
[![CI](https://github.com/bhavykhatri/gst-india-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/bhavykhatri/gst-india-mcp/actions/workflows/ci.yml)

A [Model Context Protocol](https://modelcontextprotocol.io) (MCP) server for **India GST**, built on the [Sandbox (Quicko)](https://developer.sandbox.co.in) tax API. It lets any MCP client (VS Code, Claude, Codex, Cursor…) verify GSTINs, look up businesses by PAN, track return filings, and — with an OTP-based taxpayer session — read your GSTR-2B/3B and cash/ITC ledgers.

> 🧩 Also available as a **[VS Code extension](vscode-extension/)** for one-click install with secure credential storage.

## Features

| Tool | Session? | Description |
|---|---|---|
| `verify_gstin` | Public | Verify a GSTIN → legal/trade name, status, type, address, e-invoice status. |
| `search_gstin_by_pan` | Public | Find all GSTINs registered against a PAN. |
| `track_gst_returns` | Public | Return filing history/status for a GSTIN (optional FY filter). |
| `taxpayer_generate_otp` | — | Send an OTP to a taxpayer's registered mobile/email. |
| `taxpayer_verify_otp` | — | Verify the OTP → start a ~6h taxpayer session. |
| `taxpayer_session_status` | — | Whether a taxpayer session is active. |
| `get_gstr3b` | Taxpayer | GSTR-3B (summary return) for a period. |
| `get_gstr2b` | Taxpayer | GSTR-2B (auto-drafted ITC/purchases) for a period. |
| `track_returns_current` | Taxpayer | Filed/pending returns for a period. |
| `get_annual_turnover` | Taxpayer | Annual Aggregate Turnover (AATO). |
| `get_ledger_balance` | Taxpayer | Cash + ITC balance as on a period. |
| `get_cash_ledger` | Taxpayer | Electronic cash ledger for a date range. |
| `get_itc_ledger` | Taxpayer | Electronic ITC ledger for a date range. |

**Public** tools need only your Sandbox API key/secret. **Taxpayer** tools additionally require an OTP session (see [Authentication](docs/authentication.md)).

## Requirements

- Node.js >= 18
- A [Sandbox](https://console.sandbox.co.in) account with an **API Key + API Secret** (test or live).
- For taxpayer tools: **Manage API Access** enabled on [gst.gov.in](https://www.gst.gov.in) for your GSTIN.

## Install

```bash
npx gst-india-mcp
```

Or globally:

```bash
npm install -g gst-india-mcp
gst-india-mcp
```

## Configuration

Set via `.env` (local dev) or the MCP host's `env` block:

| Variable | Description |
|---|---|
| `GST_API_KEY` | Sandbox API key (`key_test_…` / `key_live_…`) |
| `GST_API_SECRET` | Sandbox API secret |
| `GST_BASE_URL` | API base (default `https://api.sandbox.co.in`) |
| `GST_API_VERSION` | API version (default `1.0`) |
| `GST_USERNAME` | GST portal username (for taxpayer tools) |
| `GST_GSTIN` | Your GSTIN (for taxpayer tools) |
| `GST_TAXPAYER_TOKEN` | Optional pre-obtained 6h taxpayer token (skips OTP) |

Never commit `.env` — it is git-ignored.

## Use with VS Code

Ships a [`.vscode/mcp.json`](.vscode/mcp.json). Open the folder in VS Code and start the server from the MCP view, or install the [VS Code extension](vscode-extension/).

## Use with Claude, Codex, Cursor

Standard MCP server — configure `npx -y gst-india-mcp` in the host's config with the `GST_*` env vars. Example (Claude Desktop `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "gst-india": {
      "command": "npx",
      "args": ["-y", "gst-india-mcp"],
      "env": { "GST_API_KEY": "...", "GST_API_SECRET": "...", "GST_USERNAME": "...", "GST_GSTIN": "..." }
    }
  }
}
```

## Documentation

- [Getting started](docs/getting-started.md)
- [Authentication (public vs taxpayer OTP)](docs/authentication.md)
- [Configuration](docs/configuration.md)
- [Tools reference](docs/tools.md)

## Security

- Credentials come from environment variables only; nothing is logged to stdout (reserved for MCP).
- The taxpayer session token is held in memory for the server's lifetime and is never written to disk by the server.
- This project uses the Sandbox **sandbox/test** environment by default — switch to live keys only when ready.

## License

MIT © Bhavy Khatri
