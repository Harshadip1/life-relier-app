/**
 * Referring Doctor API service
 *
 * Base URL : https://dn8labapi.liferelier.in
 * All endpoints: POST /api/AddReferingDoctor/
 *
 * Save body (exact field names from Bruno):
 *   DoctorCode, DoctorName, DoctorPhoneno, Doctoremail,
 *   address1, city, DrType, contactperson, ratetypeid, PRO, Branchid, Createdon
 */

import { API_BASE_URL } from '../utils/constants';

const BASE = `${API_BASE_URL}/api/AddReferingDoctor`;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReferingDoctorRecord {
  ReferingDoctorId?: number;
  dr_codeid?:        number;
  DoctorCode:        string | number;
  DoctorName:        string;
  DoctorPhoneno?:    string;
  Doctoremail?:      string;
  address1?:         string;
  city?:             string;
  DrType?:           string;
  contactperson?:    string;
  ratetypeid?:       number;
  PRO?:              number;
  Branchid?:         number;
  Createdon?:        string;
  Updatedby?:        string;
  Updatedon?:        string;
  [key: string]:     any;
}

export interface ReferingDoctorProItem {
  ReferingDoctorId: number;
  DoctorName:       string;
}

export interface SaveReferingDoctorPayload {
  DoctorCode:     string;
  DoctorName:     string;
  DoctorPhoneno?: string;
  Doctoremail?:   string;
  address1?:      string;
  city?:          string;
  DrType:         string;
  contactperson?: string;
  ratetypeid:     number;
  PRO:            number;
  Branchid:       number;
  Createdon:      string;
}

export interface UpdateReferingDoctorPayload {
  dr_codeid:      number;
  DoctorCode:     number | string;
  DoctorName:     string;
  DoctorPhoneno?: string;
  Doctoremail?:   string;
  address1?:      string;
  city?:          string;
  DrType:         string;
  contactperson?: string;
  ratetypeid:     number;
  PRO:            number;
  Branchid:       number;
  Updatedby:      string;
  Updatedon:      string;
}

// ─── Generic POST helper ──────────────────────────────────────────────────────

async function post<T = any>(path: string, body: object): Promise<T> {
  const url = `${BASE}/${path}`;
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify(body),
  });

  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg =
      (typeof data === 'object' && data !== null &&
        (data.message || data.Message || data.title)) ||
      (typeof data === 'string' && data) ||
      `Server error (HTTP ${res.status})`;
    throw new Error(String(msg));
  }
  return data as T;
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function getAllReferingDoctors(branchId: number = 1): Promise<ReferingDoctorRecord[]> {
  const data = await post<any>('GetAll', { Branchid: branchId });
  if (Array.isArray(data)) return data;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

export async function getReferingDoctorById(id: number, branchId: number = 1): Promise<ReferingDoctorRecord | null> {
  const data = await post<any>('GetById', { dr_codeid: id, Branchid: branchId });
  if (Array.isArray(data) && data.length > 0) return data[0];
  if (data?.dr_codeid || data?.ReferingDoctorId) return data;
  return null;
}

export async function getReferingDoctorPro(branchId: number = 1): Promise<ReferingDoctorProItem[]> {
  try {
    const data = await post<any>('GetPRO', { branchId });
    if (Array.isArray(data)) return data;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  } catch { return []; }
}

export async function saveReferingDoctor(payload: SaveReferingDoctorPayload): Promise<any> {
  return post('Save', payload);
}

export async function updateReferingDoctor(payload: UpdateReferingDoctorPayload): Promise<any> {
  return post('Update', payload);
}

export async function deleteReferingDoctor(id: number, branchId: number = 1): Promise<any> {
  return post('Delete', { dr_codeid: String(id), Branchid: branchId });
}
