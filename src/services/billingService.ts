import { API_BASE_URL } from '../utils/constants';

const BASE = API_BASE_URL;

async function post<T>(endpoint: string, body: object): Promise<T> {
  const res = await fetch(`${BASE}${endpoint}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message ?? data?.Message ?? `HTTP ${res.status}`);
  return data as T;
}

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface BillingPatient {
  PID:             number;
  PatRegID:        number;
  PatientName:     string;
  MobileNo:        string;
  Patphoneno:      string;
  Patregdate:      string;
  TestCharges:     number;
  PaidAmount:      number;
  DiscountAmount:  number;
  OutstandingAmount: number;
  PaymentStatus:   string;
  CenterName:      string;
  Drname:          string;
}

export interface PatientBill {
  PID:             number;
  PatientName:     string;
  TestCharges:     number;
  PaidAmount:      number;
  DiscountAmount:  number;
  OtherCharges:    number;
  OutstandingAmount: number;
  PaymentDetails:  PaymentRecord[];
  Tests:           BillTest[];
}

export interface PaymentRecord {
  RID:           number;
  AmtPaid:       number;
  PaymentType:   string;
  TransDate:     string;
  DisAmt:        number;
  OtherCharges:  number;
  Remark:        string;
  Username:      string;
}

export interface BillTest {
  MainTestName: string;
  TestCharges:  number;
  Status:       string;
}

export interface BillingCenter {
  CenterCode: number;
  CenterName: string;
}

export interface SavePaymentPayload {
  PID:               number;
  BranchId:          number;
  AmtPaid:           number;
  DisAmt:            number;
  DiscountRemark:    string;
  OtherCharges:      number;
  OtherChargeRemark: string;
  PaymentType:       string;
  Username:          string;
  TransDate:         string;
  Remark:            string;
  BankName:          string;
  ChqNo:             string;
  ChqDate:           string | null;
  CardNo:            string;
  CardName:          string;
  CardType:          string;
  CardTransactionID: string;
  OnlineTransType:   string;
  OnlineTransID:     string;
}

export interface UpdatePaymentPayload {
  RID:               number;
  AmtPaid:           number;
  PaymentType:       string;
  Username:          string;
  TransDate:         string;
  DisAmt:            number;
  DiscountRemark:    string | null;
  OtherCharges:      number;
  OtherChargeRemark: string | null;
  BankName:          string | null;
  ChqNo:             string | null;
  ChqDate:           string | null;
  CardNo:            string | null;
  CardName:          string | null;
  CardType:          string | null;
  CardTransactionID: string | null;
  OnlineTransType:   string | null;
  OnlineTransID:     string | null;
}

export interface SaveRefundPayload {
  PID:             number;
  BranchId:        number;
  Username:        string;
  PaymentType:     string;
  TransDate:       string;
  Remark:          string;
  BankName:        string | null;
  ChqNo:           string | null;
  ChqDate:         string | null;
  CardNo:          string | null;
  CardName:        string | null;
  CardType:        string | null;
  CardTransactionID: string | null;
  OnlineTransType: string | null;
  OnlineTransID:   string | null;
}

// ── API Functions ─────────────────────────────────────────────────────────────

/** GET all billing patients with filters */
export async function getBillingPatients(params: {
  BranchId:      number;
  FromDate:      string;
  ToDate:        string;
  CenterCode?:   number;
  PatientName?:  string;
  MobileNo?:     string;
  PatRegID?:     number;
  PaymentStatus?: string;
  PageNo?:       number;
  PageSize?:     number;
}): Promise<BillingPatient[]> {
  const body = {
    BranchId:      params.BranchId,
    FromDate:      params.FromDate,
    ToDate:        params.ToDate,
    CenterCode:    params.CenterCode   ?? 0,
    PatientName:   params.PatientName  ?? '',
    MobileNo:      params.MobileNo     ?? '',
    PatRegID:      params.PatRegID     ?? 0,
    PaymentStatus: params.PaymentStatus ?? 'All',
    PageNo:        params.PageNo       ?? 1,
    PageSize:      params.PageSize     ?? 50,
  };
  const data = await post<any>('/api/BillingDesk/GetAllPatients', body);
  const list: any[] = Array.isArray(data) ? data
    : data?.value  ? data.value
    : data?.data   ? data.data
    : data?.Data   ? data.Data : [];
  return list;
}

/** GET patient bill detail */
export async function getPatientBill(PID: number, BranchId = 1): Promise<PatientBill | null> {
  const data = await post<any>('/api/BillingDesk/GetPatientBill', { PID, BranchId });
  if (!data) return null;
  // Normalize
  const bill = Array.isArray(data) ? data[0] : data?.value?.[0] ?? data?.data?.[0] ?? data;
  return bill ?? null;
}

/** GET billing centers */
export async function getBillingCenters(BranchId = 1): Promise<BillingCenter[]> {
  const data = await post<any>('/api/BillingDesk/GetCenters', { BranchId });
  const list: any[] = Array.isArray(data) ? data
    : data?.value ? data.value
    : data?.data  ? data.data : [];
  return list;
}

/** SAVE new payment */
export async function savePayment(payload: SavePaymentPayload): Promise<string> {
  const data = await post<any>('/api/BillingDesk/SavePayment', payload);
  return data?.message ?? data?.Message ?? 'Payment saved successfully';
}

/** UPDATE existing payment */
export async function updatePayment(payload: UpdatePaymentPayload): Promise<string> {
  const data = await post<any>('/api/BillingDesk/UpdatePayment', payload);
  return data?.message ?? data?.Message ?? 'Payment updated successfully';
}

/** DELETE payment */
export async function deletePayment(RID: number, BranchId = 1): Promise<string> {
  const data = await post<any>('/api/BillingDesk/DeletePayment', { RID, BranchId });
  return data?.message ?? data?.Message ?? 'Payment deleted';
}

/** SAVE refund */
export async function saveRefund(payload: SaveRefundPayload): Promise<string> {
  const data = await post<any>('/api/BillingCancellation/SaveRefund', payload);
  return data?.message ?? data?.Message ?? 'Refund processed successfully';
}

/** GET refund details */
export async function getRefund(PID: number, BranchId = 1): Promise<any[]> {
  const data = await post<any>('/api/BillingCancellation/GetRefund', { PID, BranchId });
  const list: any[] = Array.isArray(data) ? data
    : data?.value ? data.value
    : data?.data  ? data.data : [];
  return list;
}

/** GET cancellation statuses for multiple PIDs */
export async function getCancellationStatuses(PIDs: number[], BranchId = 1): Promise<any[]> {
  const data = await post<any>('/api/BillingCancellation/GetStatuses', { BranchId, PIDs });
  const list: any[] = Array.isArray(data) ? data
    : data?.value ? data.value
    : data?.data  ? data.data : [];
  return list;
}
