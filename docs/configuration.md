# Configuration

All configuration is via environment variables (or a local `.env`, which is git-ignored).

| Variable | Required | Default | Description |
|---|---|---|---|
| `GST_API_KEY` | Yes | — | Sandbox API key (`key_test_…` or `key_live_…`). |
| `GST_API_SECRET` | Yes | — | Sandbox API secret. |
| `GST_BASE_URL` | No | `https://api.sandbox.co.in` | API base URL. Test and live keys both use this host. |
| `GST_API_VERSION` | No | `1.0` | Sandbox API version header. |
| `GST_USERNAME` | Taxpayer tools | — | GST portal login username. |
| `GST_GSTIN` | Taxpayer tools | — | 15-character GSTIN for the taxpayer session. |
| `GST_TAXPAYER_TOKEN` | No | — | Pre-obtained 6h taxpayer token; skips the OTP flow. |

## Test vs live

Sandbox distinguishes environments by the **key prefix** (`key_test…` vs `key_live…`), so the base URL stays the same. Start with test keys; switch to live only when you're ready to hit real GSTN data and be billed.

## Security notes

- Never commit `.env`. Real keys grant access to tax data.
- `GST_TAXPAYER_TOKEN` is sensitive (6h access to a taxpayer's data) — prefer the OTP flow over hardcoding it.
