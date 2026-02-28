# Serial Booking System Implementation

## Overview

The Serial Booking System allows users to book online serials (appointments) with doctors. The system has two distinct flows: one for hospital-based doctors (managed by hospital admins) and one for individual doctors (managed by doctors themselves). Only even-numbered serials are available for online booking.

---

## Features

### Hospital-Based Doctor Serial System

**Hospital Admin Capabilities:**
- Manage serial settings for each doctor in the hospital
- Set total number of online serials available per day
- Configure serial time range (from time to time)
- Set appointment price
- Define available days
- View how many users have taken online serials
- See patient information for booked serials

**User Experience:**
- View available even-numbered serials
- See appointment price and full doctor details before confirming
- Book serial without online payment
- Patient information automatically sent to hospital admin

### Individual Doctor Serial System

**Doctor Capabilities:**
- Manage their own serial settings
- Set number of online serials available
- Configure serial time range
- Set appointment price
- Define available days
- View how many serials have been taken online
- See patient information for booked serials

**User Experience:**
- View available even-numbered serials
- See doctor's full profile details and appointment price
- Book serial without online payment
- Patient information automatically sent to doctor

---

## Data Model

### SerialSettings Schema

```javascript
{
  hospitalId: ObjectId,        // For hospital-based doctors (null for individual)
  doctorId: ObjectId,          // Doctor reference (required)
  chamberId: ObjectId,          // Optional chamber reference
  totalSerialsPerDay: Number,  // Total serials available per day
  serialTimeRange: {
    startTime: String,         // Format: "HH:mm" (e.g., "09:00")
    endTime: String            // Format: "HH:mm" (e.g., "17:00")
  },
  appointmentPrice: Number,     // Price for appointment
  availableDays: [Number],     // Days when serials available (0-6)
  isActive: Boolean,            // Whether serials are active
  createdAt: Date,
  updatedAt: Date
}
```

**Constraints:**
- One serial setting per doctor per hospital (or per doctor if individual)
- End time must be after start time
- Time format: HH:mm (24-hour format)

---

## API Endpoints

### Patient Endpoints (Serial Booking)

#### 1. Get Available Serials
**GET** `/api/patient/doctors/:doctorId/serials?date=YYYY-MM-DD`

