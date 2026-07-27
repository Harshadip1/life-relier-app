import { API_BASE_URL } from '../utils/constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EditPatientGridItem {
  PatRegID:     number;
  PID:          number;
  PatientName:  string;
  MobileNo:     string;
  Age:          number;
  Gender:       string;
  DOB:          string | null;
  CenterName:   string;
  Patregdate:   string;
  BranchId:     number;
  TestName?:    string;
  TestCharges?: number;
  Address?:     string;
  Email?:       string;
  City?:        string;
  Area?:        string;
  Notes?:       string;
  [key: string]: any;
}

export interface GetGridParams {
  BranchId:    number;
  FromDate:    string;      // ISO  "2026-06-01T00:00:00"
  ToDate:      string;      // ISO  "2026-06-29T23:59:59"
  PageNo:      number;
  PageSize:    number;
  CenterName:  string;
  PatientName: string;
  MobileNo:    string;
  PatRegID:    number;      // 0 = no filter
}

export interface GetGridResponse {
  data:       EditPatientGridItem[];
  totalCount: number;
  pageNo:     number;
  pageSize:   number;
}

// ─── API call ─────────────────────────────────────────────────────────────────

/**
 * POST /api/EditPatient/GetGrid
 */
export async function getEditPatientGrid(
  params: Partial<GetGridParams> = {}
): Promise<GetGridResponse> {
  const body: GetGridParams = {
    BranchId:    params.BranchId    ?? 1,
    FromDate:    params.FromDate    ?? startOfMonth(),
    ToDate:      params.ToDate      ?? endOfToday(),
    PageNo:      params.PageNo      ?? 1,
    PageSize:    params.PageSize    ?? 20,
    CenterName:  params.CenterName  ?? '',
    PatientName: params.PatientName ?? '',
    MobileNo:    params.MobileNo    ?? '',
    PatRegID:    params.PatRegID    ?? 0,
  };

  const res = await fetch(`${API_BASE_URL}/api/EditPatient/GetGrid`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify(body),
  });

  const text = await res.text();
  let raw: any = null;
  try { raw = text ? JSON.parse(text) : null; } catch { raw = null; }
  if (!res.ok) throw new Error(raw?.Message || raw?.message || `Server error (${res.status})`);

  // API returns { GridData: [...], TotalCount: [{ TotalRecords: N }] }
  let list: any[] = [];
  let total = 0;

  if (raw?.GridData && Array.isArray(raw.GridData)) {
    list = raw.GridData;
    // TotalCount is an array like [{ TotalRecords: 44 }]
    if (Array.isArray(raw.TotalCount) && raw.TotalCount.length > 0) {
      total = raw.TotalCount[0]?.TotalRecords ?? list.length;
    } else {
      total = raw.TotalCount ?? list.length;
    }
  } else if (Array.isArray(raw)) {
    list = raw; total = raw.length;
  } else if (raw?.data && Array.isArray(raw.data)) {
    list = raw.data; total = raw.totalCount ?? raw.data.length;
  } else if (raw?.value && Array.isArray(raw.value)) {
    list = raw.value; total = raw.value.length;
  }

  // Normalise field names — API uses "Name" but service expects "PatientName"
  const data: EditPatientGridItem[] = list.map((r: any) => ({
    PID:         r.PID        ?? 0,
    PatRegID:    r.PatRegID   ?? r.PID ?? 0,
    PatientName: r.PatientName ?? r.Name ?? r.Patname ?? '—',
    MobileNo:    r.MobileNo   ?? r.Patphoneno ?? '—',
    Age:         r.Age        ?? 0,
    Gender:      r.Gender     ?? r.sex ?? '—',
    DOB:         r.DOB        ?? r.DateOfBirth ?? null,
    CenterName:  r.CenterName ?? '—',
    Patregdate:  r.Patregdate ?? '',
    BranchId:    r.BranchId   ?? r.Branchid ?? 1,
    Address:     r.Address    ?? r.Pataddress ?? '',
    Email:       r.Email      ?? r.EmailID ?? '',
    City:        r.City       ?? '',
    Area:        r.Area       ?? '',
    Notes:       r.Notes      ?? r.Remark ?? '',
    TestName:    r.TestName   ?? '',
    TestCharges: r.TestCharges ?? 0,
    ...r,
  }));

  return { data, totalCount: total, pageNo: body.PageNo, pageSize: body.PageSize };
}

