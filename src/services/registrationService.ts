import { API_BASE_URL } from '../utils/constants';

// ─── Helper ───────────────────────────────────────────────────────────────────
async function postJson<T = any>(path: string, body: object): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  console.log(`[API] POST ${url}`, JSON.stringify(body));

  let res: Response;
  try {
    res = await fetch(url, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(body),
    });
  } catch (e: any) {
    throw new Error('Cannot reach the server. Check your internet connection.');
  }

  const text = await res.text();
  console.log(`[API] ${path} → ${res.status}:`, text?.substring(0, 300));

  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }

  if (!res.ok) {
    throw new Error(data?.Message || data?.message || data?.title || `Server error (${res.status})`);
  }
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterPatientPayload {
  // ── Core patient demographics ──────────────────────────────────────────────
  Patname:           string;
  Age:               number;
  Pataddress:        string;
  BranchId:          number;
  BranchID:          number;
  intial:            string;
  sex:               string;
  MDY:               string;
  MobileNo:          string;
  Patphoneno:        string;
  Email:             string;
  EmailID:           string;
  DateOfBirth:       string | null;
  // ── Referring doctor ──────────────────────────────────────────────────────
  RefDoctor:         string;
  DoctorCode:        number | null;   // dr_codeid from referingDoctorService
  // ── Patient card / hospital ───────────────────────────────────────────────
  PatientCardNo:     string;
  PatientCardExpNo:  string;
  HospitalNo:        string;
  // ── Center ────────────────────────────────────────────────────────────────
  CenterCode:        number | null;
  CenterName:        string;
  // ── Clinical ──────────────────────────────────────────────────────────────
  Weights:           string;
  Heights:           string;
  Disease:           string;
  Symptoms:          string;
  Therapy:           string;
  FSTime:            string;
  LastPeriod:        string | null;
  ClinicalHist:      string;
  // ── Report flags ──────────────────────────────────────────────────────────
  ReportType:        string;
  Isemergency:       boolean;
  // ── Tests ─────────────────────────────────────────────────────────────────
  TestNames:         string[];   // backward compat — array of test name strings
  TestList: Array<{
    MainTestId:   number;
    TestName:     string;
    PatTestName:  string;
    MainTestName: string;
    TestType:     string;
    PackageId:    number;
    PackageCode:  string;
    MTCode:       string;
    Amount:       number;
    TestRate:     number;
    ClientRate:   number;
  }>;
  // ── Payment / billing ─────────────────────────────────────────────────────
  PaymentType:       string;
  TotalAmount?:      number;
  PaidAmount?:       number;
  DiscountAmount?:   number;
  OtherCharges:      number;
  OtherChargeRemark: string;
  Remark:            string;
  RateType:          string;
  TestCharges:       number;
  BillAmt:           number;
  AmtPaid:           number;
  DisAmt:            number;
  BalAmt:            number;
  // ── Status — required so backend creates the billing record ───────────────
  Status:            string;
}

export interface RegisterPatientResponse {
  PPID:            number | null;
  BranchId:        number | null;
  PatRegID:        number | null;
  PrefixRegNumber: string | null;
  PID:             number | null;
  RID:             number | null;
  ReceiptNo:       number | null;
  BillNo:          number | null;
  Message:         string;
}

export interface UpdatePatientFilesPayload {
  PID:        number;
  Patname:    string;
  Age:        number;
  Pataddress: string;
  BranchID:   number;
}

export interface UpdatePatientFilesResponse {
  PatRegID:  number | null;
  BranchId:  number | null;
  Message:   string;
}

export interface InitialItem { Id: number; Name: string }
export interface DoctorItem  { Id: number; Name: string }
export interface SearchPatientItem {
  PPID:             number;
  Patname:          string | null;
  intial:           string | null;
  sex:              string | null;
  Age:              number | null;
  MDY:              string | null;
  MobileNo:         string | null;
  Email:            string | null;
  Pataddress:       string | null;
  DateOfBirth:      string | null;
  PatientCardNo:    string | null;
  PatientCardExpNo: string | null;
  BranchId?:        number | null;
  RefDoctor?:       string | null;   // Referring doctor name
  DoctorName?:      string | null;   // Alternative doctor field
}

