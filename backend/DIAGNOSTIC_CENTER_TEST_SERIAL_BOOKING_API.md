# Diagnostic Center Test Serial Booking API

Complete API documentation for Diagnostic Center Test Serial Booking system. This allows users to book online serials for diagnostic tests at diagnostic centers, with only even-numbered serials available for online booking.

---

## Table of Contents

1. [Diagnostic Center Admin APIs](#diagnostic-center-admin-apis)
   - [Create/Update Test Serial Settings](#createupdate-test-serial-settings)
   - [Get Test Serial Settings](#get-test-serial-settings)
   - [Get Test Serial Statistics](#get-test-serial-statistics)
   - [Get All Test Serial Bookings](#get-all-test-serial-bookings)

2. [Patient APIs](#patient-apis)
   - [Get Available Test Serials](#get-available-test-serials)
   - [Book Test Serial](#book-test-serial)

---

## 🔐 Authentication

**Required**: All endpoints require authentication
- **Diagnostic Center Admin**: Must be authenticated with `diagnostic_center_admin` or `super_admin` role
- **Patient**: Must be authenticated with `patient` role

---

# Diagnostic Center Admin APIs

## Create/Update Test Serial Settings

### Endpoint
**POST** `/api/diagnostic-centers/:centerId/tests/:testId/serial-settings`

**Description**: Create or update serial settings for a diagnostic center test

**Authentication**: Required (Diagnostic Center Admin or Super Admin)

---

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `centerId` | String | Diagnostic center ID |
| `testId` | String | Test ID |

---

### Request Body

```json
{
  "totalSerialsPerDay": 20,
  "serialTimeRange": {
    "startTime": "09:00",
    "endTime": "17:00"
  },
  "testPrice": 500,
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
| `testPrice` | Number | Yes | Price for the test (min: 0) | `500` |
| `availableDays` | Array | No | Days when serials are available (0=Sunday, 6=Saturday) | `[0, 1, 2, 3, 4, 5, 6]` |
| `isActive` | Boolean | No | Whether serials are enabled (default: true) | `true` |

---

### Validation Rules

1. `totalSerialsPerDay` must be a positive integer (min: 1)
2. `startTime` and `endTime` must be in HH:mm format (24-hour)
3. `endTime` must be after `startTime`
4. `testPrice` must be a positive number (min: 0)
5. `availableDays` array can contain numbers 0-6 (0=Sunday, 6=Saturday)
6. Test must belong to the specified diagnostic center
7. Diagnostic center must be approved

---

### Example Request

```bash
POST http://localhost:5000/api/diagnostic-centers/507f1f77bcf86cd799439011/tests/507f1f77bcf86cd799439012/serial-settings
Authorization: Bearer <diagnostic_center_admin_token>
Content-Type: application/json

{
  "totalSerialsPerDay": 20,
  "serialTimeRange": {
    "startTime": "09:00",
    "endTime": "17:00"
  },
  "testPrice": 500,
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
  "message": "Test serial settings saved successfully",
  "data": {
    "serialSettings": {
      "_id": "507f1f77bcf86cd799439013",
      "diagnosticCenterId": "507f1f77bcf86cd799439011",
      "testId": "507f1f77bcf86cd799439012",
      "totalSerialsPerDay": 20,
      "serialTimeRange": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "testPrice": 500,
      "isActive": true,
      "availableDays": [0, 1, 2, 3, 4, 5, 6],
      "createdAt": "2024-01-16T10:00:00.000Z",
      "updatedAt": "2024-01-16T10:00:00.000Z"
    }
  }
}
```

---

### Error Responses

#### 400 Bad Request - Validation Failed
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Total serials per day must be a positive integer",
      "param": "totalSerialsPerDay",
      "location": "body"
    }
  ]
}
```

#### 400 Bad Request - End Time Before Start Time
```json
{
  "success": false,
  "message": "End time must be after start time"
}
```

#### 404 Not Found - Diagnostic Center Not Found
```json
{
  "success": false,
  "message": "Diagnostic center not found"
}
```

#### 403 Forbidden - Diagnostic Center Not Approved
```json
{
  "success": false,
  "message": "Diagnostic center must be approved to manage test serial settings"
}
```

#### 404 Not Found - Test Not Found
```json
{
  "success": false,
  "message": "Test not found"
}
```

#### 400 Bad Request - Test Doesn't Belong to Center
```json
{
  "success": false,
  "message": "Test does not belong to this diagnostic center"
}
```

---

## Get Test Serial Settings

### Endpoint
**GET** `/api/diagnostic-centers/:centerId/tests/:testId/serial-settings`

**Description**: Get serial settings for a specific test

**Authentication**: Required (Diagnostic Center Admin or Super Admin)

---

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `centerId` | String | Diagnostic center ID |
| `testId` | String | Test ID |

---

### Example Request

```bash
GET http://localhost:5000/api/diagnostic-centers/507f1f77bcf86cd799439011/tests/507f1f77bcf86cd799439012/serial-settings
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
      "testId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Blood Test - Complete",
        "code": "BT-CMP",
        "category": "pathology",
        "price": 500
      },
      "totalSerialsPerDay": 20,
      "serialTimeRange": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "testPrice": 500,
      "isActive": true,
      "availableDays": [0, 1, 2, 3, 4, 5, 6],
      "createdAt": "2024-01-16T10:00:00.000Z",
      "updatedAt": "2024-01-16T10:00:00.000Z"
    }
  }
}
```

---

### Error Responses

#### 404 Not Found
```json
{
  "success": false,
  "message": "Test serial settings not found"
}
```

---

## Get Test Serial Statistics

### Endpoint
**GET** `/api/diagnostic-centers/:centerId/tests/:testId/serial-stats?date=YYYY-MM-DD`

**Description**: Get statistics for test serial bookings (bookings, available serials, patient details)

**Authentication**: Required (Diagnostic Center Admin or Super Admin)

---

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `centerId` | String | Diagnostic center ID |
| `testId` | String | Test ID |

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `date` | String | No | Date to get stats for (YYYY-MM-DD). If not provided, returns today's stats | `"2024-01-20"` |

---

### Example Request

```bash
GET http://localhost:5000/api/diagnostic-centers/507f1f77bcf86cd799439011/tests/507f1f77bcf86cd799439012/serial-stats?date=2024-01-20
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
      "testPrice": 500,
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
      "bookings": [
        {
          "bookingNumber": "TSB-1705123456-ABC123",
          "serialNumber": 2,
          "patient": {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+1234567890"
          },
          "time": "09:15",
          "status": "pending"
        },
        {
          "bookingNumber": "TSB-1705123457-DEF456",
          "serialNumber": 4,
          "patient": {
            "name": "Jane Smith",
            "email": "jane@example.com",
            "phone": "+1987654321"
          },
          "time": "09:45",
          "status": "confirmed"
        }
      ]
    }
  }
}
```

---

### Response Fields

| Field | Description |
|-------|-------------|
| `serialSettings.totalSerialsPerDay` | Total serials configured per day |
| `serialSettings.evenNumberedSerialsAvailable` | Number of even-numbered serials (available for online booking) |
| `serialSettings.testPrice` | Price for the test |
| `serialSettings.timeRange` | Time range for serials |
| `statistics.date` | Date for which statistics are shown |
| `statistics.totalBooked` | Total number of bookings |
| `statistics.bookedEvenSerials` | Number of even-numbered serials booked |
| `statistics.availableEvenSerials` | Number of even-numbered serials still available |
| `statistics.bookings` | Array of booking details with patient information |

---

## Get All Test Serial Bookings

### Endpoint
**GET** `/api/diagnostic-centers/:centerId/test-serial-bookings`

**Description**: Get all test serial bookings for a diagnostic center with filtering and pagination

**Authentication**: Required (Diagnostic Center Admin or Super Admin)

---

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `centerId` | String | Diagnostic center ID |

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `status` | String | No | Filter by booking status (`pending`, `confirmed`, `completed`, `cancelled`) | `"pending"` |
| `date` | String | No | Filter by appointment date (YYYY-MM-DD) | `"2024-01-20"` |
| `testId` | String | No | Filter by test ID | `"507f1f77bcf86cd799439012"` |
| `page` | Number | No | Page number (default: 1) | `1` |
| `limit` | Number | No | Items per page (default: 20) | `20` |

---

### Example Request

```bash
GET http://localhost:5000/api/diagnostic-centers/507f1f77bcf86cd799439011/test-serial-bookings?status=pending&date=2024-01-20&page=1&limit=20
Authorization: Bearer <diagnostic_center_admin_token>
```

---

### Success Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "bookingNumber": "TSB-1705123456-ABC123",
        "patientId": {
          "_id": "507f1f77bcf86cd799439015",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        },
        "testId": {
          "_id": "507f1f77bcf86cd799439012",
          "name": "Blood Test - Complete",
          "code": "BT-CMP",
          "category": "pathology"
        },
        "serialNumber": 2,
        "appointmentDate": "2024-01-20T00:00:00.000Z",
        "timeSlot": {
          "startTime": "09:15",
          "endTime": "09:30"
        },
        "testPrice": 500,
        "testName": "Blood Test - Complete",
        "patientName": "John Doe",
        "patientEmail": "john@example.com",
        "patientPhone": "+1234567890",
        "status": "pending",
        "createdAt": "2024-01-16T10:00:00.000Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 20,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

---

# Patient APIs

## Get Available Test Serials

### Endpoint
**GET** `/api/patient/diagnostic-centers/:diagnosticCenterId/tests/:testId/serials?date=YYYY-MM-DD`

**Description**: Get available test serials for a specific test on a specific date

**Authentication**: Required (Patient)

---

### URL Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `diagnosticCenterId` | String | Diagnostic center ID |
| `testId` | String | Test ID |

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `date` | String | Yes | Date to check availability (YYYY-MM-DD) | `"2024-01-20"` |

---

### Example Request

```bash
GET http://localhost:5000/api/patient/diagnostic-centers/507f1f77bcf86cd799439011/tests/507f1f77bcf86cd799439012/serials?date=2024-01-20
Authorization: Bearer <patient_token>
```

---

### Success Response

**Status Code**: `200 OK`

```json
{
  "success": true,
  "data": {
    "test": {
      "id": "507f1f77bcf86cd799439012",
      "name": "Blood Test - Complete",
      "code": "BT-CMP",
      "category": "pathology",
      "description": "Complete blood count test",
      "preparation": "Fasting required for 12 hours"
    },
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
      },
      {
        "serialNumber": 6,
        "time": "10:15",
        "endTime": "10:30",
        "available": true
      }
    ],
    "totalSerials": 20,
    "testPrice": 500,
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
| `test` | Test details (name, code, category, description, preparation) |
| `diagnosticCenter` | Diagnostic center details (id, name) |
| `date` | Date for which serials are shown |
| `availableSerials` | Array of available even-numbered serials with time slots |
| `availableSerials[].serialNumber` | Serial number (even numbers only) |
| `availableSerials[].time` | Start time for this serial |
| `availableSerials[].endTime` | End time for this serial |
| `totalSerials` | Total serials configured per day |
| `testPrice` | Price for the test |
| `timeRange` | Overall time range for serials |
| `bookedCount` | Number of serials already booked |
| `availableCount` | Number of even-numbered serials still available |

---

### Error Responses

#### 400 Bad Request - Date Required
```json
{
  "success": false,
  "message": "Date is required (format: YYYY-MM-DD)"
}
```

#### 404 Not Found - Diagnostic Center Not Approved
```json
{
  "success": false,
  "message": "Diagnostic center not found or not approved"
}
```

#### 404 Not Found - Test Not Available
```json
{
  "success": false,
  "message": "Test not found or not available"
}
```

#### 400 Bad Request - Test Doesn't Belong to Center
```json
{
  "success": false,
  "message": "Test does not belong to this diagnostic center"
}
```

#### 404 Not Found - Serial Settings Not Found
```json
{
  "success": false,
  "message": "Test serial settings not found for this test"
}
```

#### 200 OK - No Serials Available (Special Case)
```json
{
  "success": true,
  "data": {
    "test": { ... },
    "diagnosticCenter": { ... },
    "date": "2024-01-20",
    "availableSerials": [],
    "totalSerials": 20,
    "message": "No serials available on this day"
  }
}
```

---

## Book Test Serial

### Endpoint
**POST** `/api/patient/test-serials/book`

**Description**: Book a test serial (only even-numbered serials can be booked)

**Authentication**: Required (Patient)

---

### Request Body

```json
{
  "testId": "507f1f77bcf86cd799439012",
  "diagnosticCenterId": "507f1f77bcf86cd799439011",
  "serialNumber": 2,
  "date": "2024-01-20"
}
```

### Request Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `testId` | String | Yes | Test ID | `"507f1f77bcf86cd799439012"` |
| `diagnosticCenterId` | String | Yes | Diagnostic center ID | `"507f1f77bcf86cd799439011"` |
| `serialNumber` | Number | Yes | Serial number to book (must be even) | `2` |
| `date` | String | Yes | Appointment date (YYYY-MM-DD) | `"2024-01-20"` |

---

### Validation Rules

1. `serialNumber` must be an even number (2, 4, 6, 8, ...)
2. `date` must be in YYYY-MM-DD format
3. Serial must be available (not already booked)
4. Serial must be available on the selected day (based on `availableDays` settings)
5. Test must belong to the specified diagnostic center
6. Diagnostic center must be approved

---

### Example Request

```bash
POST http://localhost:5000/api/patient/test-serials/book
Authorization: Bearer <patient_token>
Content-Type: application/json

{
  "testId": "507f1f77bcf86cd799439012",
  "diagnosticCenterId": "507f1f77bcf86cd799439011",
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
  "message": "Test serial booked successfully",
  "data": {
    "booking": {
      "_id": "507f1f77bcf86cd799439014",
      "bookingNumber": "TSB-1705123456-ABC123",
      "patientId": "507f1f77bcf86cd799439015",
      "diagnosticCenterId": "507f1f77bcf86cd799439011",
      "testId": "507f1f77bcf86cd799439012",
      "serialNumber": 2,
      "appointmentDate": "2024-01-20T00:00:00.000Z",
      "timeSlot": {
        "startTime": "09:15",
        "endTime": "09:30"
      },
      "testPrice": 500,
      "testName": "Blood Test - Complete",
      "patientName": "John Doe",
      "patientEmail": "john@example.com",
      "patientPhone": "+1234567890",
      "status": "pending",
      "test": {
        "id": "507f1f77bcf86cd799439012",
        "name": "Blood Test - Complete",
        "code": "BT-CMP",
        "category": "pathology"
      },
      "diagnosticCenter": {
        "id": "507f1f77bcf86cd799439011",
        "name": "City Diagnostic Center"
      },
      "createdAt": "2024-01-16T10:00:00.000Z"
    }
  }
}
```

---

### Error Responses

#### 400 Bad Request - Validation Failed
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Test ID is required",
      "param": "testId",
      "location": "body"
    }
  ]
}
```

#### 400 Bad Request - Odd Serial Number
```json
{
  "success": false,
  "message": "Only even-numbered serials can be booked online"
}
```

#### 404 Not Found - Diagnostic Center Not Approved
```json
{
  "success": false,
  "message": "Diagnostic center not found or not approved"
}
```

#### 404 Not Found - Test Not Available
```json
{
  "success": false,
  "message": "Test not found or not available"
}
```

#### 400 Bad Request - Test Doesn't Belong to Center
```json
{
  "success": false,
  "message": "Test does not belong to this diagnostic center"
}
```

#### 404 Not Found - Serial Settings Not Found
```json
{
  "success": false,
  "message": "Test serial settings not found for this test"
}
```

#### 400 Bad Request - Serials Not Available on This Day
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

### Booking Number Format

Each booking gets a unique booking number:
- Format: `TSB-{timestamp}-{random}`
- Example: `TSB-1705123456-ABC123`
- Used for tracking and reference

### Time Slot Calculation

Time slots are automatically calculated based on:
- Total serials per day
- Start time and end time
- Serial number

Example: If total serials = 20, start = 09:00, end = 17:00:
- Total duration: 8 hours (480 minutes)
- Slot duration: 480 / 20 = 24 minutes per slot
- Serial #2: 09:00 + (2-1) * 24 = 09:24 (rounded to 09:15 for display)

### Notifications

When a test serial is booked:
1. **Patient receives notification**: "Test Serial Booked" with booking details
2. **Diagnostic center admins receive notification**: "New Test Serial Booking" with patient information

### Status Values

- **`pending`**: Booking created, awaiting confirmation
- **`confirmed`**: Booking confirmed by diagnostic center
- **`completed`**: Test has been completed
- **`cancelled`**: Booking was cancelled

### No Online Payment

- Test serial booking does **not** require online payment
- Payment is handled at the diagnostic center when the test is performed

---

## Complete Example Flow

### Step 1: Admin Sets Up Serial Settings

```bash
POST /api/diagnostic-centers/:centerId/tests/:testId/serial-settings
{
  "totalSerialsPerDay": 20,
  "serialTimeRange": {
    "startTime": "09:00",
    "endTime": "17:00"
  },
  "testPrice": 500,
  "availableDays": [0, 1, 2, 3, 4, 5, 6],
  "isActive": true
}
```

### Step 2: Patient Views Available Serials

```bash
GET /api/patient/diagnostic-centers/:centerId/tests/:testId/serials?date=2024-01-20
```

Response shows available even-numbered serials with time slots.

### Step 3: Patient Books a Serial

```bash
POST /api/patient/test-serials/book
{
  "testId": "...",
  "diagnosticCenterId": "...",
  "serialNumber": 2,
  "date": "2024-01-20"
}
```

### Step 4: Admin Views Bookings

```bash
GET /api/diagnostic-centers/:centerId/test-serial-bookings?date=2024-01-20
```

### Step 5: Admin Views Statistics

```bash
GET /api/diagnostic-centers/:centerId/tests/:testId/serial-stats?date=2024-01-20
```

---

## cURL Examples

### Admin: Create Serial Settings
```bash
curl -X POST http://localhost:5000/api/diagnostic-centers/507f1f77bcf86cd799439011/tests/507f1f77bcf86cd799439012/serial-settings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "totalSerialsPerDay": 20,
    "serialTimeRange": {
      "startTime": "09:00",
      "endTime": "17:00"
    },
    "testPrice": 500,
    "availableDays": [0, 1, 2, 3, 4, 5, 6],
    "isActive": true
  }'
```

### Patient: Get Available Serials
```bash
curl -X GET "http://localhost:5000/api/patient/diagnostic-centers/507f1f77bcf86cd799439011/tests/507f1f77bcf86cd799439012/serials?date=2024-01-20" \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN"
```

### Patient: Book Test Serial
```bash
curl -X POST http://localhost:5000/api/patient/test-serials/book \
  -H "Authorization: Bearer YOUR_PATIENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "testId": "507f1f77bcf86cd799439012",
    "diagnosticCenterId": "507f1f77bcf86cd799439011",
    "serialNumber": 2,
    "date": "2024-01-20"
  }'
```

### Admin: Get Statistics
```bash
curl -X GET "http://localhost:5000/api/diagnostic-centers/507f1f77bcf86cd799439011/tests/507f1f77bcf86cd799439012/serial-stats?date=2024-01-20" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

**Ready to use Diagnostic Center Test Serial Booking system!** ✅

