# Diagnostic Center Doctor Serial Booking API

Complete API documentation for Diagnostic Center Doctor Serial Booking system. This allows users to book online serials (appointments) with doctors at diagnostic centers, with only even-numbered serials available for online booking.

---

## Table of Contents

1. [Diagnostic Center Admin APIs](#diagnostic-center-admin-apis)
   - [Add Doctor](#add-doctor)
   - [Get All Doctors](#get-all-doctors)
   - [Link Existing Doctor](#link-existing-doctor)
   - [Remove Doctor](#remove-doctor)
   - [Create/Update Doctor Serial Settings](#createupdate-doctor-serial-settings)
   - [Get Doctor Serial Settings](#get-doctor-serial-settings)
   - [Get Doctor Serial Statistics](#get-doctor-serial-statistics)

2. [Patient APIs](#patient-apis)
   - [Get Available Doctor Serials](#get-available-doctor-serials)
   - [Book Doctor Serial](#book-doctor-serial)

---

## 🔐 Authentication

**Required**: All endpoints require authentication
- **Diagnostic Center Admin**: Must be authenticated with `diagnostic_center_admin` or `super_admin` role
- **Patient**: Must be authenticated with `patient` role

---

# Diagnostic Center Admin APIs

## Add Doctor

### Endpoint
**POST** `/api/diagnostic-centers/:centerId/doctors`

**Description**: Add a new doctor to the diagnostic center (auto-approved)

**Authentication**: Required (Diagnostic Center Admin or Super Admin)

---

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `centerId` | String | Diagnostic center ID |

---

### Request Body

```json
{
  "name": "Dr. John Smith",
  "email": "john.smith@example.com",
  "phone": "+1234567890",
  "password": "securepassword123",
  "medicalLicenseNumber": "MD-12345",
  "licenseDocumentUrl": "https://...",
  "specialization": ["Cardiology", "Internal Medicine"],
  "qualifications": "MBBS, MD",
  "experienceYears": 10,
  "chamber": {
    "name": "Cardiology Clinic",
    "address": "123 Medical St",
    "daysOpen": ["Monday", "Wednesday", "Friday"],
    "hours": "9 AM - 5 PM"
  },
  "profilePhotoUrl": "https://..."
}
```

### Request Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `name` | String | Yes | Doctor's full name | `"Dr. John Smith"` |
| `email` | String | Yes | Doctor's email (must be unique) | `"john.smith@example.com"` |
| `phone` | String | Yes | Doctor's phone number (must be unique) | `"+1234567890"` |
| `password` | String | Yes | Password (min 8 characters) | `"securepassword123"` |
| `medicalLicenseNumber` | String | Yes | Medical license number (must be unique) | `"MD-12345"` |
| `licenseDocumentUrl` | String | No | URL to license document | `"https://..."` |
| `specialization` | Array/String | Yes | Specialization(s) | `["Cardiology"]` or `"Cardiology"` |
| `qualifications` | String | No | Doctor's qualifications | `"MBBS, MD"` |
| `experienceYears` | Number | Yes | Years of experience (min: 0) | `10` |
| `chamber` | Object | No | Chamber information | `{ "name": "...", "address": "..." }` |
| `profilePhotoUrl` | String | No | Profile photo URL | `"https://..."` |

---

### Example Request

```bash
POST http://localhost:5000/api/diagnostic-centers/507f1f77bcf86cd799439011/doctors
Authorization: Bearer <diagnostic_center_admin_token>
Content-Type: application/json

{
  "name": "Dr. John Smith",
  "email": "john.smith@example.com",
  "phone": "+1234567890",
  "password": "securepassword123",
  "medicalLicenseNumber": "MD-12345",
  "specialization": ["Cardiology"],
  "experienceYears": 10
}
```

---

### Success Response

**Status Code**: `201 Created`

```json
{
  "success": true,
  "message": "Doctor added and approved successfully",
  "data": {
    "doctor": {
      "id": "507f1f77bcf86cd799439012",
      "name": "Dr. John Smith",
      "email": "john.smith@example.com",
      "status": "approved",
      "medicalLicenseNumber": "MD-12345"
    }
  }
}
```

---

## Get All Doctors

### Endpoint
**GET** `/api/diagnostic-centers/:centerId/doctors`

**Description**: List all doctors associated with the diagnostic center

**Authentication**: Required (Diagnostic Center Admin or Super Admin)

---

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `centerId` | String | Diagnostic center ID |

---

### Example Request

```bash
GET http://localhost:5000/api/diagnostic-centers/507f1f77bcf86cd799439011/doctors
Authorization: Bearer <diagnostic_center_admin_token>
```

---

### Success Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Dr. John Smith",
        "email": "john.smith@example.com",
        "phone": "+1234567890",
        "specialization": ["Cardiology"],
        "qualifications": "MBBS, MD",
        "experienceYears": 10,
        "status": "approved",
        "diagnosticCenterId": "507f1f77bcf86cd799439011",
        "createdAt": "2024-01-16T10:00:00.000Z"
      }
    ],
    "diagnosticCenter": {
      "id": "507f1f77bcf86cd799439011",
      "name": "City Diagnostic Center",
      "status": "approved"
    }
  }
}
```

---

## Link Existing Doctor

### Endpoint
**POST** `/api/diagnostic-centers/:centerId/doctors/link`

**Description**: Link an existing approved doctor to the diagnostic center

**Authentication**: Required (Diagnostic Center Admin or Super Admin)

---

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `centerId` | String | Diagnostic center ID |

### Request Body

```json
{
  "doctorId": "507f1f77bcf86cd799439012",
  "designation": "Senior Consultant",
  "department": "Cardiology"
}
```

### Request Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `doctorId` | String | Yes | ID of existing approved doctor | `"507f1f77bcf86cd799439012"` |
| `designation` | String | No | Doctor's designation | `"Senior Consultant"` |
| `department` | String | No | Department name | `"Cardiology"` |

---

### Example Request

```bash
POST http://localhost:5000/api/diagnostic-centers/507f1f77bcf86cd799439011/doctors/link
Authorization: Bearer <diagnostic_center_admin_token>
Content-Type: application/json

{
  "doctorId": "507f1f77bcf86cd799439012",
  "designation": "Senior Consultant",
  "department": "Cardiology"
}
```

---

### Success Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "message": "Doctor linked to diagnostic center successfully",
  "data": {
    "doctor": {
      "id": "507f1f77bcf86cd799439012",
      "name": "Dr. John Smith",
      "email": "john.smith@example.com"
    }
  }
}
```

---

## Remove Doctor

### Endpoint
**DELETE** `/api/diagnostic-centers/:centerId/doctors/:doctorId`

**Description**: Remove a doctor from the diagnostic center

**Authentication**: Required (Diagnostic Center Admin or Super Admin)

---

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `centerId` | String | Diagnostic center ID |
| `doctorId` | String | Doctor ID |

---

### Example Request

```bash
DELETE http://localhost:5000/api/diagnostic-centers/507f1f77bcf86cd799439011/doctors/507f1f77bcf86cd799439012
Authorization: Bearer <diagnostic_center_admin_token>
```

---

### Success Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "message": "Doctor removed from diagnostic center successfully"
}
```

---

## Create/Update Doctor Serial Settings

### Endpoint
**POST** `/api/diagnostic-centers/:centerId/doctors/:doctorId/serial-settings`

**Description**: Create or update serial settings for a diagnostic center doctor

**Authentication**: Required (Diagnostic Center Admin or Super Admin)

---

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `centerId` | String | Diagnostic center ID |
| `doctorId` | String | Doctor ID |

---

### Request Body

```json
{
  "totalSerialsPerDay": 20,
  "serialTimeRange": {
    "startTime": "09:00",
    "endTime": "17:00"
  },
  "appointmentPrice": 500,
  "availableDays": [0, 1, 2, 3, 4, 5, 6],
  "isActive": true
}
```

### Request Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `totalSerialsPerDay` | Number | Yes | Total number of serials available per day (min: 1) | `20` |
| `serialTimeRange.startTime` | String | Yes | Start time in HH:mm format (24-hour) | `"09:00"` |
| `serialTimeRange.endTime` | String | Yes | End time in HH:mm format (24-hour) | `"17:00"` |
| `appointmentPrice` | Number | Yes | Appointment price (min: 0) | `500` |
| `availableDays` | Array | No | Days when serials are available (0=Sunday, 6=Saturday) | `[0, 1, 2, 3, 4, 5, 6]` |
| `isActive` | Boolean | No | Whether serials are enabled (default: true) | `true` |

---

### Validation Rules

1. `totalSerialsPerDay` must be a positive integer (min: 1)
2. `startTime` and `endTime` must be in HH:mm format (24-hour)
3. `endTime` must be after `startTime`
4. `appointmentPrice` must be a positive number (min: 0)
5. `availableDays` array can contain numbers 0-6 (0=Sunday, 6=Saturday)
6. Doctor must be associated with the specified diagnostic center
7. Diagnostic center must be approved

---

### Example Request

```bash
POST http://localhost:5000/api/diagnostic-centers/507f1f77bcf86cd799439011/doctors/507f1f77bcf86cd799439012/serial-settings
Authorization: Bearer <diagnostic_center_admin_token>
Content-Type: application/json

{
  "totalSerialsPerDay": 20,
  "serialTimeRange": {
    "startTime": "09:00",
    "endTime": "17:00"
  },
  "appointmentPrice": 500,
  "availableDays": [0, 1, 2, 3, 4, 5, 6],
  "isActive": true
}
```

---

### Success Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "message": "Serial settings saved successfully",
  "data": {
    "serialSettings": {
      "_id": "507f1f77bcf86cd799439013",
      "diagnosticCenterId": "507f1f77bcf86cd799439011",
      "doctorId": "507f1f77bcf86cd799439012",
      "totalSerialsPerDay": 20,
      "serialTimeRange": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "appointmentPrice": 500,
      "isActive": true,
      "availableDays": [0, 1, 2, 3, 4, 5, 6],
      "createdAt": "2024-01-16T10:00:00.000Z",
      "updatedAt": "2024-01-16T10:00:00.000Z"
    }
  }
}
```

---

## Get Doctor Serial Settings

### Endpoint
**GET** `/api/diagnostic-centers/:centerId/doctors/:doctorId/serial-settings`

**Description**: Get serial settings for a specific doctor

**Authentication**: Required (Diagnostic Center Admin or Super Admin)

---

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `centerId` | String | Diagnostic center ID |
| `doctorId` | String | Doctor ID |

---

### Example Request

```bash
GET http://localhost:5000/api/diagnostic-centers/507f1f77bcf86cd799439011/doctors/507f1f77bcf86cd799439012/serial-settings
Authorization: Bearer <diagnostic_center_admin_token>
```

---

### Success Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "data": {
    "serialSettings": {
      "_id": "507f1f77bcf86cd799439013",
      "diagnosticCenterId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "City Diagnostic Center"
      },
      "doctorId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Dr. John Smith",
        "email": "john.smith@example.com"
      },
      "totalSerialsPerDay": 20,
      "serialTimeRange": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "appointmentPrice": 500,
      "isActive": true,
      "availableDays": [0, 1, 2, 3, 4, 5, 6]
    }
  }
}
```

---

## Get Doctor Serial Statistics

### Endpoint
**GET** `/api/diagnostic-centers/:centerId/doctors/:doctorId/serial-stats?date=YYYY-MM-DD`

**Description**: Get statistics for doctor serial bookings (bookings, available serials, patient details)

**Authentication**: Required (Diagnostic Center Admin or Super Admin)

---

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `centerId` | String | Diagnostic center ID |
| `doctorId` | String | Doctor ID |

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `date` | String | No | Date to get stats for (YYYY-MM-DD). If not provided, returns today's stats | `"2024-01-20"` |

---

### Example Request

```bash
GET http://localhost:5000/api/diagnostic-centers/507f1f77bcf86cd799439011/doctors/507f1f77bcf86cd799439012/serial-stats?date=2024-01-20
Authorization: Bearer <diagnostic_center_admin_token>
```

---

### Success Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "data": {
    "serialSettings": {
      "totalSerialsPerDay": 20,
      "evenNumberedSerialsAvailable": 10,
      "appointmentPrice": 500,
      "timeRange": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "isActive": true
    },
    "statistics": {
      "date": "2024-01-20",
      "totalBooked": 5,
      "bookedEvenSerials": 5,
      "availableEvenSerials": 5,
      "bookedPatients": [
        {
          "appointmentNumber": "APT-1705123456-ABC123",
          "patient": {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+1234567890"
          },
          "time": "09:15",
          "serialNumber": "2"
        }
      ]
    }
  }
}
```

---

# Patient APIs

## Get Available Doctor Serials

### Endpoint
**GET** `/api/patient/doctors/:doctorId/serials?date=YYYY-MM-DD`

**Description**: Get available serials for a diagnostic center doctor on a specific date

**Authentication**: Required (Patient)

**Note**: This endpoint works for all doctors (hospital, diagnostic center, or individual). The system automatically detects the doctor's association.

---

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `doctorId` | String | Doctor ID |

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `date` | String | Yes | Date to check availability (YYYY-MM-DD) | `"2024-01-20"` |

---

### Example Request

```bash
GET http://localhost:5000/api/patient/doctors/507f1f77bcf86cd799439012/serials?date=2024-01-20
Authorization: Bearer <patient_token>
```

---

### Success Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "data": {
    "doctor": {
      "id": "507f1f77bcf86cd799439012",
      "name": "Dr. John Smith",
      "profilePhotoUrl": "https://...",
      "specialization": ["Cardiology"],
      "qualifications": "MBBS, MD"
    },
    "hospital": null,
    "diagnosticCenter": {
      "id": "507f1f77bcf86cd799439011",
      "name": "City Diagnostic Center"
    },
    "date": "2024-01-20",
    "availableSerials": [
      {
        "serialNumber": 2,
        "time": "09:15",
        "endTime": "09:30",
        "available": true
      },
      {
        "serialNumber": 4,
        "time": "09:45",
        "endTime": "10:00",
        "available": true
      }
    ],
    "totalSerials": 20,
    "appointmentPrice": 500,
    "timeRange": {
      "startTime": "09:00",
      "endTime": "17:00"
    },
    "bookedCount": 5,
    "availableCount": 10
  }
}
```

---

### Response Fields

| Field | Description |
|-------|-------------|
| `doctor` | Doctor details (name, photo, specialization, qualifications) |
| `hospital` | Hospital info if doctor is hospital-based (null for diagnostic center doctors) |
| `diagnosticCenter` | Diagnostic center info if doctor is diagnostic center-based |
| `date` | Date for which serials are shown |
| `availableSerials` | Array of available even-numbered serials with time slots |
| `availableSerials[].serialNumber` | Serial number (even numbers only) |
| `availableSerials[].time` | Start time for this serial |
| `availableSerials[].endTime` | End time for this serial |
| `totalSerials` | Total serials configured per day |
| `appointmentPrice` | Price for the appointment |
| `timeRange` | Overall time range for serials |
| `bookedCount` | Number of serials already booked |
| `availableCount` | Number of even-numbered serials still available |

---

## Book Doctor Serial

### Endpoint
**POST** `/api/patient/serials/book`

**Description**: Book a serial (appointment) with a doctor (only even-numbered serials can be booked)

**Authentication**: Required (Patient)

**Note**: This endpoint works for all doctors (hospital, diagnostic center, or individual). The system automatically detects the doctor's association and sends notifications to the appropriate admins.

---

### Request Body

```json
{
  "doctorId": "507f1f77bcf86cd799439012",
  "serialNumber": 2,
  "date": "2024-01-20"
}
```

### Request Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `doctorId` | String | Yes | Doctor ID | `"507f1f77bcf86cd799439012"` |
| `serialNumber` | Number | Yes | Serial number to book (must be even) | `2` |
| `date` | String | Yes | Appointment date (YYYY-MM-DD) | `"2024-01-20"` |

---

### Validation Rules

1. `serialNumber` must be an even number (2, 4, 6, 8, ...)
2. `date` must be in YYYY-MM-DD format
3. Serial must be available (not already booked)
4. Serial must be available on the selected day (based on `availableDays` settings)
5. Doctor must be approved

---

### Example Request

```bash
POST http://localhost:5000/api/patient/serials/book
Authorization: Bearer <patient_token>
Content-Type: application/json

