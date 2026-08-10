# Life Relier App — API Reference

> **Base URL:** `https://dn8labapi.liferelier.in`  
> **Default Request Method:** `POST` with `Content-Type: application/json` (Note: `EditPatient` update endpoints use `PATCH`)  
> **Purpose:** Developer & API reference for the Life Relier mobile app.

---

## 1. Authentication (`ManageUser`)

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/ManageUser/Login` | `POST` | `{ UserName, Password }` | `{ token, userId, role, ... }` | `LoginScreen` |

---

## 2. Patient Registration (`NewRegistration`)

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/NewRegistration/RegisterPatient` | `POST` | `{ Patname, Age, Pataddress }` | `{ PID, PatRegID, PrefixRegNumber, ReceiptNo, BillNo, Message }` | `NewRegistrationScreen` |
| `/api/NewRegistration/UpdatePatientFiles` | `POST` | `{ PID, Patname, Age, Pataddress, BranchID }` | `{ PatRegID, BranchId, Message }` | `NewRegistrationScreen`, `EditPatientScreen` |

---

## 3. Edit Patient & Demographics (`EditPatient`)

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/EditPatient/GetGrid` | `POST` | `{ BranchId, FromDate, ToDate, PageNo, PageSize, CenterName, PatientName, MobileNo, PatRegID }` | `{ GridData: [...], TotalCount: [{ TotalRecords }] }` | `EditPatientScreen` |
| `/api/EditPatient/GetPatient` | `POST` | `{ PID }` | `{ PatientInfo: [...], PaymentInfo: [...], Table1: [...] }` | `EditPatientScreen` |
| `/api/EditPatient/UpdatePatient` | `PATCH` | `{ PID, BranchId, Patname, sex, Age, MobileNo, Pataddress, ... }` | `{ Message }` | `EditPatientScreen` |
| `/api/EditPatient/UpdateFiles` | `PATCH` | `{ PID, BranchId, uploadPrescription, ImagePath }` | `{ Message }` | `EditPatientScreen` |

---

## 4. Patient Test Status (`TestStatus`)

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/TestStatus/GetPatientTestStatus` | `POST` | `{ BranchId, FromDate, ToDate, PatRegID, PatientName, DoctorName, TestName, MobileNo, Barcode, CenterCode, SubDepartment, Status }` | `[{ PID, PatRegID, PatientName, sex, Age, Drname, CenterName, MainTestName, BarcodeID, Status, TestCharges, PaidAmount, DiscountAmount, OutstandingAmount, Patregdate, ... }]` | `PatientsScreen`, `CompletedReportsScreen`, `HomeScreen`, `PaymentsScreen` |
| `/api/TestStatus/GetSubDepartment` | `POST` | `{ BranchId }` | `[{ ID, SubDepartmentName }]` | `PatientsScreen`, `testChargesService` |
| `/api/TestStatus/GetCenter` | `POST` | `{ BranchId }` | `[{ CenterCode, CenterName }]` | `PatientsScreen`, `BookingTests`, `testChargesService` |
| `/api/TestStatus/GetTestName` | `POST` | `{ BranchId }` | `[{ MainTestName }]` | `TestChargesScreen`, `NewRegistrationScreen`, `testChargesService` |
| `/api/TestStatus/GetRateType` | `POST` | `{ BranchId }` | `[{ RateTypeId, RateTypeName }]` | `TestChargesScreen`, `testChargesService` |

---

