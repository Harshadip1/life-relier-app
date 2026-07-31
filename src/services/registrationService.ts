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
  Patname:    string;
  Age:        number;
  Pataddress: string;
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
 * Search patients by name using GetPatientTestStatus (confirmed working).
 * De-duplicates by PID so each patient appears once in dropdown.
 */
export async function searchPatient(searchText: string): Promise<SearchPatientItem[]> {
  if (!searchText || searchText.trim().length < 2) return [];
  const today = new Date().toISOString().split('T')[0];
  try {
    const res = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        BranchId: 1, FromDate: '2024-01-01', ToDate: today,
        PatRegID: '', PatientName: searchText.trim(),
        DoctorName: '', TestName: '', MobileNo: '',
        Barcode: '', CenterCode: '', SubDepartment: '', Status: 'All',
      }),
    });
    const data = await res.json();
    const rows: any[] = Array.isArray(data) ? data : (data?.value ?? []);
    // De-duplicate by PID
    const seen = new Set<number>();
    const result: SearchPatientItem[] = [];
    for (const r of rows) {
      const pid = r.PatRegID ?? r.PID;
      if (seen.has(pid)) continue;
      seen.add(pid);
      result.push({
        PPID:             pid,
        Patname:          r.Patname ?? r.PatientName ?? '',
        intial:           '',
        sex:              r.sex ?? '',
        Age:              r.Age ?? 0,
        MDY:              r.MDY ?? 'Year',
        MobileNo:         r.Patphoneno ?? '',
        Email:            r.Email ?? '',
        Pataddress:       '',
        PatientCardNo:    '',
        PatientCardExpNo: '',
        DateOfBirth:      null,
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
 * Search patients by mobile number.
 * Requires exactly 10 digits and only returns exact matches.
 */
export async function searchPatientByMobile(mobileNo: string): Promise<SearchPatientItem[]> {
  if (!mobileNo || mobileNo.trim().length !== 10) return [];
  const today = new Date().toISOString().split('T')[0];
  try {
    const res = await fetch(`${API_BASE_URL}/api/TestStatus/GetPatientTestStatus`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        BranchId: 1, FromDate: '2024-01-01', ToDate: today,
        PatRegID: '', PatientName: '', DoctorName: '', TestName: '', MobileNo: mobileNo.trim(),
        Barcode: '', CenterCode: '', SubDepartment: '', Status: 'All',
      }),
    });
    const data = await res.json();
    const rows: any[] = Array.isArray(data) ? data : (data?.value ?? []);
    
    // We only want exact matches
    const exactMatches = rows.filter(r => {
      const p = (r.Patphoneno || r.MobileNo || '').toString().trim();
      return p === mobileNo.trim();
    });

    // De-duplicate by PID
    const seen = new Set<number>();
    const result: SearchPatientItem[] = [];
    for (const r of exactMatches) {
      const pid = r.PatRegID ?? r.PID;
      if (seen.has(pid)) continue;
      seen.add(pid);
      result.push({
        PPID:             pid,
        Patname:          r.Patname ?? r.PatientName ?? '',
        intial:           '',
        sex:              r.sex ?? '',
        Age:              r.Age ?? 0,
        MDY:              r.MDY ?? 'Year',
        MobileNo:         (r.Patphoneno || r.MobileNo || '').toString().trim(),
        Email:            r.Email ?? '',
        Pataddress:       '',
        PatientCardNo:    '',
        PatientCardExpNo: '',
        DateOfBirth:      null,
      });
    }
    return result;
  } catch { return []; }
}