export interface TestResult {
  mainTestId:  number;
  displayText: string; // "TestName = Code = ID"
  testName:    string; // parsed
  testCode:    string; // parsed
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * POST /api/NewRegistration/RegisterPatient
 * Body: { Patname, Age, Pataddress }
 */
export async function registerPatient(
  payload: RegisterPatientPayload,
): Promise<RegisterPatientResponse> {
  return postJson('/api/NewRegistration/RegisterPatient', payload);
}

/**
 * POST /api/NewRegistration/UpdatePatientFiles
 * Body: { PID, Patname, Age, Pataddress, BranchID }
 */
export async function updatePatientFiles(
  payload: UpdatePatientFilesPayload,
): Promise<UpdatePatientFilesResponse> {
  return postJson('/api/NewRegistration/UpdatePatientFiles', payload);
}

/**
 * POST /api/Search/GetInitials
 * Returns list of initials (Mr, Mrs, Ms, Dr, etc.)
 */
export async function getInitials(): Promise<InitialItem[]> {
  const data = await postJson<any>('/api/Search/GetInitials', {});
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

/**
 * POST /api/Search/GetDoctors
 * Returns list of referring doctors
 */
export async function getDoctors(): Promise<DoctorItem[]> {
  const data = await postJson<any>('/api/Search/GetDoctors', {});
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

/**
 * Search patients by name using GetGrid.
 * De-duplicates by PID so each patient appears once in dropdown.
 */
export async function searchPatient(searchText: string): Promise<SearchPatientItem[]> {
  if (!searchText || searchText.trim().length < 2) return [];
  const today = new Date().toISOString().split('T')[0];
  try {
    const res = await fetch(`${API_BASE_URL}/api/EditPatient/GetGrid`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        BranchId: 1, FromDate: '2024-01-01T00:00:00', ToDate: `${today}T23:59:59`,
        PageNo: 1, PageSize: 30, CenterName: '', PatientName: searchText.trim(), MobileNo: '', PatRegID: 0
      }),
    });
    const data = await res.json();
    let rows: any[] = [];
    if (data?.Table0 && Array.isArray(data.Table0)) rows = data.Table0;
    else if (data?.GridData && Array.isArray(data.GridData)) rows = data.GridData;
    else if (Array.isArray(data)) rows = data;
    else if (data?.data && Array.isArray(data.data)) rows = data.data;
    else if (data?.value && Array.isArray(data.value)) rows = data.value;
    
    // De-duplicate by PID
    const seen = new Set<number>();
    const result: SearchPatientItem[] = [];
    for (const r of rows) {
      const pid = r.PatRegID ?? r.PID ?? r.PPID;
      if (!pid || seen.has(pid)) continue;
      seen.add(pid);
      result.push({
        PPID:             pid,
        Patname:          r.PatientName ?? r.Name ?? r.Patname ?? null,
        intial:           r.intial ?? r.Initial ?? r.Intial ?? null,
        sex:              r.Gender ?? r.sex ?? null,
        Age:              r.Age ?? null,
        MDY:              r.MDY ?? 'Year',
        MobileNo:         r.MobileNo ?? r.Patphoneno ?? r.Phone ?? null,
        Email:            r.Email ?? r.EmailID ?? null,
        Pataddress:       r.Address ?? r.Pataddress ?? r.PatientAddress ?? null,
        PatientCardNo:    r.PatientCardNo ?? r.CardNo ?? null,
        PatientCardExpNo: r.PatientCardExpNo ?? r.CardExpNo ?? null,
        DateOfBirth:      r.DOB ?? r.DateOfBirth ?? r.dob ?? null,
        RefDoctor:        r.RefDoctor ?? r.Drname ?? r.DoctorName ?? r.ReferingDoctor ?? null,
        DoctorName:       r.DoctorName ?? r.Drname ?? r.RefDoctor ?? null,
      });
    }
    return result.slice(0, 8);
  } catch { return []; }
}

