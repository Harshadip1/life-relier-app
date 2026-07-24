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
  MobileNo:         string | null;
  Email:            string | null;
  Pataddress:       string | null;
  DateOfBirth:      string | null;
  PatientCardNo:    string | null;
  PatientCardExpNo: string | null;
  BranchId:         number | null;
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
 * POST /api/Search/SearchPatInfoByMobileNoAndName
 * Body: { SearchText: string, BranchId: number }
 * Used to pre-fill form when searching existing patient by mobile/name
 */
export async function searchPatient(searchText: string): Promise<SearchPatientItem[]> {
  const data = await postJson<any>('/api/Search/SearchPatInfoByMobileNoAndName', {
    SearchText: searchText,
    BranchId:   1,
  });
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
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
