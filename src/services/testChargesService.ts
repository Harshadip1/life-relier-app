/**
 * Test Charges API service
 *
 * Base URL : https://dn8labapi.liferelier.in
 * Endpoints — /api/TestCharges/
 *   POST GetAllTestCharges    — body: { RateTypeId, SubDeptId }  (filters required — mirrors website)
 *   POST GetTestChargesById   — body: { Action: "GETBYID", TestChargeId }
 *   POST SaveTestCharges      — body: { TestType, SubDeptId, MainTestId, PackageId, RateTypeName,
 *                                        RateTypeId, MTCode, TestName, Amount, Percentage, Emergency,
 *                                        PackageName, CreatedBy }
 *   POST DeleteTestCharges    — body: { Action: "DELETE", TestChargeId }
 *
 * Sub Department — /api/TestStatus/GetSubDepartment  — body: { BranchId }
 * Rate Type      — /api/TestStatus/GetRateType        — body: { BranchId }
 */

import { API_BASE_URL } from '../utils/constants';

const BASE          = `${API_BASE_URL}/api/TestCharges`;
const SUBDEPT_BASE  = `${API_BASE_URL}/api/TestStatus`;
const RATETYPE_BASE = `${API_BASE_URL}/api/TestStatus`;

// ─── Generic POST helper ──────────────────────────────────────────────────────

async function post<T = any>(url: string, body: object): Promise<T> {
  console.log(`[TC API] POST ${url}`, JSON.stringify(body));

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify(body),
  });

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  console.log(`[TC API] ${url.split('/').pop()} =>`, res.status, JSON.stringify(data)?.substring(0, 300));

  if (!res.ok) {
    const msg =
      (typeof data === 'object' && data !== null &&
        (data.message || data.Message || data.title || data.Title)) ||
      (typeof data === 'string' && data) ||
      `Server error (HTTP ${res.status})`;
    throw new Error(String(msg));
  }
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

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

export interface SubDeptItem {
  SubDeptId:   number;
  SubDeptName: string;
}

export interface RateTypeItem {
  RateTypeId:   number;
  RateTypeName: string;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/** Fetch test charges filtered by RateTypeId + SubDeptId (required by API — matches website) */
export async function getAllTestCharges(rateTypeId: number, subDeptId: number): Promise<TestChargeRecord[]> {
  const data = await post<any>(`${BASE}/GetAllTestCharges`, { RateTypeId: rateTypeId, SubDeptId: subDeptId });
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data?.message || data?.Message) return [];
  return [];
}

export async function getTestChargesById(testChargeId: number): Promise<TestChargeRecord | null> {
  const data = await post<any>(`${BASE}/GetTestChargesById`, { Action: 'GETBYID', TestChargeId: testChargeId });
  if (Array.isArray(data) && data.length > 0) return data[0];
  if (data?.TestChargeId) return data;
  return null;
}

export async function saveTestCharge(payload: SaveTestChargePayload): Promise<any> {
  return post(`${BASE}/SaveTestCharges`, payload);
}

export async function deleteTestCharge(testChargeId: number): Promise<any> {
  return post(`${BASE}/DeleteTestCharges`, { Action: 'DELETE', TestChargeId: testChargeId });
}

export interface UpdateTestChargePayload extends SaveTestChargePayload {
  TestChargeId: number;
  UpdatedBy:    string;
}

export async function updateTestCharge(payload: UpdateTestChargePayload): Promise<any> {
  return post(`${BASE}/UpdateTestCharges`, payload);
}

export interface PackageItem {
  PackageId:   number;
  PackageName: string;
}

export async function getPackages(branchId: number = 1): Promise<PackageItem[]> {
  try {
    const data = await post<any>(`${BASE}/GetPackages`, { BranchId: branchId });
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  } catch { return []; }
}

// ─── Centers ──────────────────────────────────────────────────────────────────

export interface CenterItem {
  CenterCode: string;
  CenterName: string;
}

/** Fetch collection centers — POST /api/TestStatus/GetCenter */
export async function getCenters(branchId: number = 1): Promise<CenterItem[]> {
  try {
    const data = await post<any>(`${API_BASE_URL}/api/TestStatus/GetCenter`, { BranchId: branchId });
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  } catch { return []; }
}

// ─── Test Names ───────────────────────────────────────────────────────────────

export interface TestNameItem {
  MainTestName: string;
}

/** Fetch test names — POST /api/TestStatus/GetTestName */
export async function getTestNames(branchId: number = 1): Promise<TestNameItem[]> {
  try {
    const data = await post<any>(`${API_BASE_URL}/api/TestStatus/GetTestName`, { BranchId: branchId });
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  } catch { return []; }
}

/** Sub Departments dropdown */
export async function getAllSubDepts(branchId: number = 1): Promise<SubDeptItem[]> {
  try {
    const data = await post<any>(`${SUBDEPT_BASE}/GetSubDepartment`, { BranchId: branchId });
    const list: any[] = Array.isArray(data) ? data
      : data?.data && Array.isArray(data.data) ? data.data : [];
    // Normalise both field name conventions the API may return
    return list.map(d => ({
      SubDeptId:   d.SubDeptId   ?? d.ID   ?? d.Id   ?? 0,
      SubDeptName: d.SubDeptName ?? d.SubDepartmentName ?? '',
    }));
  } catch { return []; }
}

/** Rate Types dropdown */
export async function getAllRateTypes(branchId: number = 1): Promise<RateTypeItem[]> {
  try {
    const data = await post<any>(`${RATETYPE_BASE}/GetRateType`, { BranchId: branchId });
    const list: any[] = Array.isArray(data) ? data
      : data?.data && Array.isArray(data.data) ? data.data : [];
    // Normalise both field name conventions the API may return
    return list.map(d => ({
      RateTypeId:   d.RateTypeId   ?? d.ID  ?? d.Id  ?? 0,
      RateTypeName: d.RateTypeName ?? d.Name ?? '',
    }));
  } catch { return []; }
}