// ─── Get single patient ───────────────────────────────────────────────────────

export interface PatientDetail {
  PID:          number;
  PatRegID:     number;
  PatientName:  string;
  MobileNo:     string;
  Age:          number | string;
  Gender:       string;
  DOB:          string | null;
  CenterName:   string;
  Patregdate:   string;
  BranchId:     number;
  Address?:     string;
  Pataddress?:  string;
  Email?:       string;
  City?:        string;
  Area?:        string;
  Notes?:       string;
  Remark?:      string;
  Initial?:     string;
  Patphoneno?:  string;
  [key: string]: any;
}

/**
 * POST /api/EditPatient/GetPatient
 * Body: { PID: number }
 */
export async function getPatient(pid: number): Promise<PatientDetail> {
  console.log('[EditPatient] getPatient called with PID:', pid);

  const res = await fetch(`${API_BASE_URL}/api/EditPatient/GetPatient`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify({ PID: pid }),
  });

  // Parse safely — response may be empty
  const text = await res.text();
  console.log('[EditPatient] GetPatient raw response:', text?.substring(0, 500));

  let raw: any = null;
  try { raw = text ? JSON.parse(text) : null; } catch { raw = null; }

  if (!res.ok) throw new Error(raw?.Message || raw?.message || `Server error (${res.status})`);

  // API returns { PatientInfo: [...], PaymentInfo: [...], Table1: [...] }
  // PatientInfo[0] = patient demographics
  // PaymentInfo[0] = billing record (contains RID, BillAmt, PaymentType, etc.)
  // Table1         = test list
  let record: any = null;

  if (raw?.PatientInfo && Array.isArray(raw.PatientInfo) && raw.PatientInfo.length > 0) {
    // Merge PatientInfo + PaymentInfo into one flat object so the screen
    // and UpdatePatient payload have access to RID, BillAmt, etc.
    const payment = (Array.isArray(raw.PaymentInfo) && raw.PaymentInfo.length > 0)
      ? raw.PaymentInfo[0]
      : {};
    const testList = Array.isArray(raw.Table1) ? raw.Table1 : [];
    record = { ...raw.PatientInfo[0], ...payment, TestList: testList };
  } else if (Array.isArray(raw) && raw.length > 0) {
    record = raw[0];
  } else if (raw?.data && Array.isArray(raw.data) && raw.data.length > 0) {
    record = raw.data[0];
  } else if (raw?.Data && Array.isArray(raw.Data) && raw.Data.length > 0) {
    record = raw.Data[0];
  } else if (raw?.PatientData && Array.isArray(raw.PatientData) && raw.PatientData.length > 0) {
    record = raw.PatientData[0];
  } else if (raw?.Result && Array.isArray(raw.Result) && raw.Result.length > 0) {
    record = raw.Result[0];
  } else if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const hasPatientField =
      raw.PID != null || raw.Patname || raw.PatientName || raw.MobileNo ||
      raw.intial || raw.Patphoneno || raw.DateOfBirth || raw.BranchId;
    if (hasPatientField) record = raw;
  }

  console.log('[EditPatient] GetPatient resolved record:', JSON.stringify(record)?.substring(0, 300));

  if (!record) {
    // API returned empty/unrecognised shape — throw so the screen's catch block
    // falls back to the route params (name/phone/age/gender) passed from the list.
    throw new Error(`No patient data returned for PID ${pid}`);
  }

  return record as PatientDetail;
}

// ─── Update patient ───────────────────────────────────────────────────────────

