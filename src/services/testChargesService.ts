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
export async function getAllTestCharges(params?: {
  RateTypeId?: number;
  MainTestId?: number | null;
  BranchId?: number;
}): Promise<TestCharge[]> {
  const body: any = { BranchId: 1 };
  if (params?.RateTypeId) body.RateTypeId = params.RateTypeId;
  if (params?.MainTestId) body.MainTestId = params.MainTestId;

  const response = await api.post<any>('/api/TestCharges/GetAllTestCharges', body);
  console.log('[getAllTestCharges] raw:', JSON.stringify(response.data)?.substring(0, 300));
  const data = response.data;
  if (Array.isArray(data)) return data;
  if (data?.data  && Array.isArray(data.data))  return data.data;
  if (data?.Data  && Array.isArray(data.Data))  return data.Data;
  return [];
}

/**
 * Load ALL test charges with BranchId only — used to populate dropdowns.
 * Derives unique RateTypes, SubDepts and MainTests from the full list.
 */
export async function getAllTestChargesForDropdowns(): Promise<TestCharge[]> {
  return getAllTestCharges({ BranchId: 1 });
}

/**
 * Derive Rate Types from the full GetAllTestCharges list.
 */
export async function getAllRateTypes(): Promise<{ RateTypeId: number; RateTypeName: string }[]> {
  const all = await getAllTestChargesForDropdowns();
  console.log('[getAllRateTypes] total records:', all.length);
  const map = new Map<number, string>();
  all.forEach(t => {
    if (t.RateTypeId != null && t.RateTypeName) map.set(t.RateTypeId, t.RateTypeName);
  });
  return Array.from(map.entries()).map(([id, name]) => ({ RateTypeId: id, RateTypeName: name }));
}

/**
 * Derive Sub Departments from the full GetAllTestCharges list.
 */
export async function getAllSubDepts(): Promise<{ SubDeptId: number; SubDeptName: string }[]> {
  const all = await getAllTestChargesForDropdowns();
  console.log('[getAllSubDepts] total records:', all.length);
  const map = new Map<number, string>();
  all.forEach(t => {
    if (t.SubDeptId != null) {
      // API returns SubDeptId but no SubDeptName — use ID as label for now
      map.set(t.SubDeptId, `Sub Dept ${t.SubDeptId}`);
    }
  });
  return Array.from(map.entries()).map(([id, name]) => ({ SubDeptId: id, SubDeptName: name }));
}

/**
 * Derive Main Tests from the full GetAllTestCharges list.
 */
export async function getAllMainTests(): Promise<{ MainTestId: number; MainTestName: string }[]> {
  const all = await getAllTestChargesForDropdowns();
  console.log('[getAllMainTests] total records:', all.length);
  const map = new Map<number, string>();
  all.forEach(t => {
    if (t.MainTestId != null && t.TestName) map.set(t.MainTestId, t.TestName);
  });
  return Array.from(map.entries()).map(([id, name]) => ({ MainTestId: id, MainTestName: name }));
}
