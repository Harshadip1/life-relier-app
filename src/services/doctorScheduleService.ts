/**
 * Doctor Schedule API service
 *
 * Base URL : https://dn8labapi.liferelier.in
 * All requests are POST with JSON body (confirmed from Bruno collection).
 *
 * Endpoints (from Bruno sidebar):
 *   POST /api/DoctorSchedule/SaveSchedule          — create schedule
 *   POST /api/DoctorSchedule/UpdateSchedule         — update schedule
 *   POST /api/DoctorSchedule/DeleteSchedule         — delete schedule
 *   POST /api/DoctorSchedule/GetDoctorScheduleById  — get one by scheduleId + BranchId
 *   POST /api/DoctorSchedule/GetDoctorDropdown      — doctor dropdown list
 *   POST /api/DoctorSchedule/Login                  — auth (separate concern)
 *
 *   POST /api/DoctorSchedule/SaveSlot               — create slot
 *   POST /api/DoctorSchedule/UpdateSlot             — update slot
 *   POST /api/DoctorSchedule/DeleteSlot             — delete slot
 *   POST /api/DoctorSchedule/GetAllSlots            — list all slots
 *
 *   POST /api/DoctorSchedule/SaveAppointment        — book appointment
 *   POST /api/DoctorSchedule/UpdateAppointment      — update appointment
 *   POST /api/DoctorSchedule/DeleteAppointment      — delete appointment
 *   POST /api/DoctorSchedule/GetAllAppointment      — list all appointments
 */

import { API_BASE_URL } from '../utils/constants';

const BASE = `${API_BASE_URL}/api/DoctorSchedule`;

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape returned by GetDoctorScheduleById (Pascal case — matches Bruno response exactly) */
export interface DoctorScheduleRecord {
  ScheduleId:  number;
  DrId:        number;
  StartDate:   string;        // ISO "2026-06-01T00:00:00"
  EndDate:     string;        // ISO "2026-07-02T00:00:00"
  StartTime:   string;        // "10:00:00"
  EndTime:     string | null;
  BranchId:    number;
  CreatedBy:   string;
  CreatedOn:   string;
  UpdatedBy:   string;
  UpdatedOn:   string;
  DeletedBy:   string | null;
  DeletedOn:   string | null;
  IsActive:    boolean;
  // enriched by a join on the list endpoint (if available)
  DoctorName?: string;
}

/** Payload to create or update a schedule (exact fields from Bruno) */
export interface SaveSchedulePayload {
  ScheduleId?: number;   // omit for create, include for update
  DrId:        number;
  StartDate:   string;   // "YYYY-MM-DD"
  EndDate:     string;   // "YYYY-MM-DD"
  StartTime:   string;   // "10:00 AM"
  EndTime:     string;   // "05:00 PM"
  BranchId:    number;
  CreatedBy:   string;
  IsActive:    boolean;
}

/** Doctor dropdown item — shape from GET Doctor Dropdown API */
export interface DoctorDropdownItem {
  Id:       number;
  FullName: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

async function post<T = any>(path: string, body: object): Promise<T> {
  const url = `${BASE}/${path}`;
  console.log(`[API] POST ${url}`, JSON.stringify(body));

  const res = await fetch(url, {
    method:  'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept:         'application/json',
    },
    body: JSON.stringify(body),
  });

  // Parse body safely
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    const msg =
      (typeof data === 'object' && data !== null && (data.message || data.title || data.Message)) ||
      (typeof data === 'string' && data) ||
      `Server error (HTTP ${res.status})`;
    throw new Error(String(msg));
  }

  return data as T;
}

// ─── Schedule ─────────────────────────────────────────────────────────────────

/**
 * POST /GetDoctorScheduleById
 * Body: { scheduleId: number, BranchId: number }
 * Returns an array (even for a single record, API wraps in []).
 */
export async function getDoctorScheduleById(
  scheduleId: number,
  branchId: number = 4,
): Promise<DoctorScheduleRecord[]> {
  const data = await post<any>(
    'GetDoctorScheduleById',
    { scheduleId, BranchId: branchId },
  );
  console.log('[API] GetDoctorScheduleById raw response:', JSON.stringify(data));
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  for (const key of ['data', 'Data', 'result', 'Result', 'records', 'Records']) {
    if (data[key] && Array.isArray(data[key])) return data[key].filter(Boolean);
  }
  if (typeof data === 'object' && (data.ScheduleId !== undefined || data.scheduleId !== undefined)) {
    return [data];
  }
  return [];
}

/**
 * Fetch ALL schedules for a branch.
 * Tries multiple endpoint/body patterns in order until one returns data.
 */
