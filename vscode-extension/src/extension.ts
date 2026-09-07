// VS Code extension: registers the GST India MCP server and manages Sandbox
// credentials via SecretStorage. The server itself is the `gst-india-mcp`
// npm package, launched with `npx`.
import * as vscode from "vscode";

const SECRET_KEYS = ["GST_API_KEY", "GST_API_SECRET"] as const;

const PROVIDER_ID = "gst-india-mcp";

export function activate(context: vscode.ExtensionContext): void {
  const didChange = new vscode.EventEmitter<void>();
  context.subscriptions.push(didChange);

  const provider: vscode.McpServerDefinitionProvider = {
    onDidChangeMcpServerDefinitions: didChange.event,
    async provideMcpServerDefinitions(): Promise<vscode.McpServerDefinition[]> {
      const env: Record<string, string> = {};
      for (const key of SECRET_KEYS) {
        const value = await context.secrets.get(key);
        if (value) env[key] = value;
      }
      const cfg = vscode.workspace.getConfiguration("gstMcp");
      env.GST_BASE_URL = cfg.get<string>("baseUrl") || "https://api.sandbox.co.in";
      env.GST_API_VERSION = cfg.get<string>("apiVersion") || "1.0";
      const username = cfg.get<string>("username");
      const gstin = cfg.get<string>("gstin");
      if (username) env.GST_USERNAME = username;
      if (gstin) env.GST_GSTIN = gstin;

      return [
        new vscode.McpStdioServerDefinition("GST India MCP", "npx", ["-y", "gst-india-mcp"], env),
      ];
    },
  };

  context.subscriptions.push(vscode.lm.registerMcpServerDefinitionProvider(PROVIDER_ID, provider));

  context.subscriptions.push(
    vscode.commands.registerCommand("gstMcp.setCredentials", async () => {
      for (const key of SECRET_KEYS) {
        const existing = await context.secrets.get(key);
        const value = await vscode.window.showInputBox({
          title: `GST India MCP — ${key}`,
          prompt: `Enter ${key}`,
          password: true,
          ignoreFocusOut: true,
          placeHolder: existing ? "(leave blank to keep the existing value)" : "",
        });
        if (value === undefined) {
          vscode.window.showWarningMessage("GST India MCP: credential setup cancelled.");
          return;
        }
        if (value.trim() !== "") await context.secrets.store(key, value.trim());
      }
      didChange.fire();
      vscode.window.showInformationMessage("GST India MCP credentials saved.");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("gstMcp.clearCredentials", async () => {
      for (const key of SECRET_KEYS) await context.secrets.delete(key);
      didChange.fire();
      vscode.window.showInformationMessage("GST India MCP credentials cleared.");
    })
  );
}

export function deactivate(): void {
  // Nothing to clean up — subscriptions are disposed by VS Code.
}
