# Life Relier App — API Reference

> **Base URL:** `https://dn8labapi.liferelier.in`  
> **All requests:** `POST` with `Content-Type: application/json` (unless noted as PATCH)  
> **Last Updated:** August 2026  
> This file is for backend/developer reference only — not used in the app.

---

## 1. Authentication

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/ManageUser/Login` | POST | `{ UserName, Password }` | `{ token, role, userId, fullName, ... }` | LoginScreen |

---

## 2. Patient Registration

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/NewRegistration/RegisterPatient` | POST | `{ Patname, Age, Pataddress }` | `{ PID, PatRegID, PrefixRegNumber, ReceiptNo, BillNo, Message }` | NewRegistrationScreen |
| `/api/NewRegistration/UpdatePatientFiles` | POST | `{ PID, Patname, Age, Pataddress, BranchID }` | `{ PatRegID, BranchId, Message }` | NewRegistrationScreen, EditPatientScreen |

---

## 3. Edit Patient

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/EditPatient/GetGrid` | POST | `{ BranchId, FromDate, ToDate, PageNo, PageSize, CenterName, PatientName, MobileNo, PatRegID }` | `{ GridData: [...], TotalCount: [{ TotalRecords }] }` | PatientsScreen |
| `/api/EditPatient/GetPatient` | POST | `{ PID }` | `{ PatientInfo, PaymentInfo, Table1 }` | EditPatientScreen |
| `/api/EditPatient/UpdatePatient` | PATCH | `{ PID, Patname, Age, sex, MobileNo, BranchId, ... }` | `{ Message }` | EditPatientScreen |
| `/api/EditPatient/UpdateFiles` | PATCH | `{ PID, BranchId, uploadPrescription, ImagePath }` | `{ Message }` | EditPatientScreen |

---

## 4. Patient Test Status

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/TestStatus/GetPatientTestStatus` | POST | `{ BranchId, FromDate, ToDate, PatRegID, PatientName, DoctorName, TestName, MobileNo, Barcode, CenterCode, SubDepartment, Status }` | `{ value: [{ PID, PatRegID, PatientName, sex, Age, Drname, CenterName, MainTestName, BarcodeID, Status, TestCharges, PaidAmount, DiscountAmount, OutstandingAmount, Patregdate, Isemergency, Patphoneno, ... }], Count }` | PatientsScreen, CompletedReports, PaymentsScreen, HomeScreen, RefPatientsScreen, SamplesScreen, ReportsScreen, ConsultationDetailScreen |
| `/api/TestStatus/GetSubDepartment` | POST | `{ BranchId }` | `[{ ID, SubDepartmentName }]` | PatientsScreen |
| `/api/TestStatus/GetCenter` | POST | `{ BranchId }` | `[{ CenterCode, CenterName }]` | PatientsScreen, BookingTests |
| `/api/TestStatus/GetTestName` | POST | `{ BranchId }` | `{ value: [{ MainTestName }], Count }` | TestChargesScreen, NewRegistrationScreen, ConsultationDetailScreen |
| `/api/TestStatus/GetRateType` | POST | `{ BranchId }` | `[{ RateTypeId, RateTypeName }]` | TestChargesScreen |

---

## 5. Test Charges

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/TestCharges/GetAllTestCharges` | POST | `{ RateTypeId, SubDeptId }` | `[TestCharge]` | TestChargesScreen, TestChargeDetailScreen |
| `/api/TestCharges/GetTestChargesById` | POST | `{ Action: "GETBYID", TestChargeId }` | `TestCharge` | TestChargeDetailScreen |
| `/api/TestCharges/SaveTestCharges` | POST | `{ TestType, SubDeptId, MainTestId, PackageId, PackageName, RateTypeName, RateTypeId, MTCode, TestName, Amount, Percentage, Emergency, CreatedBy }` | `{ Message }` | TestChargesScreen |
| `/api/TestCharges/UpdateTestCharges` | POST | `{ TestChargeId, UpdatedBy, ...SavePayload }` | `{ Message }` | TestChargesScreen |
| `/api/TestCharges/DeleteTestCharges` | POST | `{ Action: "DELETE", TestChargeId }` | `{ Message }` | TestChargesScreen |
| `/api/TestCharges/GetPackages` | POST | `{ BranchId }` | `[{ PackageId, PackageName }]` | TestChargesScreen, PackagesScreen |

---

## 6. Sub Department & Rate Type (Fallback)

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/TestMaster_SubDept/GetAllSubDept` | POST | `{}` | `[{ SubDeptId, SubDeptName }]` | testChargesService (fallback) |
| `/api/RateTypeMaster/GetAllRateType` | POST | `{}` | `[{ RateTypeId, RateTypeName }]` | testChargesService (fallback) |
| `/api/MainTest/GetAll` | POST | `{}` | `[{ MainTestId, MainTestName }]` | TestChargeDetailScreen |

