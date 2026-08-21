import { API_BASE_URL } from '../utils/constants';

const BASE = API_BASE_URL;

async function post<T>(endpoint: string, body: object, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message ?? data?.Message ?? `HTTP ${res.status}`);
  return data as T;
}

// ── Payment Interfaces ────────────────────────────────────────────────────────

export interface PaymentOrderRequest {
  PID: number;
  PatRegID: number;
  amount: number; // Will be validated on backend
  currency: string;
  BranchId: number;
}

export interface PaymentOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  razorpayKeyId: string;
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
}

export interface PaymentVerificationRequest {
  PID: number;
  PatRegID: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  amount: number;
  paymentMethod: string;
  BranchId: number;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  transactionId?: string;
  receiptNo?: number;
  paymentStatus: string;
}

export interface PaymentTransaction {
  id: number;
  PID: number;
  PatRegID: number;
  BranchId: number;
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'CREATED' | 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentReceiptData {
  receiptNo: number;
  transactionId: string;
  paymentId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  patientName: string;
  patientId: string;
  status: string;
}

// ── API Functions ─────────────────────────────────────────────────────────────

/**
 * Create Razorpay payment order
 * Backend will:
 * - Verify patient authentication
 * - Retrieve actual bill amount from database
 * - Verify bill ownership
 * - Check if bill is already paid
 * - Create Razorpay order
 */
export async function createPaymentOrder(
  payload: PaymentOrderRequest,
  token?: string
): Promise<PaymentOrderResponse> {
  return post<PaymentOrderResponse>('/api/payments/create-order', payload, token);
}

/**
 * Verify payment after gateway callback
 * Backend will:
 * - Verify Razorpay payment signature
 * - Verify payment amount and currency
 * - Check duplicate payment
 * - Update payment transaction status
 * - Mark bill as paid
 * - Generate receipt
 */
export async function verifyPayment(
  payload: PaymentVerificationRequest,
  token?: string
): Promise<PaymentVerificationResponse> {
  return post<PaymentVerificationResponse>('/api/payments/verify', payload, token);
}

/**
 * Get payment transaction status
 */
export async function getPaymentStatus(
  transactionId: string,
  token?: string
): Promise<PaymentTransaction> {
  return post<PaymentTransaction>(`/api/payments/${transactionId}/status`, {}, token);
}

/**
 * Get payment receipt data
 */
export async function getPaymentReceipt(
  transactionId: string,
  token?: string
): Promise<PaymentReceiptData> {
  return post<PaymentReceiptData>(`/api/payments/${transactionId}/receipt`, {}, token);
}

/**
 * Get patient's pending bills
 */
export async function getPendingBills(
  PID: number,
  BranchId: number,
  token?: string
): Promise<any[]> {
  return post<any[]>('/api/payments/pending-bills', { PID, BranchId }, token);
}
