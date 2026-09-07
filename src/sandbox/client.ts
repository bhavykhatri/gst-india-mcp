// Sandbox (Quicko) GST API client.
// Auth model:
//   - POST /authenticate with x-api-key + x-api-secret -> a JWT "sandbox token" (valid 24h).
//   - Public + taxpayer-auth calls send the sandbox token in the `authorization` header.
//   - Taxpayer *data* calls send the 6h taxpayer token (from OTP verify) in `authorization`.
// The taxpayer token is NOT a Bearer token — it is passed raw in `authorization`.
import type { GstConfig } from "../config.js";

interface TokenCache {
  token: string;
  expiresAt: number; // epoch ms
}

type Auth = "sandbox" | "taxpayer";

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES = 3;
const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export class GstClient {
  private sandboxCache: TokenCache | null = null;
  private sandboxPromise: Promise<string> | null = null;
  private taxpayerToken: string | null;

  constructor(private readonly config: GstConfig) {
    this.taxpayerToken = config.taxpayerToken || null;
  }

  private requireCreds(): void {
    const missing = (["apiKey", "apiSecret"] as const).filter((k) => !this.config[k]);
    if (missing.length) {
      throw new Error(
        `Missing Sandbox credentials: ${missing.join(", ")}. Set GST_API_KEY / GST_API_SECRET.`
      );
    }
  }

  // POST /authenticate -> { data: { access_token } }; cached for ~24h.
  async getSandboxToken(): Promise<string> {
    this.requireCreds();
    const now = Date.now();
    if (this.sandboxCache && this.sandboxCache.expiresAt > now + 60_000) {
      return this.sandboxCache.token;
    }
    this.sandboxPromise ??= this.fetchSandboxToken().finally(() => {
      this.sandboxPromise = null;
    });
    return this.sandboxPromise;
  }

  private async fetchSandboxToken(): Promise<string> {
    const res = await fetch(`${this.config.baseUrl}/authenticate`, {
      method: "POST",
      headers: {
        "x-api-key": this.config.apiKey,
        "x-api-secret": this.config.apiSecret,
        "x-api-version": this.config.apiVersion,
        "Content-Type": "application/json",
      },
    });
    const data = (await res.json().catch(() => ({}))) as {
      data?: { access_token?: string };
    };
    const token = data?.data?.access_token;
    if (!res.ok || !token) {
      throw new Error(`Authenticate failed (${res.status}): ${JSON.stringify(data)}`);
    }
    // Sandbox tokens last 24h; refresh a little early.
    this.sandboxCache = { token, expiresAt: Date.now() + 23 * 3600 * 1000 };
    return token;
  }

  setTaxpayerToken(token: string): void {
    this.taxpayerToken = token;
  }

  hasTaxpayerSession(): boolean {
    return Boolean(this.taxpayerToken);
  }

  private requireTaxpayerToken(): string {
    if (!this.taxpayerToken) {
      throw new Error(
        "No taxpayer session. Call taxpayer_generate_otp then taxpayer_verify_otp first " +
          "(or set GST_TAXPAYER_TOKEN)."
      );
    }
    return this.taxpayerToken;
  }

  private async call<T = unknown>(
    method: string,
    path: string,
    opts: { query?: Record<string, string | undefined>; body?: unknown; auth: Auth } = {
      auth: "sandbox",
    }
  ): Promise<T> {
    const url = new URL(path, this.config.baseUrl);
    for (const [k, v] of Object.entries(opts.query ?? {})) {
      if (v !== undefined && v !== "") url.searchParams.set(k, v);
    }
    const payload = opts.body !== undefined ? JSON.stringify(opts.body) : undefined;

    for (let attempt = 0; ; attempt++) {
      const token =
        opts.auth === "taxpayer" ? this.requireTaxpayerToken() : await this.getSandboxToken();
      const headers: Record<string, string> = {
        "x-api-key": this.config.apiKey,
        authorization: token,
        "x-api-version": this.config.apiVersion,
        "Content-Type": "application/json",
      };
      // Taxpayer + OTP endpoints require the x-source header.
      if (opts.auth === "taxpayer" || path.includes("/tax-payer/")) headers["x-source"] = "primary";

      const res = await fetch(url, { method, headers, body: payload });

      if (RETRYABLE_STATUS.has(res.status) && attempt < MAX_RETRIES) {
        const retryAfter = Number(res.headers.get("retry-after"));
        const delayMs =
          Number.isFinite(retryAfter) && retryAfter > 0
            ? retryAfter * 1000
            : Math.min(1000 * 2 ** attempt, 8000) + Math.floor(Math.random() * 250);
        await sleep(delayMs);
        continue;
      }

      const text = await res.text();
      if (!res.ok) {
        throw new Error(`${method} ${path} failed (${res.status}): ${text}`);
      }
      return text ? (JSON.parse(text) as T) : ({} as T);
    }
  }

  // --- Public APIs (no OTP; use the sandbox token) ---
  verifyGstin(gstin: string): Promise<unknown> {
    return this.call("POST", "/gst/compliance/public/gstin/search", {
      body: { gstin },
      auth: "sandbox",
    });
  }

  searchGstinByPan(pan: string): Promise<unknown> {
    return this.call("POST", "/gst/compliance/public/pan/search", {
      body: { pan },
      auth: "sandbox",
    });
  }

  trackReturnsPublic(gstin: string, financialYear?: string): Promise<unknown> {
    const body: Record<string, string> = { gstin };
    if (financialYear) body.financial_year = financialYear;
    return this.call("POST", "/gst/compliance/public/gstrs/track", { body, auth: "sandbox" });
  }

  // --- Taxpayer session (OTP) ---
  generateOtp(username: string, gstin: string): Promise<unknown> {
    return this.call("POST", "/gst/compliance/tax-payer/otp", {
      body: { username, gstin },
      auth: "sandbox",
    });
  }

  async verifyOtp(otp: string, username: string, gstin: string): Promise<unknown> {
    const res = (await this.call("POST", "/gst/compliance/tax-payer/otp/verify", {
      query: { otp },
      body: { username, gstin },
      auth: "sandbox",
    })) as { data?: { access_token?: string } };
    const token = res?.data?.access_token;
    if (token) this.setTaxpayerToken(token);
    return res;
  }

  // --- Taxpayer data (require a session) ---
  taxpayerTrackReturns(year: string, month: string): Promise<unknown> {
    return this.call(
      "GET",
      `/gst/compliance/tax-payer/gstrs/${encodeURIComponent(year)}/${encodeURIComponent(month)}/track`,
      { auth: "taxpayer" }
    );
  }

  getAato(): Promise<unknown> {
    return this.call("GET", "/gst/compliance/tax-payer/aato", { auth: "taxpayer" });
  }

  getGstr3b(year: string, month: string): Promise<unknown> {
    return this.call(
      "GET",
      `/gst/compliance/tax-payer/gstrs/gstr-3b/${encodeURIComponent(year)}/${encodeURIComponent(month)}`,
      { auth: "taxpayer" }
    );
  }

  getGstr2b(year: string, month: string): Promise<unknown> {
    return this.call(
      "GET",
      `/gst/compliance/tax-payer/gstrs/gstr-2b/${encodeURIComponent(year)}/${encodeURIComponent(month)}`,
      { auth: "taxpayer" }
    );
  }

  getLedgerBalance(year: string, month: string): Promise<unknown> {
    return this.call(
      "GET",
      `/gst/compliance/tax-payer/ledgers/bal/${encodeURIComponent(year)}/${encodeURIComponent(month)}`,
      { auth: "taxpayer" }
    );
  }

  getCashLedger(from: string, to: string): Promise<unknown> {
    return this.call("GET", "/gst/compliance/tax-payer/ledgers/cash", {
      query: { from, to },
      auth: "taxpayer",
    });
  }

  getItcLedger(from: string, to: string): Promise<unknown> {
    return this.call("GET", "/gst/compliance/tax-payer/ledgers/itc", {
      query: { from, to },
      auth: "taxpayer",
    });
  }
}