export async function getAllDoctorSchedules(
  branchId: number = 4,
): Promise<DoctorScheduleRecord[]> {

  // ── Try candidate endpoints one by one ──────────────────────────────────
  const candidates: Array<{ path: string; body: object }> = [
    // Most likely: list all by BranchId only
    { path: 'GetAllDoctorSchedule',       body: { BranchId: branchId } },
    { path: 'GetDoctorScheduleByBranch',  body: { BranchId: branchId } },
    { path: 'GetDoctorScheduleList',      body: { BranchId: branchId } },
    { path: 'GetAllDoctorSchedules',      body: { BranchId: branchId } },
    // CompanyId variant
    { path: 'GetAllDoctorSchedule',       body: { CompanyId: 1 } },
    // Fallback: GetById with 0
    { path: 'GetDoctorScheduleById',      body: { scheduleId: 0, BranchId: branchId } },
  ];

  let schedules: DoctorScheduleRecord[] = [];

  for (const { path, body } of candidates) {
    try {
      const url = `${BASE}/${path}`;
      console.log(`[API] Trying POST ${url}`, JSON.stringify(body));
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      });
      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { data = null; }
      console.log(`[API] ${path} response:`, JSON.stringify(data));

      if (!res.ok) continue;          // HTTP error → try next
      if (!data) continue;            // null / empty → try next

      // { message: "No data found" } or { message: "..." } → treat as empty, stop trying
      if (typeof data === 'object' && !Array.isArray(data) && data.message) {
        if (
          data.message.toLowerCase().includes('no data') ||
          data.message.toLowerCase().includes('not found')
        ) {
          // No records exist yet — this is the right endpoint, just empty
          schedules = [];
          break;
        }
      }

      // Unwrap array from wrapper object if needed
      let list: any[] = [];
      if (Array.isArray(data))                                         list = data;
      else if (data.data  && Array.isArray(data.data))                 list = data.data;
      else if (data.Data  && Array.isArray(data.Data))                 list = data.Data;
      else if (data.result && Array.isArray(data.result))              list = data.result;
      else if (typeof data === 'object' &&
               (data.ScheduleId !== undefined || data.scheduleId !== undefined)) {
        list = [data]; // single record
      }

      if (list.length > 0) {
        schedules = list.filter(Boolean) as DoctorScheduleRecord[];
        break; // found data — stop trying
      }
    } catch (e) {
      console.log(`[API] ${path} threw:`, e);
      // network error — stop
      break;
    }
  }

  // Enrich with doctor names from dropdown
  if (schedules.length > 0) {
    try {
      const doctors = await getDoctorDropdown(1);
      const map = new Map<number, string>(doctors.map(d => [d.Id, d.FullName]));
      schedules = schedules.map(s => ({
        ...s,
        DoctorName: map.get(s.DrId) || map.get((s as any).drId) || s.DoctorName,
      }));
    } catch { /* enrichment failed, show without names */ }
  }

  console.log(`[API] getAllDoctorSchedules resolved ${schedules.length} record(s)`);
  return schedules;
}

export async function saveSchedule(payload: SaveSchedulePayload): Promise<any> {
  return post('SaveDoctorSchedule', payload);
}

export async function updateSchedule(payload: any): Promise<any> {
  return post('UpdateDoctorSchedule', payload);
}

export async function deleteSchedule(
  scheduleId: number,
  branchId: number = 4,
): Promise<any> {
  return post('DeleteDoctorSchedule', { scheduleId, BranchId: branchId });
}

// ─── Doctor dropdown ──────────────────────────────────────────────────────────

/**
 * POST /GetDoctorDropdown
 * Body   : { "CompanyId": 1 }
 * Returns: [{ "Id": 12, "FullName": "Atharv Bendkhale" }, ...]
 */
export async function getDoctorDropdown(
  companyId: number = 1,
): Promise<DoctorDropdownItem[]> {
  const data = await post<DoctorDropdownItem | DoctorDropdownItem[]>(
    'GetDoctorDropdown',
    { CompanyId: companyId },
  );
  console.log('[API] GetDoctorDropdown raw response:', JSON.stringify(data));
  if (Array.isArray(data)) return data;
  if (data) return [data as DoctorDropdownItem];
  return [];
}

// ─── Slots ────────────────────────────────────────────────────────────────────

export interface DrSlotRecord {
  SlotId:      number;
  DrId:        number;
  SlotMins:    number;
  BranchId:    number;
  IsActive:    boolean;
  CreatedBy?:  string;
  CreatedOn?:  string;
  DoctorName?: string;
}

// Helper for DrSlot endpoints — same controller, different action names

