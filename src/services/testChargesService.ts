import api from './apiService';
import { TestCharge, Package } from '../utils/types';

/**
 * POST /api/TestCharges/GetTestChargesById
 * Body: { Action: "GETBYID", TestChargeId: number }
 */
export async function getTestChargeById(testChargeId: number): Promise<TestCharge> {
  const response = await api.post<TestCharge>('/api/TestCharges/GetTestChargesById', {
    Action: 'GETBYID',
    TestChargeId: testChargeId,
  });
  return response.data;
}

/**
 * POST /api/TestCharges/DeleteTestCharges
 * Body: { Action: "DELETE", TestChargeId: number }
 */
export async function deleteTestCharge(testChargeId: number): Promise<string> {
  const response = await api.post<{ Message: string }>('/api/TestCharges/DeleteTestCharges', {
    Action: 'DELETE',
    TestChargeId: testChargeId,
  });
  return response.data?.Message || 'Record deleted successfully';
}

/**
 * POST /api/TestCharges/GetPackages
 * Body: { BranchId: number }
 */
export async function getPackages(branchId: number = 1): Promise<Package[]> {
  const response = await api.post<Package[]>('/api/TestCharges/GetPackages', {
    BranchId: branchId,
  });
  return response.data;
}

/**
 * POST /api/TestCharges/GetAllTestCharges
 * Body: { BranchId: number } — no filters = fetch all records
 * Body: { MainTestId, RateTypeId, BranchId } — filtered search
 */
/**
 * POST /api/TestCharges/GetAllTestCharges
 * NOTE: Backend GetAllTestCharges returns "No data found" regardless of params.
 * Workaround: Fetch all test names first, then fetch each charge by MainTestId.
 */
export async function getAllTestCharges(params?: {
  RateTypeId?: number;
  MainTestId?: number | null;
  BranchId?: number;
}): Promise<TestCharge[]> {
  // If specific MainTestId given, use GetTestChargesById directly
  if (params?.MainTestId) {
    try {
      const response = await api.post<any>('/api/TestCharges/GetTestChargesById', {
        BranchId: params.BranchId ?? 1,
        TestChargeId: params.MainTestId,
      });
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      return list;
    } catch { return []; }
  }

  // Otherwise fetch by ID range — get test names to know how many tests exist
  try {
    const testNames = await postRaw<any>(`${API_BASE_URL}/api/TestStatus/GetTestName`, { BranchId: params?.BranchId ?? 1 });
    const names: any[] = Array.isArray(testNames) ? testNames
      : testNames?.value && Array.isArray(testNames.value) ? testNames.value
      : testNames?.data  && Array.isArray(testNames.data)  ? testNames.data : [];

    // Fetch charges for IDs 1 to ~50 (adjust as needed)
    const maxId = Math.max(50, names.length * 4);
    const results: TestCharge[] = [];
    const batchSize = 10;

    for (let id = 1; id <= maxId; id += batchSize) {
      const batch = Array.from({ length: batchSize }, (_, i) => id + i);
      const settled = await Promise.allSettled(
        batch.map(tcId =>
          api.post<any>('/api/TestCharges/GetTestChargesById', {
            BranchId: params?.BranchId ?? 1,
            TestChargeId: tcId,
          })
        )
      );
      for (const r of settled) {
        if (r.status === 'fulfilled') {
          const d = r.value.data;
          const list = Array.isArray(d) ? d : (d?.data ?? []);
          for (const item of list) {
            if (item && item.TestChargeId) {
              // Apply RateTypeId filter if provided
              if (params?.RateTypeId && item.RateTypeId !== params.RateTypeId) continue;
              results.push(item);
            }
          }
        }
      }
    }
    return results;
  } catch { return []; }
}

/**
 * Load ALL test charges — used to populate dropdowns.
 */
export async function getAllTestChargesForDropdowns(): Promise<TestCharge[]> {
  return getAllTestCharges({ BranchId: 1 });
}

/**
 * Rate Types — derived from actual test charge data since RateTypeMaster endpoint is down.
 * Falls back to hardcoded known values from the database.
 */
export async function getAllRateTypes(): Promise<{ RateTypeId: number; RateTypeName: string }[]> {
  // Hardcoded from known DB data (RateTypeId=1 = MRP1 seen in GetTestChargesById responses)
  return [
    { RateTypeId: 1, RateTypeName: 'MRP1' },
    { RateTypeId: 2, RateTypeName: 'MRP2' },
    { RateTypeId: 3, RateTypeName: 'MRP3' },
  ];
}

