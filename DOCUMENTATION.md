# Life Relier LIMS — App Documentation

> **Platform:** React Native (Expo SDK 55)  
> **Backend:** `https://dn8labapi.liferelier.in`  
> **Version:** 1.0.0  
> **Last Updated:** July 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [User Roles](#2-user-roles)
3. [Authentication](#3-authentication)
4. [Navigation Structure](#4-navigation-structure)
5. [Admin Module](#5-admin-module)
6. [Patient Module](#6-patient-module)
7. [Doctor (Ref Doctor) Module](#7-doctor-ref-doctor-module)
8. [Phlebotomist (Flibo) Module](#8-phlebotomist-flibo-module)
9. [API Reference Summary](#9-api-reference-summary)
10. [Services & Architecture](#10-services--architecture)
11. [Test Credentials](#11-test-credentials)

---

## 1. Overview

Life Relier LIMS (Laboratory Information Management System) is a mobile app for managing lab operations including patient registration, sample collection, test management, appointments, and reporting.

The app serves 4 types of users with role-based access, each seeing only their relevant screens.

---

## 2. User Roles

| Role | Username | Password | Description |
|---|---|---|---|
| `admin` | `admin` | `123` | Full access — all admin screens |
| `patient` | `rudra` | `123` | Patient portal — reports, bookings, payments |
| `refdoctor` | `doctor` | `123` | Doctor — today's appointments, consultation workflow |
| `phlebotomist` | `flibo` | `123` | Phlebotomist — sample collection queue |

**Role classification:** The login API returns a `role` / `UserRole` field. The app maps it:

| API value | App role |
|---|---|
| `patient` | patient |
| `admin` | admin |
| `refdoctor`, `ref doctor`, `referring` | refdoctor |
| `phlebotomist`, `flibo`, `phlebo` | phlebotomist |
| anything else | admin |

If the API returns 401, the app falls back to the local mock database above.

---

## 3. Authentication

**Endpoint:** `POST /api/ManageUser/Login`  
**Body:** `{ UserName, Password }`

On success the app stores `token`, `user`, and `role` in `AsyncStorage` and restores the session on next launch.

On API failure (401 / network error) → falls back to mock users in `src/services/mockDatabase.ts`.

---

## 4. Navigation Structure

```
RootNavigator
├── AuthNavigator       — Login screen
├── AdminNavigator      — Bottom tabs: Dashboard | Front Desk | Laboratory | Reports | More
├── PatientNavigator    — Bottom tabs: Home | Reports | Profile
├── RefDoctorNavigator  — Bottom tabs: Today | Patients | Bills | Reports | Offers
└── PhlebotomistNavigator — Single screen: Sample Collection
```

### Admin Sub-Navigation (More tab → Master)

```
MasterStack
├── Doctor Management → DoctorManagementScreen
│   ├── DrAppointment → AddDoctorScheduleScreen
│   ├── DrSlot        → AddDoctorSlotScreen
│   ├── AppointmentRecords → SearchAvailableSlotsScreen
│   └── ShowAppointment
├── Test Management → TestChargesScreen, TestChargeDetailScreen, PackagesScreen
├── Laboratory → CollectionCenterScreen
├── Staff (placeholder)
└── ReferralDoctor → ReferralDoctorScreen
```

---

## 5. Admin Module

### Dashboard
- Stats: Patients Registered, Pending Collections, Pending Reports, Today's Revenue
- Quick Actions: New Registration, Sample Collection, Result Entry, Bill Payment, Pending Reports

### Front Desk
| Screen | Purpose |
|---|---|
| NewRegistrationScreen | Register new patient (3-step wizard: Patient Info → Tests → Payment) |
| PatientsScreen (Patient Status) | View/filter all patients by date range, status, center |
| EditPatientScreen | Edit existing patient details |

### Laboratory
| Screen | Purpose |
|---|---|
| SamplesScreen (Accession) | Today's sample queue — pending/received |
| ReportsScreen (Result Entry) | Enter test results per patient |
| PendingReportsScreen | Report approval workflow |
| CompletedReportsScreen | All completed reports with date/status filters |

### Master — Doctor Management
| Screen | Purpose |
|---|---|
| DoctorManagementScreen | Doctors, Schedules, Slots tabs |
| DoctorAppointmentScreen | Doctor schedule list |
| AddDoctorScheduleScreen | Add/edit doctor schedule |
| AddDoctorSlotScreen | Add consultation slot duration |
| AppointmentRecordsScreen | Appointment desk — filter by date/doctor |
| SearchAvailableSlotsScreen | Book new appointment with slot grid |
| AppointmentListScreen | View/delete all appointments with date filter |

### Master — Test & Other
| Screen | Purpose |
|---|---|
| TestChargesScreen | CRUD for test charges with rate type + sub dept filters |
| TestChargeDetailScreen | Filtered test charge view |
| PackagesScreen | Lab packages list |
| CollectionCenterScreen | Collection centers from API |
| ReferralDoctorScreen | CRUD for referring doctors |

---

## 6. Patient Module

| Screen | Purpose |
|---|---|
| HomeScreen | Health summary banner, quick actions, recent reports, booking status tracker |
| ReportsScreen | Lab reports list with status, download/share actions |
| PaymentsScreen | Payment history from API |
| BookingTests | Book tests — popular tests, health packages, center selection |
| ScheduleCollectionScreen | Pick date/time for sample collection |
| BookAppointmentScreen | Book doctor appointment (3-step: doctor → slot → confirm) |
| PatientProfileScreen | View profile, menu navigation |
| PersonalInfoScreen | Edit personal information |

### Booking Status Tracker
Shows a 4-step progress bar driven by the patient's real `Status` from the API:
`Registered → Sample Collected → Processing → Report Ready`

---

## 7. Doctor (Ref Doctor) Module

Login as `doctor` / `123`

### Tab: Today (DoctorAppointmentsScreen)
- Shows **today's appointments only**
- Stats: Pending / Completed / Total
- Tap an appointment → opens ConsultationDetailScreen

### ConsultationDetailScreen — 6 tabs:

| Tab | What the doctor can do |
|---|---|
| **Profile** | View patient profile, demographics, visit history |
| **Lab Tests** | View all booked lab tests for this patient |
| **Reports** | View test reports when status = Report Ready / Printed |
| **Diagnosis** | Add diagnosis text + clinical notes |
| **Prescription** | Write prescription — add medicines with dose and duration |
| **Recommend** | Recommend additional tests (request only, not book) |

**Mark Complete** button at the bottom — requires diagnosis to be filled before completing.

### Tab: Patients
- All patients assigned to this doctor (filtered by DoctorName)
- Patient cards with status, tests, billing info
- Tap → detail sheet with full info

### Tab: Bills
- All billing records for doctor's patients
- Summary: Total Charges / Total Paid / Outstanding

### Tab: Reports
- Filtered by status: All / Report Ready / Processing / Registered
- View/Download/Share actions on ready reports

### Tab: Offers
- Lab offers and referral incentives (static display)

---

## 8. Phlebotomist (Flibo) Module

Login as `flibo` / `123`

- Shows **today's sample collection queue**
- Stats: Pending / Collected / Urgent
- Tabs: Pending | Collected | All
- Tap a card → detail sheet with barcode, doctor, tests, Mark Collected action
- Urgent samples highlighted with red badge

---

## 9. API Reference Summary

> Full details in `API_REFERENCE.md`

| Controller | Key Endpoints |
|---|---|
| `ManageUser` | Login |
| `NewRegistration` | RegisterPatient, UpdatePatientFiles |
| `TestStatus` | GetPatientTestStatus, GetSubDepartment, GetCenter, GetTestName, GetRateType |
| `EditPatient` | GetGrid, GetPatient, UpdatePatient |
| `TestCharges` | GetAllTestCharges, SaveTestCharges, UpdateTestCharges, DeleteTestCharges, GetPackages |
| `DoctorSchedule` | GetAllDoctorSchedule, SaveDoctorSchedule, GetDoctorDropdown, GetAllDrSlot, SaveDrSlot |
| `DrAppointment` | GetAllAppointment, SaveAppointment, UpdateAppointment, DeleteAppointment |
| `AddReferingDoctor` | GetAll, GetById, GetPRO, Save, Update, Delete |
| `Search` | GetInitials, SearchTests |

All requests: `POST` with `Content-Type: application/json`  
Base URL: `https://dn8labapi.liferelier.in`

---

## 10. Services & Architecture

### Service Files (`src/services/`)

| File | Purpose |
|---|---|
| `authService.ts` | Login, logout, role mapping |
| `mockDatabase.ts` | Local fallback users for dev/demo |
| `registrationService.ts` | Patient registration, search, initials |
| `editPatientService.ts` | Patient grid, get patient, update patient |
| `doctorScheduleService.ts` | Schedules, slots, appointments |
| `testChargesService.ts` | Test charges, centers, test names, rate types, sub depts |
| `referringDoctorService.ts` | Referring doctor CRUD |
| `apiService.ts` | Axios instance with interceptors |

### Context
- `AuthContext` — user, role, token, login/logout, persisted via AsyncStorage

### Key Constants (`src/utils/constants.ts`)
- `API_BASE_URL = 'https://dn8labapi.liferelier.in'`
- `COLORS.primary = '#0D9488'` (teal)
- `STORAGE_KEYS` — AsyncStorage keys for auth

---

## 11. Test Credentials

| Role | Username | Password | Gets |
|---|---|---|---|
| Admin | `admin` | `123` | Full admin app |
| Patient | `rudra` | `123` | Patient portal |
| Doctor | `doctor` | `123` | Doctor consultation app |
| Phlebotomist | `flibo` | `123` | Sample collection queue |

When the real API starts returning proper role values in login response, credentials from the backend take priority automatically.

---

## Build

```bash
# Development (Expo Go)
cd life-relier-app
npx expo start --tunnelg

# APK build (EAS)
eas build --platform android --profile preview --non-interactive
```

**EAS Project:** `https://expo.dev/accounts/nikhil123456789/projects/lims-app`