---

## 7. Doctor Schedule

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/DoctorSchedule/GetAllDoctorSchedule` | POST | `{ BranchId }` | `[{ scheduleId, DrId, StartDate, EndDate, StartTime, EndTime, BranchId, IsActive }]` | DrAppointmentScreen, DoctorManagementScreen |
| `/api/DoctorSchedule/GetDoctorScheduleById` | POST | `{ scheduleId, BranchId }` | `[DoctorSchedule]` | doctorScheduleService |
| `/api/DoctorSchedule/SaveDoctorSchedule` | POST | `{ DrId, StartDate, EndDate, StartTime, EndTime, BranchId, CreatedBy, IsActive }` | `{ Message }` | AddDoctorScheduleScreen |
| `/api/DoctorSchedule/UpdateDoctorSchedule` | POST | `{ scheduleId, DrId, ..., UpdatedBy, IsActive }` | `{ Message }` | AddDoctorScheduleScreen |
| `/api/DoctorSchedule/DeleteDoctorSchedule` | POST | `{ scheduleId, BranchId }` | `{ Message }` | DoctorManagementScreen |
| `/api/DoctorSchedule/GetDoctorDropdown` | POST | `{ CompanyId }` | `[{ Id, FullName }]` | AddDoctorScheduleScreen, AppointmentRecordsScreen, SearchAvailableSlotsScreen, BookAppointmentScreen |

---

## 8. Doctor Slots

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/DoctorSchedule/GetAllDrSlot` | POST | `{ BranchId }` | `[{ SlotId, DrId, Slot, BranchId, IsActive }]` | DoctorManagementScreen, SearchAvailableSlotsScreen, BookAppointmentScreen |
| `/api/DoctorSchedule/SaveDrSlot` | POST | `{ DrId, Slot, BranchId, CreatedBy, IsActive }` | `{ Message }` | AddDoctorSlotScreen |
| `/api/DoctorSchedule/UpdateDrSlot` | POST | `{ SlotId, DrId, Slot, BranchId, UpdatedBy, IsActive }` | `{ Message }` | AddDoctorSlotScreen |
| `/api/DoctorSchedule/DeleteDrSlot` | POST | `{ SlotId, BranchId }` | `{ Message }` | DoctorManagementScreen |

---

## 9. Appointments

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/DrAppointment/GetAllAppointment` | POST | `{ BranchId }` | `{ value: [{ AppointmentId, DrId, Name, Mobile, AppointmentDate, Slot, Status, DoctorName, Age, GenderId, ... }], Count }` | AppointmentRecordsScreen, ShowAppointmentScreen, DoctorAppointmentsScreen |
| `/api/DrAppointment/GetAppointmentById` | POST | `{ AppointmentId, BranchId }` | `[AppointmentRecord]` | doctorScheduleService |
| `/api/DrAppointment/SaveAppointment` | POST | `{ DrId, Name, FirstName, LastName, Mobile, AppointmentDate, Slot, Address, GenderId, InitialId, BirthDate, BranchId, CreatedBy, Email?, Remark?, ReferingDoctorId? }` | `{ Message, AppointmentId }` | SearchAvailableSlotsScreen, BookAppointmentScreen |
| `/api/DrAppointment/UpdateAppointment` | POST | `{ AppointmentId, UpdatedBy, ...SavePayload }` | `{ Message }` | SearchAvailableSlotsScreen |
| `/api/DrAppointment/DeleteAppointment` | POST | `{ AppointmentId, BranchId }` | `{ Message }` | ShowAppointmentScreen |

---

## 10. Referring Doctors

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/AddReferingDoctor/GetAll` | POST | `{ Branchid }` | `{ value: [{ dr_codeid, DoctorCode, DoctorName, DoctorPhoneno, Doctoremail, address1, city, DrType, contactperson, ratetypeid, PRO, Branchid, Createdon }], Count }` | ReferralDoctorScreen |
| `/api/AddReferingDoctor/GetById` | POST | `{ dr_codeid, Branchid }` | `[ReferingDoctorRecord]` | referingDoctorService |
| `/api/AddReferingDoctor/GetPRO` | POST | `{ branchId }` | `[{ ReferingDoctorId, DoctorName }]` | SearchAvailableSlotsScreen |
| `/api/AddReferingDoctor/Save` | POST | `{ DoctorCode, DoctorName, DoctorPhoneno, Doctoremail, address1, city, DrType, contactperson, ratetypeid, PRO, Branchid, Createdon }` | `{ Message }` | ReferralDoctorScreen |
| `/api/AddReferingDoctor/Update` | POST | `{ dr_codeid, DoctorCode, DoctorName, DoctorPhoneno, Doctoremail, address1, city, DrType, contactperson, ratetypeid, PRO, Branchid, Updatedby, Updatedon }` | `{ Message }` | ReferralDoctorScreen |
| `/api/AddReferingDoctor/Delete` | POST | `{ dr_codeid, Branchid }` | `{ Message }` | ReferralDoctorScreen |

