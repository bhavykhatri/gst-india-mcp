# GST India MCP — VS Code Extension

Adds the **[gst-india-mcp](https://www.npmjs.com/package/gst-india-mcp)** server (India GST via Sandbox/Quicko) to VS Code as a managed MCP server, with **secure credential storage**.

## What it does

- Registers a **GST India MCP** server in VS Code (no manual `mcp.json` editing).
- Stores your Sandbox API key/secret in VS Code **SecretStorage** (encrypted), not in plaintext files.
- Launches the server via `npx gst-india-mcp`, injecting your credentials as environment variables.

## Setup

1. Install the extension.
2. Run **`GST India MCP: Set Credentials`** from the Command Palette and enter:
   - `GST_API_KEY`
   - `GST_API_SECRET`
3. (Optional, for taxpayer tools) set `gstMcp.username` and `gstMcp.gstin` in Settings.
4. The **GST India MCP** server appears in the MCP view. Use its tools from Chat.

## Settings

| Setting | Default | Description |
|---|---|---|
| `gstMcp.username` | `""` | GST portal username (taxpayer tools). |
| `gstMcp.gstin` | `""` | Your GSTIN (taxpayer tools). |
| `gstMcp.baseUrl` | `https://api.sandbox.co.in` | Sandbox API base URL. |
| `gstMcp.apiVersion` | `1.0` | Sandbox API version. |

## Commands

- **GST India MCP: Set Credentials** — securely store/update credentials.
- **GST India MCP: Clear Credentials** — remove stored credentials.

## How it relates to the npm package

This extension is a thin wrapper. All tools and logic live in the
[`gst-india-mcp`](https://www.npmjs.com/package/gst-india-mcp) npm package
([source](https://github.com/bhavykhatri/gst-india-mcp)).

## Other MCP hosts (Claude, Codex, Cursor)

This extension only integrates the server into VS Code / Copilot. Other hosts run the
same server — configure `npx -y gst-india-mcp` directly in their config with the `GST_*`
env vars.

## License

MIT © Bhavy Khatri