export interface UpdatePatientPayload {
  PID:                 number;
  PPID?:               number;
  BranchId:            number;
  Patregdate?:         string;
  Age:                 number;
  MDY?:                string;
  intial?:             string;
  Patname:             string;
  sex:                 string;
  MobileNo:            string;
  Email?:              string;
  EmailID?:            string;
  Pataddress?:         string;
  PatHistory?:         string;
  Comment?:            string;
  DateOfBirth?:        string;
  AccDateofBirth?:     boolean;
  PatientCardNo?:      string;
  PatientCardExpNo?:   string;
  DoctorCode?:         number;
  CenterCode?:         number;
  Username?:           string;
  Usertype?:           string;
  Drname?:             string;
  CenterName?:         string;
  Weights?:            string;
  Heights?:            string;
  Disease?:            string;
  RefDr?:              string;
  LastPeriod?:         string;
  Symptoms?:           string;
  FSTime?:             string;
  Therapy?:            string;
  TestCharges?:        number;
  Isemergency?:        boolean;
  IsbillBH?:           boolean;
  HospitalNo?:         string | null;
  ReportType?:         string;
  FID?:                number;
  Patauthicante?:      string;
  RID?:                number;
  billdate?:           string;
  transdate?:          string;
  PaymentType?:        string;
  OnlineTransType?:    string;
  OnlineTransID?:      string;
  BankName?:           string | null;
  ChqNo?:              string | null;
  ChqDate?:            string | null;
  CardNo?:             string | null;
  CardName?:           string | null;
  Cardtype?:           string | null;
  CardExpiryDate?:     string | null;
  CardTransactionID?:  string | null;
  BillAmt?:            number;
  DisAmt?:             number;
  OtherCharges?:       number;
  OtherChargeRemark?:  string | null;
  DiscountRemark?:     string;
  TaxPer?:             number;
  TaxAmount?:          number;
  AmtPaid?:            number;
  BalAmt?:             number;
  TestList?:           TestListItem[];
  uploadPrescription?: string;
  ImagePath?:          string;
}

export interface TestListItem {
  TestType:      string;
  MainTestId:    number;
  PackageId:     number;
  PackageCode?:  string;
  MTCode:        string;
  SDCode?:       string;
  PatTestName?:  string;
  MainTestName?: string;
  SampleType?:   string;
  SampleTypeID?: number;
  Amount:        number;
  ClientRate?:   number;
  BarcodeID?:    string;
}

/**
 * PATCH /api/EditPatient/UpdatePatient  ← server only accepts PATCH (Allow header confirmed)
 */
export async function updatePatient(payload: UpdatePatientPayload): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/EditPatient/UpdatePatient`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify(payload),
  });

  // Parse safely — some endpoints return empty body on success
  const text = await res.text();
  console.log('[EditPatient] UpdatePatient response status:', res.status, '| body:', text?.substring(0, 200));
  let raw: any = null;
  try { raw = text ? JSON.parse(text) : null; } catch { raw = null; }

  if (!res.ok) throw new Error(raw?.Message || raw?.message || `Server error (${res.status})`);
  return raw?.Message ?? raw?.message ?? 'Patient updated successfully.';
}

/**
 * PATCH /api/EditPatient/UpdateFiles  ← server only accepts PATCH (confirmed)
 * Body: { PID, BranchId, uploadPrescription, ImagePath }
 */
export async function updatePatientFiles(params: {
  PID:                 number;
  BranchId?:           number;
  uploadPrescription?: string;
  ImagePath?:          string;
}): Promise<string> {
  const body = {
    PID:                 params.PID,
    BranchId:            params.BranchId            ?? 1,
    uploadPrescription:  params.uploadPrescription  ?? '',
    ImagePath:           params.ImagePath           ?? '',
  };
  const res = await fetch(`${API_BASE_URL}/api/EditPatient/UpdateFiles`, {
    method:  'PATCH',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify(body),
  });
  const text2 = await res.text();
  let raw2: any = null;
  try { raw2 = text2 ? JSON.parse(text2) : null; } catch { raw2 = null; }
  if (!res.ok) throw new Error(raw2?.Message || raw2?.message || `Server error (${res.status})`);
  return raw2?.Message ?? raw2?.message ?? 'Files updated successfully.';
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** First day of current month  →  "YYYY-MM-01T00:00:00" */
export function startOfMonth(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}-01T00:00:00`;
}

/** End of today  →  "YYYY-MM-DDT23:59:59" */
export function endOfToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}T23:59:59`;
}

/** Format a date string for display */
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
