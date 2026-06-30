const API_BASE = 'https://dn8labapi.liferelier.in/api';

export interface SaveAppointmentPayload {
  DrId: number;
  FirstName: string;
  LastName: string;
  Mobile: string;
  AppointmentDate: string; // "YYYY-MM-DD"
  Slot: string;            // e.g. "20 Minutes"
  Address: string;
  GenderId: number;        // 1 = Male, 2 = Female, 3 = Other
  InitialId: number;       // 1 = Mr, 2 = Mrs, 3 = Ms, 4 = Dr
  BirthDate: string;       // "YYYY-MM-DD"
  BranchId: number;
  CreatedBy: string;
}

export interface SaveAppointmentResponse {
  Message: string;
  AppointmentId: number;
}

export async function saveAppointment(
  payload: SaveAppointmentPayload
): Promise<SaveAppointmentResponse> {
  console.log('--- SaveAppointment Request ---');
  console.log('URL:', `${API_BASE}/DrAppointment/SaveAppointment`);
  console.log('Body:', JSON.stringify(payload, null, 2));

  const response = await fetch(`${API_BASE}/DrAppointment/SaveAppointment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let data: any;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  console.log('--- SaveAppointment Response ---');
  console.log('Status:', response.status);
  console.log('Data:', JSON.stringify(data, null, 2));

  if (!response.ok) {
    throw new Error(data?.Message || 'Failed to save appointment');
  }

  if (data?.Message !== 'INSERT SUCCESS') {
    throw new Error(data?.Message || 'Appointment could not be saved');
  }

  return data as SaveAppointmentResponse;
}
