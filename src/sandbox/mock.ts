// Offline mock fixtures for GST_MOCK=true (demos / videos — no credentials, no network).
// Vendor data adapted from the open-source mock dataset:
//   https://github.com/vnrtumu/mockGSTServer (data/master_data/vendor_registry.json)
// Responses are shaped like the real Sandbox (Quicko) API so tools behave identically.

interface Vendor {
  gstin: string | null;
  legal_name: string;
  trade_name: string;
  pan: string | null;
  state: string | null;
  address: string;
  status: string; // ACTIVE | SUSPENDED | CANCELLED
  filing: string; // REGULAR | COMPOSITION | DEFAULTER
  regDate: string; // YYYY-MM-DD
  turnover: number | null;
  suspensionDate?: string;
  suspensionReason?: string;
}

const VENDORS: Vendor[] = [
  { gstin: "27AABCT1234F1ZP", legal_name: "TechSoft Solutions Private Limited", trade_name: "TechSoft", pan: "AABCT1234F", state: "Maharashtra", address: "Unit 405, Tech Park, Andheri East, Mumbai - 400069", status: "ACTIVE", filing: "REGULAR", regDate: "2019-04-15", turnover: 85000000 },
  { gstin: "07AABCG5678H1Z9", legal_name: "Global Logistics & Transport Co.", trade_name: "GloLog", pan: "AABCG5678H", state: "Delhi", address: "Plot 23, Industrial Area, Okhla Phase-II, New Delhi - 110020", status: "ACTIVE", filing: "REGULAR", regDate: "2017-07-01", turnover: 420000000 },
  { gstin: "09BQUPS7890K1ZJ", legal_name: "Sharma Consulting & Advisory Services", trade_name: "Sharma Consultants", pan: "BQUPS7890K", state: "Uttar Pradesh", address: "B-12, Sector 62, Noida - 201301", status: "ACTIVE", filing: "REGULAR", regDate: "2020-01-10", turnover: 12000000 },
  { gstin: "27AABCQ2345M1ZX", legal_name: "Quick Office Supplies", trade_name: "QuickSupply", pan: "AABCQ2345M", state: "Maharashtra", address: "Shop 7, Commercial Complex, Bandra West, Mumbai - 400050", status: "ACTIVE", filing: "COMPOSITION", regDate: "2021-06-20", turnover: 4500000 },
  { gstin: "29AABCA9876N1ZQ", legal_name: "ABC Contractors Pvt Ltd", trade_name: "ABC Build", pan: "AABCA9876N", state: "Karnataka", address: "123, Industrial Layout, Whitefield, Bangalore - 560066", status: "ACTIVE", filing: "REGULAR", regDate: "2018-03-01", turnover: 150000000 },
  { gstin: "33AABCC1122P1ZW", legal_name: "Chennai Software Technologies", trade_name: "CST", pan: "AABCC1122P", state: "Tamil Nadu", address: "4th Floor, IT Tower, OMR Road, Chennai - 600096", status: "SUSPENDED", filing: "DEFAULTER", regDate: "2016-09-15", turnover: 0, suspensionDate: "2024-08-01", suspensionReason: "Non-filing of returns" },
  { gstin: "27AXXPK5566Q1ZB", legal_name: "Rajesh Kumar (Proprietor)", trade_name: "RK Electricals", pan: "AXXPK5566Q", state: "Maharashtra", address: "Flat 302, Shanti Nagar, Thane West - 400601", status: "ACTIVE", filing: "REGULAR", regDate: "2023-01-15", turnover: 2800000 },
  { gstin: "27AABCP7788R1ZT", legal_name: "Prime Real Estate Developers", trade_name: "Prime Realty", pan: "AABCP7788R", state: "Maharashtra", address: "Prime Tower, BKC, Mumbai - 400051", status: "ACTIVE", filing: "REGULAR", regDate: "2015-04-01", turnover: 500000000 },
  { gstin: "27AABCM9900S1ZL", legal_name: "MegaMart Wholesale", trade_name: "MegaMart", pan: "AABCM9900S", state: "Maharashtra", address: "Warehouse 5, MIDC Taloja, Navi Mumbai - 410208", status: "ACTIVE", filing: "REGULAR", regDate: "2019-11-01", turnover: 85000000 },
  { gstin: "29AABCT1234F2ZN", legal_name: "TechSoft Solutions Private Limited", trade_name: "TechSoft India", pan: "AABCT1234F", state: "Karnataka", address: "Unit 200, Tech Hub, Electronic City, Bangalore - 560100", status: "ACTIVE", filing: "REGULAR", regDate: "2020-08-01", turnover: 85000000 },
  { gstin: "27AABCH4455T1ZM", legal_name: "Healthcare Solutions India", trade_name: "HSI Medical", pan: "AABCH4455T", state: "Maharashtra", address: "Medical Plaza, Powai, Mumbai - 400076", status: "ACTIVE", filing: "REGULAR", regDate: "2020-03-15", turnover: 35000000 },
];

