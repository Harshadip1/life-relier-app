# Book Appointment - API Integration Summary

## Connected APIs from Appointment Desk

### 1. **getDoctorDropdown** ✅
- **Purpose**: Fetches list of available doctors/collection persons
- **Endpoint**: `/api/DoctorSchedule/GetDoctorDropdown`
- **Usage**: Populates the "Collection Person (Doctor)" dropdown
- **Triggered**: On component mount

### 2. **saveAppointment** ✅
- **Purpose**: Saves the appointment booking to the database
- **Endpoint**: `/api/DrAppointment/SaveAppointment`
- **Usage**: Called when user clicks "Confirm Booking"
- **Payload Includes**:
  - DrId (selected doctor)
  - Name, FirstName, LastName (patient name)
  - Mobile (10-digit phone number)
  - AppointmentDate (YYYY-MM-DD format)
  - Slot (selected time slot like "08:00 AM")
  - Address (complete address)
  - BranchId: 4 (for app bookings)
  - CreatedBy (user name)
  - Other required fields (GenderId, InitialId, BirthDate, etc.)

### 3. **getAllAppointments** ✅
- **Purpose**: Fetches all appointments to check booked slots
- **Endpoint**: `/api/DrAppointment/GetAllAppointment`
- **Usage**: 
  - Fetches from both Branch 1 and Branch 4
  - Filters by selected date and doctor
  - Shows which time slots are already booked (red border)
- **Triggered**: When date or doctor changes

## Features Implemented

### ✅ Patient Details
- Full Name (empty at start)
- Mobile Number (exactly 10 digits validation)
- Complete Address
- Collection Person (Doctor) dropdown

### ✅ Date Selection
- Calendar date picker
- Minimum date: Today (cannot select past dates)
- Formatted display: DD-MM-YYYY

### ✅ Time Slot Management
- **Available slots** (green border) - can be selected
- **Booked slots** (red border) - disabled, fetched from API
- **Past slots** (gray border) - disabled for today's date
- Real-time checking against user's clock
- Legend showing all three statuses

### ✅ Booking Process
1. User fills patient details
2. Selects doctor from dropdown
3. Selects date from calendar
4. System automatically fetches booked slots for that date/doctor
5. User selects available time slot
6. Clicks "Confirm Booking"
7. API saves appointment with BranchId=4 (app bookings)
8. Success modal shown with confirmation

## Data Flow

```
User Opens Screen
    ↓
Load Doctors → getDoctorDropdown(1)
    ↓
User Selects Date & Doctor
    ↓
Fetch Booked Slots → getAllAppointments(1) + getAllAppointments(4)
    ↓
Filter by Date & Doctor → Show Available/Booked/Past
    ↓
User Selects Time & Fills Details
    ↓
User Clicks "Confirm Booking"
    ↓
Call saveAppointment(payload) with BranchId=4
    ↓
Success → Show Confirmation Modal
```

## Integration Complete

All appointment desk APIs relevant to the booking process are now integrated:
- ✅ Doctor dropdown
- ✅ Save appointment
- ✅ Check booked slots
- ✅ No API changes required
- ✅ All validations in place