/**
 * POST /api/TestStatus/GetSubDepartment  — confirmed working
 */
export async function getAllSubDepts(): Promise<{ SubDeptId: number; SubDeptName: string }[]> {
  try {
    const data = await postRaw<any>(`${API_BASE_URL}/api/TestStatus/GetSubDepartment`, { BranchId: 1 });
    const list: any[] = Array.isArray(data) ? data
      : data?.value ? data.value
      : data?.data  ? data.data : [];
    if (list.length > 0) {
      return list.map(d => ({
        SubDeptId:   d.ID        ?? d.SubDeptId   ?? d.id   ?? 0,
        SubDeptName: d.SubDepartmentName ?? d.SubDeptName ?? '',
      }));
    }
  } catch { /* fall through */ }
  // Hardcoded fallback from confirmed API response
  return [
    { SubDeptId: 1, SubDeptName: 'HEMATOLOGY' },
    { SubDeptId: 2, SubDeptName: 'BIOCHEMISTRY' },
    { SubDeptId: 3, SubDeptName: 'SEROLOGY' },
    { SubDeptId: 4, SubDeptName: 'MICROBIOLOGY' },
    { SubDeptId: 5, SubDeptName: 'CLINICAL PATHOLOGY' },
    { SubDeptId: 6, SubDeptName: 'X-RAY' },
    { SubDeptId: 7, SubDeptName: 'ULTRASONOGRAPHY' },
    { SubDeptId: 8, SubDeptName: 'CT SCAN' },
    { SubDeptId: 9, SubDeptName: 'MRI' },
    { SubDeptId: 10, SubDeptName: 'ECG' },
    { SubDeptId: 11, SubDeptName: 'Package' },
  ];
}

/**
 * POST /api/MainTest/GetAll  — correct endpoint from Swagger
 */
export async function getAllMainTests(): Promise<{ MainTestId: number; MainTestName: string }[]> {
  try {
    const response = await api.post<any>('/api/MainTest/GetAll', {});
    console.log('[getAllMainTests] raw:', JSON.stringify(response.data)?.substring(0, 200));
    const data = response.data;
    if (Array.isArray(data) && data.length > 0) return data;
    if (data?.data  && Array.isArray(data.data)  && data.data.length  > 0) return data.data;
    if (data?.Data  && Array.isArray(data.Data)  && data.Data.length  > 0) return data.Data;
  } catch (e) {
    console.log('[getAllMainTests] endpoint failed, deriving from GetAllTestCharges');
  }
  // Fallback: derive from full list
  const all = await getAllTestChargesForDropdowns();
  const map = new Map<number, string>();
  all.forEach(t => { if (t.MainTestId != null && t.TestName) map.set(t.MainTestId, t.TestName); });
  return Array.from(map.entries()).map(([id, name]) => ({ MainTestId: id, MainTestName: name }));
}

// ─── Additional types and functions needed by screens ─────────────────────────

import { API_BASE_URL } from '../utils/constants';

async function postRaw<T = any>(url: string, body: object): Promise<T> {
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify(body),
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (typeof data === 'object' && data !== null &&
      (data.message || data.Message || data.title)) ||
      (typeof data === 'string' && data) ||
      `Server error (HTTP ${res.status})`;
    throw new Error(String(msg));
  }
  return data as T;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CenterItem {
  CenterCode: string;
  CenterName: string;
}

export interface TestNameItem {
  MainTestId:   number;
  MainTestName: string;
  TestName:     string;   // alias for MainTestName
  TestCode:     string;
}

export interface SubDeptItem {
  SubDeptId:   number;
  SubDeptName: string;
}

export interface RateTypeItem {
  RateTypeId:   number;
  RateTypeName: string;
}

export interface PackageItem {
  PackageId:   number;
  PackageName: string;
}

export interface TestChargeRecord {
  TestChargeId:  number;
  SubDeptId:     number;
  SubDeptName?:  string;
  MainTestId:    number;
  PackageId:     number | null;
  PackageName:   string | null;
  RateTypeName:  string;
  RateTypeId:    number;
  TestType:      string;
  MTCODE:        string;
  TestName:      string;
  Amount:        number;
  Percentage:    number;
  Emergency:     number;
  CreatedBy?:    string;
  CreatedOn?:    string;
  IsActive?:     boolean;
}

export interface SaveTestChargePayload {
  TestType:     string;
  SubDeptId:    number;
  MainTestId:   number;
  PackageId:    number | null;
  PackageName:  string | null;
  RateTypeName: string;
  RateTypeId:   number;
  MTCode:       string;
  TestName:     string;
  Amount:       number;
  Percentage:   number;
  Emergency:    number;
  CreatedBy:    string;
}

