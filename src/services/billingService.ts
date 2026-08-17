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
  Patname:         string;       // API field
  PatientName:     string;       // alias
  Patphoneno:      string;
  MobileNo:        string;
  Patregdate:      string;
  intial:          string;
  Age:             number;
  sex:             string;
  RefDr:           string;
  CenterCode:      number;
  CenterName:      string;
  testname:        string;       // comma-separated tests
  TestCharges:     number;
  OtherCharges:    number;
  Charges:         number;       // total incl other charges
  Discount:        number;
  Paid:            number;
  Balance:         number;       // outstanding
  BillNo:          number;
  ReceiptNumbers:  string;
  TotalRecords:    number;
  PaymentStatus:   string;
}

export interface PatientBill {
  Patient:  BillingPatient[];
  Receipts: ReceiptRecord[];
}

export interface ReceiptRecord {
  RID:               number;
  ReceiptNo:         number;
  BillNo:            number;
  billdate:          string;
  BillAmt:           number;
  AmtPaid:           number;
  DisAmt:            number;
  DiscountRemark:    string | null;
  OtherCharges:      number;
  OtherChargeRemark: string | null;
  PaymentType:       string;
  transdate:         string;
  username:          string;
  PrevBal:           number;
  BalAmt:            number;
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
  // Normalize field aliases
  return list.map(r => ({
    ...r,
    PatientName:      r.Patname ?? r.PatientName ?? '',
    PaidAmount:       r.Paid    ?? r.PaidAmount   ?? 0,
    DiscountAmount:   r.Discount ?? r.DiscountAmount ?? 0,
    OutstandingAmount: r.Balance ?? r.OutstandingAmount ?? 0,
    PaymentStatus:    r.Balance > 0 ? 'Partial' : r.Paid > 0 ? 'Paid' : 'Unpaid',
  }));
}

/** GET patient bill detail */
export async function getPatientBill(PID: number, BranchId = 1): Promise<PatientBill | null> {
  const data = await post<any>('/api/BillingDesk/GetPatientBill', { PID, BranchId });
  if (!data) return null;
  // API returns { Patient: [...], Receipts: [...] }
  return {
    Patient:  Array.isArray(data.Patient)  ? data.Patient  : [],
    Receipts: Array.isArray(data.Receipts) ? data.Receipts : [],
  };
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

/** GENERATE BILL / RECEIPT */
export async function generateBillDocument(payload: { BranchId: number; DocumentType: string; ReceiptNo: number; }): Promise<any> {
  const data = await post<any>('/api/BillingDesk/GenerateBill', payload);
  return data;
}
