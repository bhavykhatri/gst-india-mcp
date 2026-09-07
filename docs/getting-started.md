# Getting Started

## 1. Prerequisites

- Node.js >= 18
- A [Sandbox](https://console.sandbox.co.in) account → **Settings → API Keys** → copy your **API Key** and **API Secret** (test keys are prefixed `key_test…`).
- For taxpayer tools only: sign in to [gst.gov.in](https://www.gst.gov.in) → **View Profile → Manage API Access → Enable = Yes** (choose 30 days) for your GSTIN.

## 2. Install

```bash
npx gst-india-mcp          # run on demand (no clone)
# or
npm install -g gst-india-mcp
```

From source:

```bash
cd gst-mcp
npm install
npm run build
```

## 3. Configure

```bash
cp .env.example .env
```

Fill in at least `GST_API_KEY` and `GST_API_SECRET`. For taxpayer tools, also set `GST_USERNAME` and `GST_GSTIN`. See [Configuration](configuration.md).

## 4. Run

```bash
npm start        # runs the built server over stdio
npm run dev      # watch mode (tsx)
```

The server logs `gst-india-mcp running on stdio` to **stderr** and waits for an MCP client.

## 5. Connect a client

### VS Code
Open the folder and start `gst-india` from the MCP view (uses [`.vscode/mcp.json`](../.vscode/mcp.json)), or install the [VS Code extension](../vscode-extension/).

### Claude Desktop
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

## 6. Try it

- Public: ask your client to run `verify_gstin` with a GSTIN like `29AFSPB9500E1ZY`.
- Taxpayer: run `taxpayer_generate_otp`, then `taxpayer_verify_otp` with the code, then `get_ledger_balance`.
