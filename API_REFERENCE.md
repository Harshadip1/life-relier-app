# Life Relier App — API Reference

> **Base URL:** `https://dn8labapi.liferelier.in`  
> **All requests:** `POST` with `Content-Type: application/json`  
> This file is for backend/developer reference only — not used in the app.

---

## 1. Authentication

| Endpoint | Body | Response | Used In |
|---|---|---|---|
| `POST /api/ManageUser/Login` | `{ UserName, Password }` | `{ token, userId, role, ... }` | `LoginScreen` |

---

## 2. Patient Registration

| Endpoint | Body | Response | Used In |
|---|---|---|---|
| `POST /api/NewRegistration/RegisterPatient` | `{ Patname, Age, Pataddress }` | `{ PID, PatRegID, PrefixRegNumber, ReceiptNo, BillNo, Message }` | `NewRegistrationScreen` |
| `POST /api/NewRegistration/UpdatePatientFiles` | `{ PID, Patname, Age, Pataddress, BranchID }` | `{ PatRegID, BranchId, Message }` | `NewRegistrationScreen`, `EditPatientScreen` |

---

## 3. Patient Test Status

| Endpoint | Body | Response | Used In |
|---|---|---|---|
| `POST /api/TestStatus/GetPatientTestStatus` | `{ BranchId, FromDate, ToDate, PatRegID, PatientName, DoctorName, TestName, MobileNo, Barcode, CenterCode, SubDepartment, Status }` | `[{ PID, PatRegID, PatientName, sex, Age, Drname, CenterName, MainTestName, BarcodeID, Status, TestCharges, PaidAmount, DiscountAmount, OutstandingAmount, Patregdate, ... }]` | `PatientsScreen`, `CompletedReportsScreen`, `HomeScreen`, `PaymentsScreen` |
| `POST /api/TestStatus/GetSubDepartment` | `{ BranchId }` | `[{ ID, SubDepartmentName }]` | `PatientsScreen` |
| `POST /api/TestStatus/GetCenter` | `{ BranchId }` | `[{ CenterCode, CenterName }]` | `PatientsScreen`, `BookingTests` |
| `POST /api/TestStatus/GetTestName` | `{ BranchId }` | `[{ MainTestName }]` | `TestChargesScreen`, `NewRegistrationScreen` |
| `POST /api/TestStatus/GetRateType` | `{ BranchId }` | `[{ RateTypeId, RateTypeName }]` | `TestChargesScreen` |

---

## 4. Test Charges

| Endpoint | Body | Response | Used In |
|---|---|---|---|
| `POST /api/TestCharges/GetAllTestCharges` | `{ RateTypeId, SubDeptId }` | `[TestCharge]` | `TestChargesScreen`, `TestChargeDetailScreen` |
| `POST /api/TestCharges/GetTestChargesById` | `{ Action: "GETBYID", TestChargeId }` | `TestCharge` | `TestChargeDetailScreen` |
| `POST /api/TestCharges/SaveTestCharges` | `{ TestType, SubDeptId, MainTestId, PackageId, PackageName, RateTypeName, RateTypeId, MTCode, TestName, Amount, Percentage, Emergency, CreatedBy }` | `{ Message }` | `TestChargesScreen` |
| `POST /api/TestCharges/UpdateTestCharges` | `{ TestChargeId, UpdatedBy, ...SavePayload }` | `{ Message }` | `TestChargesScreen` |
| `POST /api/TestCharges/DeleteTestCharges` | `{ Action: "DELETE", TestChargeId }` | `{ Message }` | `TestChargesScreen` |
| `POST /api/TestCharges/GetPackages` | `{ BranchId }` | `[{ PackageId, PackageName }]` | `TestChargesScreen` |

---

## 5. Sub Department & Rate Type (TestMaster endpoints)

| Endpoint | Body | Response | Used In |
|---|---|---|---|
| `POST /api/TestMaster_SubDept/GetAllSubDept` | `{}` | `[{ SubDeptId, SubDeptName }]` | `testChargesService` (fallback) |
| `POST /api/RateTypeMaster/GetAllRateType` | `{}` | `[{ RateTypeId, RateTypeName }]` | `testChargesService` (fallback) |
| `POST /api/MainTest/GetAll` | `{}` | `[{ MainTestId, MainTestName }]` | `TestChargeDetailScreen` |

---

## 6. Doctor Schedule

| Endpoint | Body | Response | Used In |
|---|---|---|---|
| `POST /api/DoctorSchedule/GetAllDoctorSchedule` | `{ BranchId }` | `[{ scheduleId, DrId, StartDate, EndDate, StartTime, EndTime, BranchId, IsActive }]` | `DrAppointmentScreen`, `DoctorManagementScreen` |
| `POST /api/DoctorSchedule/GetDoctorScheduleById` | `{ scheduleId, BranchId }` | `[DoctorSchedule]` | `doctorScheduleService` |
| `POST /api/DoctorSchedule/SaveDoctorSchedule` | `{ DrId, StartDate, EndDate, StartTime, EndTime, BranchId, CreatedBy, IsActive }` | `{ Message }` | `AddDoctorScheduleScreen` |
| `POST /api/DoctorSchedule/UpdateDoctorSchedule` | `{ scheduleId, DrId, StartDate, EndDate, StartTime, EndTime, BranchId, UpdatedBy, IsActive }` | `{ Message }` | `AddDoctorScheduleScreen` |
| `POST /api/DoctorSchedule/DeleteDoctorSchedule` | `{ scheduleId, BranchId }` | `{ Message }` | `DoctorManagementScreen` |
| `POST /api/DoctorSchedule/GetDoctorDropdown` | `{ CompanyId }` | `[{ Id, FullName }]` | `AddDoctorScheduleScreen`, `AppointmentRecordsScreen`, `SearchAvailableSlotsScreen` |

