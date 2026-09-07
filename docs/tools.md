# Tools Reference

All tools return the raw Sandbox JSON response (pretty-printed). Errors are returned as text with `isError: true`.

## Public tools (Sandbox key only)

### `verify_gstin`
Verify a GST-registered business.
- **Input:** `gstin` (15 chars)
- **Returns:** legal name (`lgnm`), trade name (`tradeNam`), status (`sts`), taxpayer type (`dty`), constitution (`ctb`), e-invoice status, principal address (`pradr`).

### `search_gstin_by_pan`
Find all GSTINs registered against a PAN.
- **Input:** `pan` (10 chars)

### `track_gst_returns`
Return filing history/status for a GSTIN.
- **Input:** `gstin`, `financial_year?` (e.g. `2025-26`)

## Session tools

### `taxpayer_generate_otp`
Send an OTP to the taxpayer's registered mobile/email.
- **Input:** `username?`, `gstin?` (default to `GST_USERNAME` / `GST_GSTIN`)

### `taxpayer_verify_otp`
Verify the OTP and start a ~6h taxpayer session.
- **Input:** `otp`, `username?`, `gstin?`

### `taxpayer_session_status`
Report whether a taxpayer session is active.
- **Input:** none

## Taxpayer tools (require a session)

### `get_gstr3b`
GSTR-3B summary return for a period.
- **Input:** `year` (e.g. `2026`), `month` (e.g. `09`)

### `get_gstr2b`
GSTR-2B auto-drafted ITC/purchase statement for a period.
- **Input:** `year`, `month`

### `track_returns_current`
Filed/pending returns for a period.
- **Input:** `year`, `month`

### `get_annual_turnover`
Annual Aggregate Turnover (AATO).
- **Input:** none

### `get_ledger_balance`
Cash + ITC balance as on a period.
- **Input:** `year`, `month`

### `get_cash_ledger`
Electronic cash ledger for a date range.
- **Input:** `from` (DD/MM/YYYY), `to` (DD/MM/YYYY)

### `get_itc_ledger`
Electronic ITC ledger for a date range.
- **Input:** `from`, `to`

## Typical flow

```
verify_gstin(gstin)                     # public — validate a partner
taxpayer_generate_otp()                 # uses GST_USERNAME/GST_GSTIN
taxpayer_verify_otp(otp)                # start 6h session
get_ledger_balance(2026, 09)            # read your balances
get_gstr2b(2026, 08)                    # reconcile purchases/ITC
```