{
  "doctorId": "507f1f77bcf86cd799439012",
  "serialNumber": 2,
  "date": "2024-01-20"
}
```

---

### Success Response

**Status Code**: `201 Created`

```json
{
  "success": true,
  "message": "Serial booked successfully",
  "data": {
    "appointment": {
      "_id": "507f1f77bcf86cd799439014",
      "appointmentNumber": "APT-1705123456-ABC123",
      "patientId": "507f1f77bcf86cd799439015",
      "doctorId": "507f1f77bcf86cd799439012",
      "appointmentDate": "2024-01-20T00:00:00.000Z",
      "timeSlot": {
        "startTime": "09:15",
        "endTime": "09:30",
        "sessionDuration": 15
      },
      "fee": 500,
      "status": "pending",
      "notes": "Serial #2",
      "createdAt": "2024-01-16T10:00:00.000Z"
    }
  }
}
```

---

### Error Responses

#### 400 Bad Request - Odd Serial Number
```json
{
  "success": false,
  "message": "Only even-numbered serials can be booked online"
}
```

#### 404 Not Found - Doctor Not Available
```json
{
  "success": false,
  "message": "Doctor not found or not available"
}
```

#### 404 Not Found - Serial Settings Not Found
```json
{
  "success": false,
  "message": "Serial settings not found for this doctor"
}
```

#### 400 Bad Request - Serial Not Available on This Day
```json
{
  "success": false,
  "message": "Serials are not available on this day"
}
```

#### 400 Bad Request - Serial Already Booked
```json
{
  "success": false,
  "message": "This serial is already booked"
}
```

---

## Important Notes

### Even-Numbered Serials Only

- **Only even-numbered serials (2, 4, 6, 8, ...) are available for online booking**
- Odd-numbered serials (1, 3, 5, 7, ...) are reserved for offline/walk-in bookings
- This ensures that diagnostic centers always have serials available for walk-in patients

### Automatic Detection

The system automatically detects whether a doctor is:
- **Hospital-based**: Notifications sent to hospital admins
- **Diagnostic center-based**: Notifications sent to diagnostic center admins
- **Individual**: Notifications sent directly to the doctor

### No Online Payment

- Doctor serial booking does **not** require online payment
- Payment is handled at the diagnostic center when the appointment is performed

### Notifications

When a serial is booked:
1. **Patient receives notification**: "Serial Booked" with appointment details
2. **Diagnostic center admins receive notification**: "New Serial Booking" with patient information (for diagnostic center doctors)
3. **Doctor receives notification**: "New Serial Booking" (for individual doctors)

---

## Complete Example Flow

### Step 1: Admin Adds Doctor

```bash
POST /api/diagnostic-centers/:centerId/doctors
{
  "name": "Dr. John Smith",
  "email": "john.smith@example.com",
  "phone": "+1234567890",
  "password": "securepassword123",
  "medicalLicenseNumber": "MD-12345",
  "specialization": ["Cardiology"],
  "experienceYears": 10
}
```

### Step 2: Admin Sets Up Serial Settings

```bash
POST /api/diagnostic-centers/:centerId/doctors/:doctorId/serial-settings
{
  "totalSerialsPerDay": 20,
  "serialTimeRange": {
    "startTime": "09:00",
    "endTime": "17:00"
  },
  "appointmentPrice": 500,
  "availableDays": [0, 1, 2, 3, 4, 5, 6],
  "isActive": true
}
```

### Step 3: Patient Views Available Serials

```bash
GET /api/patient/doctors/:doctorId/serials?date=2024-01-20
```

### Step 4: Patient Books a Serial

```bash
POST /api/patient/serials/book
{
  "doctorId": "...",
  "serialNumber": 2,
  "date": "2024-01-20"
}
```

### Step 5: Admin Views Statistics

```bash
GET /api/diagnostic-centers/:centerId/doctors/:doctorId/serial-stats?date=2024-01-20
```

---

## cURL Examples

### Admin: Add Doctor
```bash
curl -X POST http://localhost:5000/api/diagnostic-centers/507f1f77bcf86cd799439011/doctors \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. John Smith",
    "email": "john.smith@example.com",
    "phone": "+1234567890",
    "password": "securepassword123",
    "medicalLicenseNumber": "MD-12345",
    "specialization": ["Cardiology"],
    "experienceYears": 10
  }'
```

### Admin: Set Serial Settings
```bash
curl -X POST http://localhost:5000/api/diagnostic-centers/507f1f77bcf86cd799439011/doctors/507f1f77bcf86cd799439012/serial-settings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "totalSerialsPerDay": 20,
    "serialTimeRange": {
      "startTime": "09:00",
      "endTime": "17:00"
    },
    "appointmentPrice": 500,
    "availableDays": [0, 1, 2, 3, 4, 5, 6],
    "isActive": true
  }'
```

### Patient: Get Available Serials
```bash
curl -X GET "http://localhost:5000/api/patient/doctors/507f1f77bcf86cd799439012/serials?date=2024-01-20" \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"
```

### Patient: Book Serial
```bash
curl -X POST http://localhost:5000/api/patient/serials/book \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "507f1f77bcf86cd799439012",
    "serialNumber": 2,
    "date": "2024-01-20"
  }'
```

---

**Ready to use Diagnostic Center Doctor Serial Booking system!** ✅