/**
 * POST /api/Search/SearchTestAndPackage
 * Body: { SearchText: string, BranchId: number }
 * Returns: [{ mainTestId, displayText: "TestName = Code = ID" }]
 * Used for test autocomplete in the Add Tests step.
 */
export async function searchTests(searchText: string): Promise<TestResult[]> {
  const data = await postJson<any>('/api/Search/SearchTestAndPackage', {
    SearchText: searchText,
    BranchId:   1,
    RateTypeId: 1, // Required by backend
  });
  const list: any[] = Array.isArray(data) ? data
    : data?.data && Array.isArray(data.data) ? data.data : [];

  return list.map(item => {
    // displayText format: "Complete Blood Count = CBC001 = 1"
    const parts = (item.displayText || '').split(' = ');
    return {
      mainTestId:  item.mainTestId,
      displayText: item.displayText ?? '',
      testName:    parts[0]?.trim() ?? item.displayText ?? '',
      testCode:    parts[1]?.trim() ?? '',
    };
  });
}

/**
 * Search patients by mobile number using GetGrid.
 * Requires exactly 10 digits and only returns exact matches.
 */
export async function searchPatientByMobile(mobileNo: string): Promise<SearchPatientItem[]> {
  if (!mobileNo || mobileNo.trim().length !== 10) return [];
  const today = new Date().toISOString().split('T')[0];
  try {
    const res = await fetch(`${API_BASE_URL}/api/EditPatient/GetGrid`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        BranchId: 1, FromDate: '2024-01-01T00:00:00', ToDate: `${today}T23:59:59`,
        PageNo: 1, PageSize: 30, CenterName: '', PatientName: '', MobileNo: mobileNo.trim(), PatRegID: 0
      }),
    });
    const data = await res.json();
    let rows: any[] = [];
    if (data?.Table0 && Array.isArray(data.Table0)) rows = data.Table0;
    else if (data?.GridData && Array.isArray(data.GridData)) rows = data.GridData;
    else if (Array.isArray(data)) rows = data;
    else if (data?.data && Array.isArray(data.data)) rows = data.data;
    else if (data?.value && Array.isArray(data.value)) rows = data.value;
    
    // We only want exact matches
    const exactMatches = rows.filter(r => {
      const p = (r.MobileNo || r.Patphoneno || r.Phone || '').toString().trim();
      return p === mobileNo.trim();
    });

    const seen = new Set<number>();
    const result: SearchPatientItem[] = [];
    for (const r of exactMatches) {
      const pid = r.PatRegID ?? r.PID ?? r.PPID;
      if (!pid || seen.has(pid)) continue;
      seen.add(pid);
      result.push({
        PPID:             pid,
        Patname:          r.PatientName ?? r.Name ?? r.Patname ?? null,
        intial:           r.intial ?? r.Initial ?? r.Intial ?? null,
        sex:              r.Gender ?? r.sex ?? null,
        Age:              r.Age ?? null,
        MDY:              r.MDY ?? 'Year',
        MobileNo:         (r.MobileNo || r.Patphoneno || r.Phone || '').toString().trim() || null,
        Email:            r.Email ?? r.EmailID ?? null,
        Pataddress:       r.Address ?? r.Pataddress ?? r.PatientAddress ?? null,
        PatientCardNo:    r.PatientCardNo ?? r.CardNo ?? null,
        PatientCardExpNo: r.PatientCardExpNo ?? r.CardExpNo ?? null,
        DateOfBirth:      r.DOB ?? r.DateOfBirth ?? r.dob ?? null,
        RefDoctor:        r.RefDoctor ?? r.Drname ?? r.DoctorName ?? r.ReferingDoctor ?? null,
        DoctorName:       r.DoctorName ?? r.Drname ?? r.RefDoctor ?? null,
      });
    }
    return result;
  } catch { return []; }
}
