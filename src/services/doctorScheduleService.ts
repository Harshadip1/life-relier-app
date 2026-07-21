/**
 * Doctor Schedule & Slot API service
 *
 * Base URL : https://dn8labapi.liferelier.in
 * VERIFIED endpoints (tested against live server):
 *
 * Schedule controller — /api/DoctorSchedule/
 *   POST SaveDoctorSchedule     — create schedule
 *   POST UpdateDoctorSchedule   — update schedule
 *   POST DeleteDoctorSchedule   — delete schedule
 *   POST GetAllDoctorSchedule   — list all (body: { BranchId })
 *   POST GetDoctorScheduleById  — get one  (body: { scheduleId, BranchId })
 *   POST GetDoctorDropdown      — doctor list (body: { CompanyId })
 *
 * Slot controller — /api/DrSlot/
 *   POST SaveDrSlot    — create slot  (body: { DrId, Slot: "15", BranchId, CreatedBy, IsActive })
 *   POST UpdateDrSlot  — update slot  (body: { SlotId, DrId, Slot, BranchId, UpdatedBy, IsActive })
 *   POST DeleteDrSlot  — delete slot  (body: { SlotId, BranchId })
 *   POST GetAllDrSlot  — list all     (body: { BranchId })
 *
 * Appointment controller — /api/DrAppointment/
 *   POST SaveAppointment
 *   POST UpdateAppointment
 *   POST DeleteAppointment
 *   POST GetAllAppointment
 *   POST GetAppointmentById
 */

import { API_BASE_URL } from '../utils/constants';

const SCHEDULE_BASE = `${API_BASE_URL}/api/DoctorSchedule`;
const SLOT_BASE     = `${API_BASE_URL}/api/DrSlot`;
const APPT_BASE     = `${API_BASE_URL}/api/DrAppointment`;

// ─── Generic POST helper ──────────────────────────────────────────────────────