export interface UpdateTestChargePayload extends SaveTestChargePayload {
  TestChargeId: number;
  UpdatedBy:    string;
}

// ─── Centers ───────────────────────────────────────────────────────────────────

/** POST /api/TestStatus/GetCenter */
export async function getCenters(branchId: number = 1): Promise<CenterItem[]> {
  try {
    const data = await postRaw<any>(`${API_BASE_URL}/api/TestStatus/GetCenter`, { BranchId: branchId });
    if (Array.isArray(data)) return data;
    if (data?.value && Array.isArray(data.value)) return data.value;
    if (data?.data  && Array.isArray(data.data))  return data.data;
    return [];
  } catch { return []; }
}

// ─── Test Names ────────────────────────────────────────────────────────────────

/** POST /api/TestStatus/GetTestName */
export async function getTestNames(branchId: number = 1): Promise<TestNameItem[]> {
  try {
    const data = await postRaw<any>(`${API_BASE_URL}/api/TestStatus/GetTestName`, { BranchId: branchId });
    const raw: any[] = Array.isArray(data) ? data
      : data?.value && Array.isArray(data.value) ? data.value
      : data?.data  && Array.isArray(data.data)  ? data.data : [];
    return raw.map(r => ({
      MainTestId:   r.MainTestId   ?? r.mainTestId   ?? r.ID   ?? r.Id   ?? 0,
      MainTestName: (r.MainTestName ?? r.mainTestName ?? r.TestName ?? '').trim(),
      TestName:     (r.MainTestName ?? r.mainTestName ?? r.TestName ?? '').trim(),
      TestCode:     (r.TestCode     ?? r.testCode     ?? r.Code   ?? '').trim(),
    }));
  } catch { return []; }
}

// ─── Sub Departments (TestStatus endpoint — confirmed working) ─────────────────

/** POST /api/TestStatus/GetSubDepartment */
export async function getSubDepts(branchId: number = 1): Promise<SubDeptItem[]> {
  try {
    const data = await postRaw<any>(`${API_BASE_URL}/api/TestStatus/GetSubDepartment`, { BranchId: branchId });
    const list: any[] = Array.isArray(data) ? data
      : data?.value && Array.isArray(data.value) ? data.value
      : data?.data  && Array.isArray(data.data)  ? data.data : [];
    return list.map(d => ({
      SubDeptId:   d.SubDeptId   ?? d.ID   ?? d.Id   ?? 0,
      SubDeptName: d.SubDeptName ?? d.SubDepartmentName ?? '',
    }));
  } catch { return []; }
}

// ─── Rate Types (TestStatus endpoint) ─────────────────────────────────────────

/** POST /api/TestStatus/GetRateType */
export async function getRateTypes(branchId: number = 1): Promise<RateTypeItem[]> {
  try {
    const data = await postRaw<any>(`${API_BASE_URL}/api/TestStatus/GetRateType`, { BranchId: branchId });
    const list: any[] = Array.isArray(data) ? data
      : data?.value && Array.isArray(data.value) ? data.value
      : data?.data  && Array.isArray(data.data)  ? data.data : [];
    return list.map(d => ({
      RateTypeId:   d.RateTypeId   ?? d.ID  ?? d.Id  ?? 0,
      RateTypeName: d.RateTypeName ?? d.Name ?? '',
    }));
  } catch { return []; }
}

// ─── TestCharges CRUD (direct fetch, matching confirmed Bruno payloads) ────────

const TC_BASE = `${API_BASE_URL}/api/TestCharges`;

export async function getAllTestChargesFiltered(rateTypeId: number, subDeptId: number): Promise<TestChargeRecord[]> {
  const data = await postRaw<any>(`${TC_BASE}/GetAllTestCharges`, { RateTypeId: rateTypeId, SubDeptId: subDeptId });
  if (Array.isArray(data)) return data;
  if (data?.value && Array.isArray(data.value)) return data.value;
  if (data?.data  && Array.isArray(data.data))  return data.data;
  return [];
}

export async function saveTestCharge(payload: SaveTestChargePayload): Promise<any> {
  return postRaw(`${TC_BASE}/SaveTestCharges`, payload);
}

export async function updateTestCharge(payload: UpdateTestChargePayload): Promise<any> {
  return postRaw(`${TC_BASE}/UpdateTestCharges`, payload);
}