## 5. Test Charges (`TestCharges`)

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/TestCharges/GetAllTestCharges` | `POST` | `{ RateTypeId, SubDeptId, BranchId }` | `[TestCharge]` | `TestChargesScreen`, `TestChargeDetailScreen` |
| `/api/TestCharges/GetTestChargesById` | `POST` | `{ Action: "GETBYID", TestChargeId }` | `TestCharge` | `TestChargeDetailScreen` |
| `/api/TestCharges/SaveTestCharges` | `POST` | `{ TestType, SubDeptId, MainTestId, PackageId, PackageName, RateTypeName, RateTypeId, MTCode, TestName, Amount, Percentage, Emergency, CreatedBy }` | `{ Message }` | `TestChargesScreen` |
| `/api/TestCharges/UpdateTestCharges` | `POST` | `{ TestChargeId, UpdatedBy, ...SavePayload }` | `{ Message }` | `TestChargesScreen` |
| `/api/TestCharges/DeleteTestCharges` | `POST` | `{ Action: "DELETE", TestChargeId }` | `{ Message }` | `TestChargesScreen` |
| `/api/TestCharges/GetPackages` | `POST` | `{ BranchId }` | `[{ PackageId, PackageName }]` | `TestChargesScreen` |

---

## 6. Sub Department, Rate Type & Main Test Masters

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/TestMaster_SubDept/GetAllSubDept` | `POST` | `{}` | `[{ SubDeptId, SubDeptName }]` | `testChargesService` (fallback) |
| `/api/RateTypeMaster/GetAllRateType` | `POST` | `{}` | `[{ RateTypeId, RateTypeName }]` | `testChargesService` (fallback) |
| `/api/MainTest/GetAll` | `POST` | `{}` | `[{ MainTestId, MainTestName }]` | `TestChargeDetailScreen`, `testChargesService` |

---

## 7. Doctor Schedule (`DoctorSchedule`)

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/DoctorSchedule/GetAllDoctorSchedule` | `POST` | `{ BranchId }` | `[{ scheduleId, DrId, StartDate, EndDate, StartTime, EndTime, BranchId, IsActive }]` | `DoctorManagementScreen` |
| `/api/DoctorSchedule/GetDoctorScheduleById` | `POST` | `{ scheduleId, BranchId }` | `[DoctorSchedule]` | `doctorScheduleService` |
| `/api/DoctorSchedule/SaveDoctorSchedule` | `POST` | `{ DrId, StartDate, EndDate, StartTime, EndTime, BranchId, CreatedBy, IsActive }` | `{ Message }` | `AddDoctorScheduleScreen` |
| `/api/DoctorSchedule/UpdateDoctorSchedule` | `POST` | `{ scheduleId, DrId, StartDate, EndDate, StartTime, EndTime, BranchId, UpdatedBy, IsActive }` | `{ Message }` | `AddDoctorScheduleScreen` |
| `/api/DoctorSchedule/DeleteDoctorSchedule` | `POST` | `{ scheduleId, BranchId }` | `{ Message }` | `DoctorManagementScreen` |
| `/api/DoctorSchedule/GetDoctorDropdown` | `POST` | `{ CompanyId }` | `[{ Id, FullName }]` | `AddDoctorScheduleScreen`, `AppointmentRecordsScreen`, `SearchAvailableSlotsScreen` |

---

## 8. Doctor Slots (`DrSlot`)

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/DrSlot/GetAllDrSlot` | `POST` | `{ BranchId }` | `[{ SlotId, DrId, Slot, BranchId, IsActive }]` | `DoctorManagementScreen`, `SearchAvailableSlotsScreen`, `BookAppointmentScreen` |
| `/api/DrSlot/SaveDrSlot` | `POST` | `{ DrId, Slot, BranchId, CreatedBy, IsActive }` | `{ Message }` | `AddDoctorSlotScreen` |
| `/api/DrSlot/UpdateDrSlot` | `POST` | `{ SlotId, DrId, Slot, BranchId, UpdatedBy, IsActive }` | `{ Message }` | `AddDoctorSlotScreen` |
| `/api/DrSlot/DeleteDrSlot` | `POST` | `{ SlotId, BranchId }` | `{ Message }` | `DoctorManagementScreen` |

---