export async function getAllSlots(branchId: number = 1): Promise<DrSlotRecord[]> {
  const data = await post<any>('GetAllDrSlot', { BranchId: branchId });
  console.log('[API] GetAllDrSlot raw response:', JSON.stringify(data));

  const list: DrSlotRecord[] = Array.isArray(data)
    ? data
    : data?.data && Array.isArray(data.data) ? data.data : [];

  console.log(`[API] getAllSlots parsed ${list.length} slots:`, JSON.stringify(list));

  // Enrich with doctor names
  try {
    const doctors = await getDoctorDropdown(1);
    const map = new Map<number, string>(doctors.map(d => [d.Id, d.FullName]));
    return list.map(s => {
      // Handle both Pascal and camel case from API
      const drId = s.DrId ?? (s as any).drId ?? (s as any).DRId;
      return { ...s, DrId: drId, DoctorName: map.get(drId) || s.DoctorName };
    });
  } catch {
    return list;
  }
}

export async function saveSlot(payload: object): Promise<any> {
  return post('SaveDrSlot', payload);
}

export async function updateSlot(payload: object): Promise<any> {
  return post('UpdateDrSlot', payload);
}

export async function deleteSlot(slotId: number, branchId: number = 4): Promise<any> {
  return post('DeleteDrSlot', { SlotId: slotId, BranchId: branchId });
}

// ─── Appointments  (controller: /api/DrAppointment/) ─────────────────────────
//
// POST /api/DrAppointment/SaveAppointment
// Body: { DrId, FirstName, LastName, Mobile, AppointmentDate, Slot,
//         Address, GenderId, InitialId, BirthDate, BranchId, CreatedBy }
// Response: { Message: "INSERT SUCCESS", AppointmentId: 27 }
//
// POST /api/DrAppointment/UpdateAppointment
// Body: same + AppointmentId, replace CreatedBy with UpdatedBy
// Response: { Message: "UPDATE SUCCESS" }

const APPT_BASE = `${API_BASE_URL}/api/DrAppointment`;

async function postAppt<T = any>(path: string, body: object): Promise<T> {
  const url = `${APPT_BASE}/${path}`;
  console.log(`[API] POST ${url}`, JSON.stringify(body));
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  console.log(`[API] ${path} response:`, JSON.stringify(data));
  if (!res.ok) {
    const msg =
      (typeof data === 'object' && data !== null && (data.message || data.Message || data.title)) ||
      (typeof data === 'string' && data) ||
      `Server error (HTTP ${res.status})`;
    throw new Error(String(msg));
  }
  return data as T;
}

export interface SaveAppointmentPayload {
  DrId:              number;
  Name:              string;   // Combined full name — what GetAllAppointment returns
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

export async function saveAppointment(payload: SaveAppointmentPayload): Promise<any> {
  return postAppt('SaveAppointment', payload);
}

export async function updateAppointment(payload: UpdateAppointmentPayload): Promise<any> {
  return postAppt('UpdateAppointment', payload);
}

export interface AppointmentRecord {
  AppointmentId:      number;
  DrId:               number;
  Name:               string | null;
  FirstName:          string | null;
  LastName:           string | null;
  Email:              string | null;
  Mobile:             string;
  AppointmentDate:    string;   // ISO "2026-06-15T00:00:00"
  Slot:               string;   // "15 Minutes"
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
  Status:             string;   // "Pending"
  DoctorName:         string;
  ReferingDoctorName: string | null;
}

export async function getAllAppointments(branchId: number = 1): Promise<AppointmentRecord[]> {
  const data = await post<any>(APPT_BASE, 'GetAllAppointment', { BranchId: branchId });
  let list: any[] = [];
  if (Array.isArray(data)) list = data;
  else if (data?.data && Array.isArray(data.data)) list = data.data;
  else if (data?.message || data?.Message) return [];   // "No data found"

  return list.map(a => ({
    ...a,
    // Name is stored directly now; keep FirstName+LastName fallback for old records
    Name: a.Name
      || [a.FirstName, a.LastName].filter(Boolean).join(' ').trim()
      || null,
    // Strip time portion from AppointmentDate to avoid timezone issues
    AppointmentDate: (() => {
      const m = String(a.AppointmentDate ?? '').match(/^(\d{4}-\d{2}-\d{2})/);
      return m ? m[1] : a.AppointmentDate;
    })(),
  }));
}

export async function getAppointmentById(
  appointmentId: number,
  branchId: number = 1,
): Promise<AppointmentRecord[]> {
  const data = await postAppt<any>('GetAppointmentById', { AppointmentId: appointmentId, BranchId: branchId });
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && data.AppointmentId) return [data];
  return [];
}

export async function deleteAppointment(
  appointmentId: number,
  branchId: number = 1,
): Promise<any> {
  return postAppt('DeleteAppointment', { AppointmentId: appointmentId, BranchId: branchId });
}