---

## 7. Doctor Slots

| Endpoint | Body | Response | Used In |
|---|---|---|---|
| `POST /api/DoctorSchedule/GetAllDrSlot` | `{ BranchId }` | `[{ SlotId, DrId, SlotMins, BranchId, IsActive }]` | `DoctorManagementScreen`, `SearchAvailableSlotsScreen`, `BookAppointmentScreen` |
| `POST /api/DoctorSchedule/SaveDrSlot` | `{ DrId, SlotMins, BranchId, CreatedBy, IsActive }` | `{ Message }` | `AddDoctorSlotScreen` |
| `POST /api/DoctorSchedule/UpdateDrSlot` | `{ SlotId, DrId, SlotMins, BranchId, UpdatedBy, IsActive }` | `{ Message }` | `AddDoctorSlotScreen` |
| `POST /api/DoctorSchedule/DeleteDrSlot` | `{ SlotId, BranchId }` | `{ Message }` | `DoctorManagementScreen` |

---

## 8. Appointments

| Endpoint | Body | Response | Used In |
|---|---|---|---|
| `POST /api/DrAppointment/GetAllAppointment` | `{ BranchId }` | `[{ AppointmentId, DrId, Name, Mobile, AppointmentDate, Slot, Status, DoctorName, ... }]` | `AppointmentRecordsScreen`, `ShowAppointmentScreen` |
| `POST /api/DrAppointment/GetAppointmentById` | `{ AppointmentId, BranchId }` | `[AppointmentRecord]` | `doctorScheduleService` |
| `POST /api/DrAppointment/SaveAppointment` | `{ DrId, Name, FirstName, LastName, Mobile, AppointmentDate, Slot, Address, GenderId, InitialId, BirthDate, BranchId, CreatedBy }` | `{ Message, AppointmentId }` | `SearchAvailableSlotsScreen`, `BookAppointmentScreen` |
| `POST /api/DrAppointment/UpdateAppointment` | `{ AppointmentId, UpdatedBy, ...SavePayload }` | `{ Message }` | `SearchAvailableSlotsScreen` |
| `POST /api/DrAppointment/DeleteAppointment` | `{ AppointmentId, BranchId }` | `{ Message }` | `ShowAppointmentScreen` |

---

## 9. Referring Doctors

| Endpoint | Body | Response | Used In |
|---|---|---|---|
| `POST /api/AddReferingDoctor/GetAll` | `{ Branchid }` | `{ value: [{ dr_codeid, DoctorCode, DoctorName, DoctorPhoneno, Doctoremail, address1, city, DrType, contactperson, ratetypeid, PRO, Branchid, Createdon }], Count }` | `ReferralDoctorScreen` |
| `POST /api/AddReferingDoctor/GetById` | `{ dr_codeid, Branchid }` | `[ReferingDoctorRecord]` | `referingDoctorService` |
| `POST /api/AddReferingDoctor/GetPRO` | `{ branchId }` | `[{ ReferingDoctorId, DoctorName }]` | `SearchAvailableSlotsScreen` |
| `POST /api/AddReferingDoctor/Save` | `{ DoctorCode, DoctorName, DoctorPhoneno, Doctoremail, address1, city, DrType, contactperson, ratetypeid, PRO, Branchid, Createdon }` | `{ Message }` | `ReferralDoctorScreen` |
| `POST /api/AddReferingDoctor/Update` | `{ dr_codeid, DoctorCode, DoctorName, DoctorPhoneno, Doctoremail, address1, city, DrType, contactperson, ratetypeid, PRO, Branchid, Updatedby, Updatedon }` | `{ Message }` | `ReferralDoctorScreen` |
| `POST /api/AddReferingDoctor/Delete` | `{ dr_codeid, Branchid }` | `{ Message }` | `ReferralDoctorScreen` |

---

## 10. Search (Registration helpers)

| Endpoint | Body | Response | Used In |
|---|---|---|---|
| `POST /api/Search/GetInitials` | `{}` | `[{ Id, Name }]` | `NewRegistrationScreen` |
| `POST /api/Search/GetDoctors` | `{}` | `[{ Id, Name }]` | `NewRegistrationScreen` |
| `POST /api/Search/SearchPatInfoByMobileNoAndName` | `{ SearchText }` | `[{ PID, Patname, Mobile, Age, Pataddress }]` | `registrationService` |
| `POST /api/Search/SearchTests` | `{ SearchText }` | `[{ TestName, ... }]` | `NewRegistrationScreen` |

---

## Summary by Controller

| Controller | # Endpoints | Status |
|---|---|---|
| `ManageUser` | 1 | ✅ Live |
| `NewRegistration` | 2 | ✅ Live |
| `TestStatus` | 5 | ✅ Live |
| `TestCharges` | 6 | ✅ Live |
| `TestMaster_SubDept` | 1 | ⚠️ Fallback only |
| `RateTypeMaster` | 1 | ⚠️ Fallback only |
| `MainTest` | 1 | ✅ Live |
| `DoctorSchedule` | 6 | ✅ Live |
| `DrAppointment` | 5 | ✅ Live |
| `AddReferingDoctor` | 6 | ✅ Live |
| `Search` | 4 | ✅ Live |
| **Total** | **38** | |