async function post<T = any>(baseUrl: string, path: string, body: object): Promise<T> {
  const url = `${baseUrl}/${path}`;
  console.log(`[API] POST ${url}`, JSON.stringify(body));
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body:    JSON.stringify(body),
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  console.log(`[API] ${path} =>`, res.status, JSON.stringify(data)?.substring(0, 300));
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

export interface DoctorScheduleRecord {
  ScheduleId:  number;
  scheduleId?: number;
  DrId:        number;
  StartDate:   string;
  EndDate:     string;
  StartTime:   string;
  EndTime:     string | null;
  BranchId:    number;
  CreatedBy:   string;
  CreatedOn:   string;
  UpdatedBy:   string;
  UpdatedOn:   string;
  IsActive:    boolean;
  DoctorName?: string;
}

export interface SaveSchedulePayload {
  DrId:      number;
  StartDate: string;
  EndDate:   string;
  StartTime: string;
  EndTime:   string;
  BranchId:  number;
  CreatedBy: string;
  IsActive:  boolean;
}

export interface DoctorDropdownItem {
  Id:       number;
  FullName: string;
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

export async function getDoctorScheduleById(
  scheduleId: number,
  branchId: number = 1,
): Promise<DoctorScheduleRecord[]> {
  const data = await post<any>(SCHEDULE_BASE, 'GetDoctorScheduleById', { scheduleId, BranchId: branchId });
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  if (data.ScheduleId !== undefined || data.scheduleId !== undefined) return [data];
  return [];
}

export async function getAllDoctorSchedules(branchId: number = 1): Promise<DoctorScheduleRecord[]> {
  const data = await post<any>(SCHEDULE_BASE, 'GetAllDoctorSchedule', { BranchId: branchId });
  let list: any[] = [];
  if (Array.isArray(data))                          list = data;
  else if (data?.data && Array.isArray(data.data))  list = data.data;
  else if (data?.Data && Array.isArray(data.Data))  list = data.Data;
  if (list.length === 0) return [];
  try {
    const doctors = await getDoctorDropdown(1);
    const map = new Map<number, string>(doctors.map(d => [d.Id, d.FullName]));
    return list.map(s => ({
      ...s,
      DoctorName: map.get(s.DrId ?? s.drId) || s.DoctorName || `Dr. #${s.DrId ?? s.drId}`,
    }));
  } catch { return list; }
}

export async function saveSchedule(payload: SaveSchedulePayload): Promise<any> {
  return post(SCHEDULE_BASE, 'SaveDoctorSchedule', payload);
}

export async function updateSchedule(payload: any): Promise<any> {
  return post(SCHEDULE_BASE, 'UpdateDoctorSchedule', payload);
}

export async function deleteSchedule(scheduleId: number, branchId: number = 1): Promise<any> {
  return post(SCHEDULE_BASE, 'DeleteDoctorSchedule', { scheduleId, BranchId: branchId });
}

// ─── Doctor dropdown ──────────────────────────────────────────────────────────

export async function getDoctorDropdown(companyId: number = 1): Promise<DoctorDropdownItem[]> {
  const data = await post<any>(SCHEDULE_BASE, 'GetDoctorDropdown', { CompanyId: companyId });
  if (Array.isArray(data)) return data;
  if (data) return [data as DoctorDropdownItem];
  return [];
}

// ─── Slots  (/api/DrSlot/) ────────────────────────────────────────────────────

export interface DrSlotRecord {
  SlotId:      number;
  DrId:        number;
  Slot:        string;   // "15", "20", "30" — string, not number
  BranchId:    number;
  IsActive:    boolean;
  CreatedBy?:  string;
  CreatedOn?:  string;
  DoctorName?: string;
}

export async function getAllSlots(branchId: number = 1): Promise<DrSlotRecord[]> {
  const data = await post<any>(SLOT_BASE, 'GetAllDrSlot', { BranchId: branchId });
  const list: DrSlotRecord[] = Array.isArray(data)
    ? data
    : (data?.data && Array.isArray(data.data)) ? data.data : [];
  try {
    const doctors = await getDoctorDropdown(1);
    const map = new Map<number, string>(doctors.map(d => [d.Id, d.FullName]));
    return list.map(s => ({ ...s, DoctorName: map.get(s.DrId) || s.DoctorName }));
  } catch { return list; }
}

export async function saveSlot(payload: {
  DrId: number; Slot: string; BranchId: number; CreatedBy: string; IsActive: boolean;
}): Promise<any> {
  return post(SLOT_BASE, 'SaveDrSlot', payload);
}

export async function updateSlot(payload: {
  SlotId: number; DrId: number; Slot: string; BranchId: number; UpdatedBy: string; IsActive: boolean;
}): Promise<any> {
  return post(SLOT_BASE, 'UpdateDrSlot', payload);
}

export async function deleteSlot(slotId: number, branchId: number = 1): Promise<any> {
  return post(SLOT_BASE, 'DeleteDrSlot', { SlotId: slotId, BranchId: branchId });
}

// ─── Appointments  (/api/DrAppointment/) ─────────────────────────────────────

export interface SaveAppointmentPayload {
  DrId:              number;
  Name:              string;
  FirstName:         string;
  LastName:          string;
  Mobile:            string;
  AppointmentDate:   string;
  Slot:              string;
  Address:           string;
  GenderId:          number;
  InitialId:         number;
  BirthDate:         string;
  BranchId:          number;
  CreatedBy:         string;
  Email?:            string;
  Remark?:           string;
  ReferingDoctorId?: number | null;
}

export interface UpdateAppointmentPayload extends Omit<SaveAppointmentPayload, 'CreatedBy'> {
  AppointmentId: number;
  UpdatedBy:     string;
}

export interface AppointmentRecord {
  AppointmentId:      number;
  DrId:               number;
  Name:               string | null;
  FirstName:          string | null;
  LastName:           string | null;
  Email:              string | null;
  Mobile:             string;
  AppointmentDate:    string;
  Slot:               string;
  Address:            string;
  GenderId:           number;
  InitialId:          number;
  BranchId:           number;
  AgeType:            string;
  Age:                number;
  BirthDate:          string;
  ReferingDoctorId:   number | null;
  Remark:             string | null;
  CreatedBy:          string;
  CreatedOn:          string;
  UpdatedBy:          string | null;
  UpdatedOn:          string;
  CancelledBy:        string | null;
  CancelledDate:      string | null;
  IsActive:           boolean;
  Status:             string;
  DoctorName:         string;
  ReferingDoctorName: string | null;
}

export async function saveAppointment(payload: SaveAppointmentPayload): Promise<any> {
  return post(APPT_BASE, 'SaveAppointment', payload);
}

export async function updateAppointment(payload: UpdateAppointmentPayload): Promise<any> {
  return post(APPT_BASE, 'UpdateAppointment', payload);
}

export async function getAllAppointments(branchId: number = 1): Promise<AppointmentRecord[]> {
  const data = await postAppt<any>('GetAllAppointment', { BranchId: branchId });
  let list: any[] = [];
  if (Array.isArray(data)) list = data;
  else if (data?.data && Array.isArray(data.data)) list = data.data;
  else if (data?.message || data?.Message) return [];
  return list.map(a => ({
    ...a,
    Name: a.Name || [a.FirstName, a.LastName].filter(Boolean).join(' ').trim() || null,
    AppointmentDate: (() => {
      const m = String(a.AppointmentDate ?? '').match(/^(\d{4}-\d{2}-\d{2})/);
      return m ? m[1] : a.AppointmentDate;
    })(),
  }));
}

export async function getAppointmentById(appointmentId: number, branchId: number = 1): Promise<AppointmentRecord[]> {
  const data = await post<any>(APPT_BASE, 'GetAppointmentById', { AppointmentId: appointmentId, BranchId: branchId });
  if (Array.isArray(data)) return data;
  if (data?.AppointmentId) return [data];
  return [];
}

export async function deleteAppointment(appointmentId: number, branchId: number = 1): Promise<any> {
  return post(APPT_BASE, 'DeleteAppointment', { AppointmentId: appointmentId, BranchId: branchId });
}
