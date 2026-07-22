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
  // optional extras the API may return
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

  const raw = await res.json();
  if (!res.ok) throw new Error(raw?.Message || raw?.message || `Server error (${res.status})`);

  // Normalise various response shapes the API might return
  if (Array.isArray(raw)) {
    return { data: raw, totalCount: raw.length, pageNo: body.PageNo, pageSize: body.PageSize };
  }
  if (raw?.data && Array.isArray(raw.data)) {
    return { data: raw.data, totalCount: raw.totalCount ?? raw.data.length, pageNo: body.PageNo, pageSize: body.PageSize };
  }
  if (raw?.Data && Array.isArray(raw.Data)) {
    return { data: raw.Data, totalCount: raw.TotalCount ?? raw.Data.length, pageNo: body.PageNo, pageSize: body.PageSize };
  }
  if (raw?.value && Array.isArray(raw.value)) {
    return { data: raw.value, totalCount: raw.value.length, pageNo: body.PageNo, pageSize: body.PageSize };
  }
  return { data: [], totalCount: 0, pageNo: body.PageNo, pageSize: body.PageSize };
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
  const res = await fetch(`${API_BASE_URL}/api/EditPatient/GetPatient`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify({ PID: pid }),
  });
  const raw = await res.json();
  if (!res.ok) throw new Error(raw?.Message || raw?.message || `Server error (${res.status})`);

  // API may return array with one element or a plain object
  if (Array.isArray(raw) && raw.length > 0) return raw[0];
  if (raw?.data && Array.isArray(raw.data) && raw.data.length > 0) return raw.data[0];
  if (raw?.Data && Array.isArray(raw.Data) && raw.Data.length > 0) return raw.Data[0];
  if (raw?.PID || raw?.PatientName) return raw;
  throw new Error('Patient not found');
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
 * POST /api/EditPatient/UpdatePatient
 */
export async function updatePatient(payload: UpdatePatientPayload): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/EditPatient/UpdatePatient`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify(payload),
  });
  const raw = await res.json();
  if (!res.ok) throw new Error(raw?.Message || raw?.message || `Server error (${res.status})`);
  return raw?.Message ?? raw?.message ?? 'Patient updated successfully.';
}

/**
 * POST /api/EditPatient/UpdateFiles
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
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify(body),
  });
  const raw = await res.json();
  if (!res.ok) throw new Error(raw?.Message || raw?.message || `Server error (${res.status})`);
  return raw?.Message ?? raw?.message ?? 'Files updated successfully.';
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