---

## 11. Search Helpers (Registration)

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/Search/GetInitials` | POST | `{}` | `[{ Id, Name }]` | NewRegistrationScreen |
| `/api/Search/GetDoctors` | POST | `{}` | `[{ Id, Name }]` | NewRegistrationScreen (fallback) |
| `/api/Search/SearchTestAndPackage` | POST | `{ SearchText, BranchId }` | `[{ mainTestId, displayText }]` | registrationService |
| `/api/TestStatus/GetPatientTestStatus` (name search) | POST | `{ BranchId, PatientName, ... }` | same as section 4 | NewRegistrationScreen autocomplete |
| `/api/TestStatus/GetPatientTestStatus` (mobile search) | POST | `{ BranchId, MobileNo, ... }` | same as section 4 | NewRegistrationScreen autocomplete |

---

## 12. Summary by Controller

| Controller | Endpoints | Status |
|---|---|---|
| `ManageUser` | 1 | ✅ Live |
| `NewRegistration` | 2 | ✅ Live |
| `EditPatient` | 4 | ✅ Live (UpdatePatient & UpdateFiles use PATCH) |
| `TestStatus` | 5 | ✅ Live |
| `TestCharges` | 6 | ✅ Live |
| `TestMaster_SubDept` | 1 | ⚠️ Fallback only |
| `RateTypeMaster` | 1 | ⚠️ Fallback only |
| `MainTest` | 1 | ✅ Live |
| `DoctorSchedule` | 10 | ✅ Live |
| `DrAppointment` | 5 | ✅ Live |
| `AddReferingDoctor` | 6 | ✅ Live |
| `Search` | 4 | ⚠️ SearchTestAndPackage returns 500; app uses GetTestName instead |
| **Total** | **46** | |

---

## 13. Response Shape Notes

- `GetPatientTestStatus` returns `{ value: [...], Count: N }` — use `data.value`
- `GetAllAppointment` returns `{ value: [...], Count: N }` — use `data.value`  
- `EditPatient/GetGrid` returns `{ GridData: [...], TotalCount: [{ TotalRecords }] }`
- `EditPatient/GetPatient` returns `{ PatientInfo: [...], PaymentInfo: [...], Table1: [...] }`
- `AddReferingDoctor/GetAll` returns `{ value: [...], Count: N }` — use `data.value`
- Most other endpoints return a plain array `[...]` or `{ Message }` on write operations

---

## 14. Known Issues

| Endpoint | Issue |
|---|---|
| `/api/Search/SearchPatInfoByMobileNoAndName` | Returns 500 — replaced with `GetPatientTestStatus` |
| `/api/Search/SearchTests` | Returns 500 — replaced with `GetTestName` local filter |
| `/api/RateTypeMaster/GetAllRateType` | Returns empty — app falls back to deriving from `GetAllTestCharges` |
| `/api/TestMaster_SubDept/GetAllSubDept` | Returns empty — same fallback |
| `GetAllDrSlot` `Slot` field | Returns string (e.g. `"30"`) not number — parse with `parseInt` |
