import api from './apiService';
import { TestCharge, Package } from '../utils/types';

/**
 * POST /api/TestCharges/GetTestChargesById
 * Body: { Action: "GETBYID", TestChargeId: number }
 *
 * Returns the full TestCharge record for the given ID.
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
 *
 * Returns { Message: "Record deleted successfully" } on success.
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
 *
 * Returns an array of { PackageId, PackageName }.
 */
export async function getPackages(branchId: number = 1): Promise<Package[]> {
  const response = await api.post<Package[]>('/api/TestCharges/GetPackages', {
    BranchId: branchId,
  });
  return response.data;
}
