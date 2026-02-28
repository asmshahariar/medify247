# Doctor Multi-Association System

This document explains how doctors can register and be associated with multiple entities (hospitals, diagnostic centers, and as individual doctors) using the same credentials.

---

## Overview

A doctor can now:
- **Register with multiple hospitals** using the same email, phone, and medical license number
- **Register with multiple diagnostic centers** using the same credentials
- **Work as an individual doctor** (no association)
- **Have all three types of associations simultaneously**

---

## How It Works

### 1. Doctor Registration Flow

#### Individual Doctor Registration
- Doctor registers via `/api/doctors/register` without `hospitalId`
- Creates a new doctor record if credentials don't exist
- If doctor already exists with hospital/diagnostic center association, allows individual registration

#### Hospital Association
- Hospital admin adds doctor via `/api/hospitals/:hospitalId/doctors`
- **If doctor exists** (same email/phone/license): Links existing doctor to hospital
- **If doctor doesn't exist**: Creates new doctor and links to hospital
- Doctor is added to hospital's `associatedDoctors` array
- Doctor's `hospitalId` is set (if not already set) to track primary hospital

#### Diagnostic Center Association
- Diagnostic center admin adds doctor via `/api/diagnostic-centers/:centerId/doctors`
- **If doctor exists** (same email/phone/license): Links existing doctor to diagnostic center
- **If doctor doesn't exist**: Creates new doctor and links to diagnostic center
- Doctor is added to diagnostic center's `associatedDoctors` array
- Doctor's `diagnosticCenterId` is set (if not already set) to track primary center

#### Linking Existing Doctors
- Hospital admin can link existing approved doctor via `/api/hospitals/:hospitalId/doctors/link`
- Diagnostic center admin can link existing approved doctor via `/api/diagnostic-centers/:centerId/doctors/link`
- These endpoints add doctor to `associatedDoctors` array without creating duplicates

---

## Data Model

### Doctor Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String (unique),
  medicalLicenseNumber: String (unique),
  hospitalId: ObjectId (primary hospital, can be null),
  diagnosticCenterId: ObjectId (primary diagnostic center, can be null),
  // ... other fields
}
```

**Note**: 
- `hospitalId` and `diagnosticCenterId` store the **primary** association
- Multiple associations are tracked via `Hospital.associatedDoctors` and `DiagnosticCenter.associatedDoctors` arrays
- A doctor can have `hospitalId` set AND `diagnosticCenterId` set AND work as individual

### SerialSettings Model
```javascript
{
  doctorId: ObjectId (required),
  hospitalId: ObjectId (optional, for hospital-based serials),
  diagnosticCenterId: ObjectId (optional, for diagnostic center-based serials),
  // ... serial settings
}
```

**Key Points**:
- A doctor can have **multiple SerialSettings**:
  - One per hospital (different `hospitalId` values)
  - One per diagnostic center (different `diagnosticCenterId` values)
  - One for individual practice (`hospitalId` and `diagnosticCenterId` both null)
- Each association can have its own serial configuration

---

## Serial Booking Logic

When a user books a serial with a doctor:

1. **System checks doctor's associations**:
   - Primary `hospitalId` (if set)
   - Primary `diagnosticCenterId` (if set)
   - Individual practice (if neither is set)

2. **Finds SerialSettings**:
   - For hospital doctor: Uses SerialSettings with matching `hospitalId`
   - For diagnostic center doctor: Uses SerialSettings with matching `diagnosticCenterId`
   - For individual doctor: Uses SerialSettings with both IDs null

3. **Sends notifications**:
   - Hospital doctors → Notifies hospital admins
   - Diagnostic center doctors → Notifies diagnostic center admins
   - Individual doctors → Notifies doctor directly

---

## Example Scenarios

### Scenario 1: Doctor with Multiple Associations

**Doctor**: Dr. John Smith
- Email: `john.smith@example.com`
- Phone: `+1234567890`
- License: `MD-12345`

**Associations**:
1. **Hospital A** (Primary - `hospitalId` set)
   - SerialSettings: 20 serials/day, 9 AM - 5 PM, $500
2. **Diagnostic Center B** (Primary - `diagnosticCenterId` set)
   - SerialSettings: 15 serials/day, 10 AM - 4 PM, $400
3. **Individual Practice** (No association)
   - SerialSettings: 10 serials/day, 2 PM - 6 PM, $300

**Result**: 
- Doctor can accept appointments at Hospital A, Diagnostic Center B, and individual practice
- Each has separate serial settings and booking system
- Patient books with doctor, system uses primary association's SerialSettings

### Scenario 2: Linking Existing Doctor

**Step 1**: Doctor registers individually
- Creates doctor record with `hospitalId: null`, `diagnosticCenterId: null`

**Step 2**: Hospital admin adds same doctor
- System finds existing doctor (same email/phone/license)
- Links doctor to hospital (adds to `associatedDoctors`)
- Sets `hospitalId` to this hospital

**Step 3**: Diagnostic center admin adds same doctor
- System finds existing doctor
- Links doctor to diagnostic center (adds to `associatedDoctors`)
- Sets `diagnosticCenterId` to this center

**Result**: Doctor now has all three associations

---

## API Behavior

### Adding Doctor (Hospital/Diagnostic Center Admin)

**If doctor exists**:
- ✅ Links existing doctor to entity
- ✅ Adds to `associatedDoctors` array
- ✅ Updates primary `hospitalId`/`diagnosticCenterId` if not set
- ✅ Returns success with existing doctor info

**If doctor doesn't exist**:
- ✅ Creates new doctor record
- ✅ Links to entity
- ✅ Sets primary association

**If already linked**:
- ❌ Returns 409 Conflict: "Doctor is already associated with this [entity]"

### Individual Doctor Registration

**If doctor exists with hospital/center association**:
- ✅ Allows registration (doctor can have both associations and individual practice)
- ✅ Creates individual SerialSettings

**If doctor exists as individual**:
- ❌ Returns 400: "Doctor already registered as individual"

**If doctor doesn't exist**:
- ✅ Creates new doctor record

---

## Important Notes

1. **Primary Association**: The `hospitalId` and `diagnosticCenterId` fields store the primary association, but doctors can have multiple associations via `associatedDoctors` arrays.

2. **Serial Settings**: Each association (hospital, diagnostic center, individual) can have its own SerialSettings with different configurations.

3. **Booking Context**: When booking, the system uses the primary association's SerialSettings. If you need to book with a specific association, you may need to specify `hospitalId` or `diagnosticCenterId` in the booking request (future enhancement).

4. **No Duplicates**: The system prevents creating duplicate doctor records with the same credentials. Instead, it links existing doctors to new entities.

5. **Flexible Associations**: A doctor can:
   - Work at multiple hospitals
   - Work at multiple diagnostic centers
   - Work as individual
   - Have any combination of the above

---

## Database Indexes

The system uses sparse indexes to allow:
- Multiple doctors with `hospitalId: null`
- Multiple doctors with `diagnosticCenterId: null`
- Unique constraints per association type

---

**The system now fully supports doctors with multiple associations!** ✅