## 9. Appointments (`DrAppointment`)

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/DrAppointment/GetAllAppointment` | `POST` | `{ BranchId }` | `[{ AppointmentId, DrId, Name, Mobile, AppointmentDate, Slot, Status, DoctorName, ... }]` | `AppointmentRecordsScreen`, `AppointmentListScreen` |
| `/api/DrAppointment/GetAppointmentById` | `POST` | `{ AppointmentId, BranchId }` | `[AppointmentRecord]` | `doctorScheduleService` |
| `/api/DrAppointment/SaveAppointment` | `POST` | `{ DrId, Name, FirstName, LastName, Mobile, AppointmentDate, Slot, Address, GenderId, InitialId, BirthDate, BranchId, CreatedBy }` | `{ Message, AppointmentId }` | `SearchAvailableSlotsScreen`, `BookAppointmentScreen` |
| `/api/DrAppointment/UpdateAppointment` | `POST` | `{ AppointmentId, UpdatedBy, ...SavePayload }` | `{ Message }` | `SearchAvailableSlotsScreen` |
| `/api/DrAppointment/DeleteAppointment` | `POST` | `{ AppointmentId, BranchId }` | `{ Message }` | `AppointmentListScreen` |

---

## 10. Referring Doctors (`AddReferingDoctor`)

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/AddReferingDoctor/GetAll` | `POST` | `{ Branchid }` | `{ value: [{ dr_codeid, DoctorCode, DoctorName, DoctorPhoneno, Doctoremail, address1, city, DrType, contactperson, ratetypeid, PRO, Branchid, Createdon }], Count }` | `ReferralDoctorScreen` |
| `/api/AddReferingDoctor/GetById` | `POST` | `{ dr_codeid, Branchid }` | `[ReferringDoctorRecord]` | `referringDoctorService` |
| `/api/AddReferingDoctor/GetPRO` | `POST` | `{ branchId }` | `[{ ReferingDoctorId, DoctorName }]` | `SearchAvailableSlotsScreen` |
| `/api/AddReferingDoctor/Save` | `POST` | `{ DoctorCode, DoctorName, DoctorPhoneno, Doctoremail, address1, city, DrType, contactperson, ratetypeid, PRO, Branchid, Createdon }` | `{ Message }` | `ReferralDoctorScreen` |
| `/api/AddReferingDoctor/Update` | `POST` | `{ dr_codeid, DoctorCode, DoctorName, DoctorPhoneno, Doctoremail, address1, city, DrType, contactperson, ratetypeid, PRO, Branchid, Updatedby, Updatedon }` | `{ Message }` | `ReferralDoctorScreen` |
| `/api/AddReferingDoctor/Delete` | `POST` | `{ dr_codeid, Branchid }` | `{ Message }` | `ReferralDoctorScreen` |

---

## 11. Search (`Search`)

| Endpoint | Method | Body | Response | Used In |
|---|---|---|---|---|
| `/api/Search/GetInitials` | `POST` | `{}` | `[{ Id, Name }]` | `NewRegistrationScreen` |
| `/api/Search/GetDoctors` | `POST` | `{}` | `[{ Id, Name }]` | `NewRegistrationScreen` |
| `/api/Search/SearchPatInfoByMobileNoAndName` | `POST` | `{ SearchText }` | `[{ PID, Patname, Mobile, Age, Pataddress }]` | `registrationService` |
| `/api/Search/SearchTests` | `POST` | `{ SearchText }` | `[{ TestName, ... }]` | `NewRegistrationScreen` |
| `/api/Search/SearchTestAndPackage` | `POST` | `{ SearchText, BranchId }` | `[{ mainTestId, displayText }]` | `NewRegistrationScreen` |

---

## Summary by Controller

| Controller | # Endpoints | Method(s) | Status |
|---|---|---|---|
| `ManageUser` | 1 | `POST` | ✅ Live |
| `NewRegistration` | 2 | `POST` | ✅ Live |
| `EditPatient` | 4 | `POST`, `PATCH` | ✅ Live |
| `TestStatus` | 5 | `POST` | ✅ Live |
| `TestCharges` | 6 | `POST` | ✅ Live |
| `TestMaster_SubDept` | 1 | `POST` | ⚠️ Fallback only |
| `RateTypeMaster` | 1 | `POST` | ⚠️ Fallback only |
| `MainTest` | 1 | `POST` | ✅ Live |
| `DoctorSchedule` | 6 | `POST` | ✅ Live |
| `DrSlot` | 4 | `POST` | ✅ Live |
| `DrAppointment` | 5 | `POST` | ✅ Live |
| `AddReferingDoctor` | 6 | `POST` | ✅ Live |
| `Search` | 5 | `POST` | ✅ Live |
| **Total** | **47** | | |