const STATUS: Record<string, string> = { ACTIVE: "Active", SUSPENDED: "Suspended", CANCELLED: "Cancelled" };

function ddmmyyyy(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function pincode(address: string): string {
  const m = address.match(/(\d{6})\s*$/);
  return m ? m[1] : "";
}

function constitution(name: string): string {
  if (/\(Proprietor\)/i.test(name)) return "Proprietorship";
  if (/private limited|pvt ltd/i.test(name)) return "Private Limited Company";
  if (/LLP/i.test(name)) return "Limited Liability Partnership";
  if (/LLC/i.test(name)) return "Foreign Company";
  return "Partnership";
}

function envelope(dataInner: unknown, statusCd = "1"): unknown {
  return {
    code: 200,
    timestamp: Date.now(),
    transaction_id: `MOCK-${Math.random().toString(36).slice(2, 10)}`,
    data: { data: dataInner, status_cd: statusCd },
    _mock: true,
  };
}

function taxpayerRecord(v: Vendor): unknown {
  return {
    gstin: v.gstin,
    lgnm: v.legal_name,
    tradeNam: v.trade_name,
    sts: STATUS[v.status] ?? v.status,
    dty: v.filing === "COMPOSITION" ? "Composition" : "Regular",
    ctb: constitution(v.legal_name),
    einvoiceStatus: (v.turnover ?? 0) >= 50000000 ? "Yes" : "No",
    rgdt: ddmmyyyy(v.regDate),
    ...(v.suspensionDate
      ? { cxdt: "", suspension_date: v.suspensionDate, suspension_reason: v.suspensionReason }
      : {}),
    pradr: { addr: { st: v.address, stcd: v.state, pncd: pincode(v.address) } },
    nba: ["Supplier of Services"],
  };
}

export function verifyGstin(gstin: string): unknown {
  const g = gstin.toUpperCase().trim();
  if (g.length !== 15) {
    return { code: 422, message: "Invalid GSTIN pattern", _mock: true };
  }
  const v = VENDORS.find((x) => x.gstin === g);
  if (!v) {
    return { code: 200, data: { error: { error_cd: "FO8000", message: "No records found" }, status_cd: "0" }, _mock: true };
  }
  return envelope(taxpayerRecord(v));
}

export function searchGstinByPan(pan: string): unknown {
  const p = pan.toUpperCase().trim();
  const matches = VENDORS.filter((v) => v.pan === p && v.gstin).map((v) => ({
    gstin: v.gstin,
    lgnm: v.legal_name,
    sts: STATUS[v.status] ?? v.status,
    stcd: v.state,
  }));
  if (!matches.length) {
    return { code: 200, data: { error: { error_cd: "NOGSTIN", message: "No records found" }, status_cd: "0" }, _mock: true };
  }
  return envelope(matches);
}

export function trackReturns(gstin: string, financialYear?: string): unknown {
  const fy = financialYear ?? "2024-25";
  const list = [
    { rtntype: "GSTR1", ret_prd: "082024", status: "Filed", dof: "11/09/2024", valid: "Y" },
    { rtntype: "GSTR3B", ret_prd: "082024", status: "Filed", dof: "20/09/2024", valid: "Y" },
    { rtntype: "GSTR1", ret_prd: "072024", status: "Filed", dof: "11/08/2024", valid: "Y" },
    { rtntype: "GSTR3B", ret_prd: "072024", status: "Filed", dof: "20/08/2024", valid: "Y" },
  ];
  return envelope({ gstin: gstin.toUpperCase(), fy, EFiledlist: list });
}

export function generateOtp(): unknown {
  return { code: 200, timestamp: Date.now(), data: { status_cd: "1", message: "OTP sent to registered mobile/email (mock)" }, _mock: true };
}

export function verifyOtp(): unknown {
  return { code: 200, timestamp: Date.now(), data: { access_token: "MOCK-TAXPAYER-TOKEN" }, _mock: true };
}

export function gstr3b(year: string, month: string): unknown {
  return envelope({
    gstin: "MOCKGSTIN0001Z",
    ret_period: `${month}${year}`,
    status: "Filed",
    sup_details: {
      osup_det: { txval: 1250000, iamt: 0, camt: 112500, samt: 112500, csamt: 0 },
      osup_zero: { txval: 180000, iamt: 0 },
      osup_nil_exmp: { txval: 25000 },
    },
    itc_elg: { itc_avl: [{ ty: "OTH", iamt: 0, camt: 68400, samt: 68400 }], itc_net: { camt: 68400, samt: 68400 } },
    tx_pmt: { tx_py: { camt: 44100, samt: 44100 } },
  });
}

export function gstr2b(year: string, month: string): unknown {
  return envelope({
    gstin: "MOCKGSTIN0001Z",
    ret_period: `${month}${year}`,
    itc_summary: {
      itcavail: { igst: 0, cgst: 68400, sgst: 68400, cess: 0 },
      itcnotavl: { igst: 0, cgst: 2200, sgst: 2200, cess: 0 },
    },
    docdata: {
      b2b: [
        { ctin: "27AABCM9900S1ZL", trdnm: "MegaMart", inv: [{ inum: "MM/2024/8842", dt: "12/08/2024", val: 236000, txval: 200000, cgst: 18000, sgst: 18000 }] },
        { ctin: "07AABCG5678H1Z9", trdnm: "GloLog", inv: [{ inum: "GL-99127", dt: "18/08/2024", val: 59000, txval: 50000, cgst: 4500, sgst: 4500 }] },
      ],
    },
  });
}

export function trackReturnsCurrent(year: string, month: string): unknown {
  return envelope({
    ret_period: `${month}${year}`,
    returns: [
      { rtntype: "GSTR1", status: "Filed", dof: `11/${month}/${year}` },
      { rtntype: "GSTR3B", status: "Filed", dof: `20/${month}/${year}` },
      { rtntype: "GSTR2B", status: "Generated", dof: `14/${month}/${year}` },
    ],
  });
}

export function aato(): unknown {
  return envelope({ fy: "2023-24", aato: 24500000, aato_slab: "1.5 Cr - 5 Cr" });
}

export function ledgerBalance(year: string, month: string): unknown {
  return envelope({
    gstin: "MOCKGSTIN0001Z",
    as_on: `${month}/${year}`,
    cash_bal: { igst: 0, cgst: 15200, sgst: 15200, cess: 0 },
    itc_bal: { igst: 0, cgst: 68400, sgst: 68400, cess: 0 },
    itc_blck_bal: { igst_blck_bal: 0, cgst_blck_bal: 0, sgst_blck_bal: 0, cess_blck_bal: 0 },
  });
}

export function cashLedger(from: string, to: string): unknown {
  return envelope({
    from,
    to,
    txns: [
      { date: from, ref: "CIN/24081234567", type: "Credit (deposit)", cgst: 20000, sgst: 20000, bal_cgst: 20000, bal_sgst: 20000 },
      { date: to, ref: "DEBIT/GSTR3B", type: "Debit (3B set-off)", cgst: -4800, sgst: -4800, bal_cgst: 15200, bal_sgst: 15200 },
    ],
  });
}

export function itcLedger(from: string, to: string): unknown {
  return envelope({
    from,
    to,
    txns: [
      { date: from, ref: "GSTR2B/AUG", type: "ITC credit", cgst: 68400, sgst: 68400, bal_cgst: 68400, bal_sgst: 68400 },
    ],
  });
}