**Query Parameters:**
- `date` (required) - Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "data": {
    "doctor": {
      "id": "...",
      "name": "Dr. John Smith",
      "profilePhotoUrl": "https://...",
      "specialization": ["Cardiology"],
      "qualifications": "MBBS, MD"
    },
    "hospital": {
      "id": "...",
      "name": "City General Hospital"
    },
    "date": "2024-01-15",
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
    "appointmentPrice": 1500,
    "timeRange": {
      "startTime": "09:00",
      "endTime": "17:00"
    },
    "bookedCount": 3,
    "availableCount": 7
  }
}
```

#### 2. Book a Serial
**POST** `/api/patient/serials/book`

**Request Body:**
```json
{
  "doctorId": "507f1f77bcf86cd799439011",
  "serialNumber": 2,
  "date": "2024-01-15"
}
```

**Validation:**
- `serialNumber` must be even (2, 4, 6, etc.)
- `date` must be a valid date
- Serial must not be already booked

**Response:**
```json
{
  "success": true,
  "message": "Serial booked successfully",
  "data": {
    "appointment": {
      "_id": "...",
      "appointmentNumber": "SR-1705123456-ABC123",
      "serialNumber": 2,
      "patientInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "appointmentNumber": "SR-1705123456-ABC123",
        "serialNumber": 2,
        "date": "2024-01-15",
        "time": "09:15",
        "doctorName": "Dr. John Smith"
      }
    },
    "doctor": {
      "id": "...",
      "name": "Dr. John Smith",
      "specialization": ["Cardiology"]
    },
    "hospital": {
      "id": "...",
      "name": "City General Hospital"
    }
  }
}
```

---

### Hospital Admin Endpoints (Serial Settings Management)

#### 1. Create or Update Serial Settings
**POST** `/api/hospitals/:hospitalId/doctors/:doctorId/serial-settings`

**Request Body:**
```json
{
  "totalSerialsPerDay": 20,
  "serialTimeRange": {
    "startTime": "09:00",
    "endTime": "17:00"
  },
  "appointmentPrice": 1500,
  "availableDays": [1, 2, 3, 4, 5],
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Serial settings saved successfully",
  "data": {
    "serialSettings": {
      "_id": "...",
      "hospitalId": "...",
      "doctorId": "...",
      "totalSerialsPerDay": 20,
      "serialTimeRange": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "appointmentPrice": 1500,
      "availableDays": [1, 2, 3, 4, 5],
      "isActive": true
    }
  }
}
```

#### 2. Get Serial Settings
**GET** `/api/hospitals/:hospitalId/doctors/:doctorId/serial-settings`

**Response:**
```json
{
  "success": true,
  "data": {
    "serialSettings": {
      "_id": "...",
      "hospitalId": "...",
      "doctorId": "...",
      "totalSerialsPerDay": 20,
      "serialTimeRange": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "appointmentPrice": 1500,
      "availableDays": [1, 2, 3, 4, 5],
      "isActive": true
    }
  }
}
```

#### 3. Get Serial Statistics
**GET** `/api/hospitals/:hospitalId/doctors/:doctorId/serial-stats?date=2024-01-15`

**Query Parameters:**
- `date` (optional) - Date in YYYY-MM-DD format (defaults to today)

**Response:**
```json
{
  "success": true,
  "data": {
    "serialSettings": {
      "totalSerialsPerDay": 20,
      "evenNumberedSerialsAvailable": 10,
      "appointmentPrice": 1500,
      "timeRange": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "isActive": true
    },
    "statistics": {
      "date": "2024-01-15",
      "totalBooked": 5,
      "bookedEvenSerials": 5,
      "availableEvenSerials": 5,
      "bookedPatients": [
        {
          "appointmentNumber": "SR-1705123456-ABC123",
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

### Doctor Endpoints (Individual Serial Settings Management)

#### 1. Create or Update My Serial Settings
**POST** `/api/doctor/serial-settings`

**Request Body:**
```json
{
  "totalSerialsPerDay": 20,
  "serialTimeRange": {
    "startTime": "09:00",
    "endTime": "17:00"
  },
  "appointmentPrice": 1500,
  "availableDays": [1, 2, 3, 4, 5],
  "isActive": true
}
```

**Note:** Only available for individual doctors (not under a hospital). Hospital-based doctors will receive an error message directing them to contact their hospital admin.

**Response:**
```json
{
  "success": true,
  "message": "Serial settings saved successfully",
  "data": {
    "serialSettings": {
      "_id": "...",
      "doctorId": "...",
      "hospitalId": null,
      "totalSerialsPerDay": 20,
      "serialTimeRange": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "appointmentPrice": 1500,
      "availableDays": [1, 2, 3, 4, 5],
      "isActive": true
    }
  }
}
```

#### 2. Get My Serial Settings
**GET** `/api/doctor/serial-settings`

**Response:**
```json
{
  "success": true,
  "data": {
    "serialSettings": {
      "_id": "...",
      "doctorId": "...",
      "hospitalId": null,
      "totalSerialsPerDay": 20,
      "serialTimeRange": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "appointmentPrice": 1500,
      "availableDays": [1, 2, 3, 4, 5],
      "isActive": true
    }
  }
}
```

#### 3. Get My Serial Statistics
**GET** `/api/doctor/serial-stats?date=2024-01-15`

**Query Parameters:**
- `date` (optional) - Date in YYYY-MM-DD format (defaults to today)

**Response:**
```json
{
  "success": true,
  "data": {
    "serialSettings": {
      "totalSerialsPerDay": 20,
      "evenNumberedSerialsAvailable": 10,
      "appointmentPrice": 1500,
      "timeRange": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "isActive": true
    },
    "statistics": {
      "date": "2024-01-15",
      "totalBooked": 5,
      "bookedEvenSerials": 5,
      "availableEvenSerials": 5,
      "bookedPatients": [
        {
          "appointmentNumber": "SR-1705123456-ABC123",
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

## Serial Number Calculation

### How Serial Numbers Work

1. **Total Serials**: Set by admin/doctor (e.g., 20 serials per day)
2. **Time Range**: Start time to end time (e.g., 09:00 to 17:00)
3. **Slot Duration**: Calculated as `(endTime - startTime) / totalSerials`
4. **Serial Numbers**: 1, 2, 3, ..., totalSerials
5. **Online Booking**: Only even numbers (2, 4, 6, 8, ...) are available

### Example

**Settings:**
- Total serials: 20
- Time range: 09:00 - 17:00 (8 hours = 480 minutes)
- Slot duration: 480 / 20 = 24 minutes per serial

**Serial Schedule:**
- Serial 1: 09:00 - 09:24 (not available online)
- Serial 2: 09:24 - 09:48 (available online) ✅
- Serial 3: 09:48 - 10:12 (not available online)
- Serial 4: 10:12 - 10:36 (available online) ✅
- ...
- Serial 20: 16:36 - 17:00 (available online) ✅

**Available for Online Booking:** Serials 2, 4, 6, 8, 10, 12, 14, 16, 18, 20 (10 serials)

---

## Notification System

### When a Serial is Booked

1. **Patient Notification:**
   - Type: `appointment_created`
   - Title: "Serial Booked Successfully"
   - Message: Includes serial number, date, and time

2. **Doctor Notification:**
   - Type: `appointment_created`
   - Title: "New Serial Booking"
   - Message: Includes patient name and serial number

3. **Hospital Admin Notification** (for hospital-based doctors):
   - Type: `appointment_created`
   - Title: "New Serial Booking"
   - Message: Includes doctor name, patient name, email, phone, and serial number
   - Sent to all hospital admins

### Patient Information Sent

When a serial is booked, the following patient information is automatically sent:
- Name
- Email
- Phone number
- Appointment number
- Serial number
- Date and time
- Doctor name

---

## Security & Access Control

### Authentication
- Patient endpoints require patient authentication
- Hospital admin endpoints require hospital admin authentication
- Doctor endpoints require doctor authentication

### Authorization
- Hospital admins can only manage serial settings for doctors in their hospital
- Individual doctors can only manage their own serial settings
- Hospital-based doctors cannot manage their own settings (must contact hospital admin)

### Validation
- Only even-numbered serials can be booked online
- Serial must be within valid range (1 to totalSerialsPerDay)
- Serial must not be already booked
- Date must be valid and within available days
- Time range must be valid (end time after start time)

---

## Example Usage

### Example 1: Hospital Admin Sets Up Serial Settings

```bash
POST /api/hospitals/507f1f77bcf86cd799439011/doctors/507f1f77bcf86cd799439012/serial-settings
Authorization: Bearer <hospital_admin_token>

{
  "totalSerialsPerDay": 20,
  "serialTimeRange": {
    "startTime": "09:00",
    "endTime": "17:00"
  },
  "appointmentPrice": 1500,
  "availableDays": [1, 2, 3, 4, 5],
  "isActive": true
}
```

### Example 2: User Views Available Serials

```bash
GET /api/patient/doctors/507f1f77bcf86cd799439012/serials?date=2024-01-15
Authorization: Bearer <patient_token>
```

### Example 3: User Books a Serial

```bash
POST /api/patient/serials/book
Authorization: Bearer <patient_token>

{
  "doctorId": "507f1f77bcf86cd799439012",
  "serialNumber": 2,
  "date": "2024-01-15"
}
```

### Example 4: Hospital Admin Views Serial Statistics

```bash
GET /api/hospitals/507f1f77bcf86cd799439011/doctors/507f1f77bcf86cd799439012/serial-stats?date=2024-01-15
Authorization: Bearer <hospital_admin_token>
```

### Example 5: Individual Doctor Sets Up Serial Settings

```bash
POST /api/doctor/serial-settings
Authorization: Bearer <doctor_token>

{
  "totalSerialsPerDay": 15,
  "serialTimeRange": {
    "startTime": "10:00",
    "endTime": "16:00"
  },
  "appointmentPrice": 2000,
  "availableDays": [0, 1, 2, 3, 4, 5, 6],
  "isActive": true
}
```

---

## Files Created/Modified

### New Files
- `src/models/SerialSettings.model.js` - Serial settings data model

### Modified Files
- `src/controllers/patient.controller.js` - Added serial booking functions:
  - `getAvailableSerials`
  - `bookSerial`
- `src/controllers/hospital.controller.js` - Added hospital admin functions:
  - `createOrUpdateSerialSettings`
  - `getSerialSettings`
  - `getSerialStats`
- `src/controllers/doctor.portal.controller.js` - Added doctor functions:
  - `createOrUpdateMySerialSettings`
  - `getMySerialSettings`
  - `getMySerialStats`
- `src/routes/patient.routes.js` - Added serial booking routes
- `src/routes/hospital.routes.js` - Added serial settings management routes
- `src/routes/doctor.portal.routes.js` - Added doctor serial settings routes

---

## Important Notes

1. **Even-Numbered Serials Only**: Only even-numbered serials (2, 4, 6, 8, ...) are available for online booking. Odd-numbered serials are reserved for offline/walk-in bookings.

2. **No Online Payment**: The system does not require online payment. Payment is handled at the time of appointment.

3. **Automatic Notifications**: Patient information is automatically sent to hospital admins (for hospital doctors) or doctors (for individual doctors) via notifications.

4. **Chamber Creation**: If a doctor doesn't have a chamber, one is automatically created when the first serial is booked.

5. **Date Validation**: Serials can only be booked on days specified in `availableDays` array.

6. **Time Calculation**: Serial times are calculated automatically based on total serials and time range.

7. **Appointment Status**: Booked serials create appointments with status `pending` and payment status `pending`.

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Only even-numbered serials can be booked online"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Hospital-based doctors cannot manage their own serial settings. Please contact your hospital admin."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Serial settings not found for this doctor"
}
```

---

**Feature Status:** ✅ Complete and Ready for Use

