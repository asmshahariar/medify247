# Hospital Test Management System - Complete API Documentation

This document provides comprehensive API documentation for the Hospital Test Management System, allowing hospital admins to manage tests and test serials, and patients to book test serials.

---

## Table of Contents

1. [Hospital Admin - Test Management](#hospital-admin---test-management)
2. [Hospital Admin - Test Serial Settings](#hospital-admin---test-serial-settings)
3. [Hospital Admin - Test Serial Bookings](#hospital-admin---test-serial-bookings)
4. [Patient - Test Serial Booking](#patient---test-serial-booking)
5. [Error Responses](#error-responses)

---

## Hospital Admin - Test Management

### 1. Add Test

**Endpoint:** `POST /api/hospitals/:hospitalId/tests`

**Description:** Add a new medical test to the hospital.

**Authentication:** Required (Hospital Admin)

**Request Parameters:**
- `hospitalId` (URL parameter) - Hospital ID

**Request Body:**
```json
{
  "name": "Blood Test - Complete Blood Count",
  "code": "CBC-001",
  "category": "pathology",
  "description": "Complete blood count test including RBC, WBC, platelets",
  "price": 500,
  "duration": 24,
  "preparation": "Fasting required for 8 hours",
  "isPackage": false,
  "packageTests": []
}
```

**Request Body Fields:**
- `name` (required, string) - Test name
- `code` (optional, string) - Unique test code
- `category` (optional, enum) - Test category: `pathology`, `radiology`, `cardiology`, `other`
- `description` (optional, string) - Test description
- `price` (required, number) - Test price
- `duration` (optional, number) - Reporting time in hours (default: 24)
- `preparation` (optional, string) - Preparation instructions
- `isPackage` (optional, boolean) - Whether it's a test package
- `packageTests` (optional, array) - Array of test IDs if it's a package

**Success Response (201):**
```json
{
  "success": true,
  "message": "Test added successfully",
  "data": {
    "test": {
      "_id": "test_id",
      "name": "Blood Test - Complete Blood Count",
      "code": "CBC-001",
      "category": "pathology",
      "description": "Complete blood count test...",
      "price": 500,
      "duration": 24,
      "preparation": "Fasting required for 8 hours",
      "hospitalId": "hospital_id",
      "isActive": true,
      "isPackage": false,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

---

### 2. Get All Tests

**Endpoint:** `GET /api/hospitals/:hospitalId/tests`

**Description:** Get all tests for the hospital with optional search and filtering.

**Authentication:** Required (Hospital Admin)

**Query Parameters:**
- `isActive` (optional, boolean) - Filter by active status
- `category` (optional, string) - Filter by category
- `search` (optional, string) - Search by test name or code
- `page` (optional, number) - Page number (default: 1)
- `limit` (optional, number) - Items per page (default: 50)

**Example Request:**
```
GET /api/hospitals/123/tests?search=blood&category=pathology&page=1&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "tests": [
      {
        "_id": "test_id",
        "name": "Blood Test - Complete Blood Count",
        "code": "CBC-001",
        "category": "pathology",
        "price": 500,
        "isActive": true,
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 20,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "pages": 2
    }
  }
}
```

---

### 3. Update Test

**Endpoint:** `PUT /api/hospitals/:hospitalId/tests/:testId`

**Description:** Update an existing test.

**Authentication:** Required (Hospital Admin)

**Request Parameters:**
- `hospitalId` (URL parameter) - Hospital ID
- `testId` (URL parameter) - Test ID

**Request Body:**
```json
{
  "name": "Updated Test Name",
  "price": 600,
  "isActive": true
}
```

**Request Body Fields:** (All optional)
- `name` (optional, string) - Test name
- `code` (optional, string) - Test code
- `category` (optional, enum) - Test category
- `description` (optional, string) - Test description
- `price` (optional, number) - Test price
- `duration` (optional, number) - Reporting time
- `preparation` (optional, string) - Preparation instructions
- `isActive` (optional, boolean) - Active status
- `isPackage` (optional, boolean) - Package status
- `packageTests` (optional, array) - Package tests

**Success Response (200):**
```json
{
  "success": true,
  "message": "Test updated successfully",
  "data": {
    "test": {
      "_id": "test_id",
      "name": "Updated Test Name",
      "price": 600,
      "isActive": true
    }
  }
}
```

---

### 4. Delete Test

**Endpoint:** `DELETE /api/hospitals/:hospitalId/tests/:testId`

**Description:** Delete a test from the hospital.

**Authentication:** Required (Hospital Admin)

**Request Parameters:**
- `hospitalId` (URL parameter) - Hospital ID
- `testId` (URL parameter) - Test ID

**Success Response (200):**
```json
{
  "success": true,
  "message": "Test deleted successfully"
}
```

---

## Hospital Admin - Test Serial Settings

### 5. Create or Update Test Serial Settings

**Endpoint:** `POST /api/hospitals/:hospitalId/tests/:testId/serial-settings`

**Description:** Create or update serial settings for a test. This determines how many serials are available, time range, price, and available days.

**Authentication:** Required (Hospital Admin)

**Request Parameters:**
- `hospitalId` (URL parameter) - Hospital ID
- `testId` (URL parameter) - Test ID

**Request Body:**
```json
{
  "totalSerialsPerDay": 20,
  "serialTimeRange": {
    "startTime": "09:00",
    "endTime": "17:00"
  },
  "testPrice": 500,
  "availableDays": [0, 1, 2, 3, 4, 5],
  "isActive": true
}
```

**Request Body Fields:**
- `totalSerialsPerDay` (required, number) - Total serials available per day
- `serialTimeRange.startTime` (required, string) - Start time in HH:mm format
- `serialTimeRange.endTime` (required, string) - End time in HH:mm format
- `testPrice` (required, number) - Price for the test serial
- `availableDays` (optional, array) - Days when serials are available (0=Sunday, 6=Saturday)
- `isActive` (optional, boolean) - Whether serials are active (default: true)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Test serial settings saved successfully",
  "data": {
    "serialSettings": {
      "_id": "settings_id",
      "hospitalId": "hospital_id",
      "testId": "test_id",
      "totalSerialsPerDay": 20,
      "serialTimeRange": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "testPrice": 500,
      "availableDays": [0, 1, 2, 3, 4, 5],
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

---

### 6. Get Test Serial Settings

**Endpoint:** `GET /api/hospitals/:hospitalId/tests/:testId/serial-settings`

**Description:** Get serial settings for a specific test.

**Authentication:** Required (Hospital Admin)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "serialSettings": {
      "_id": "settings_id",
      "testId": {
        "_id": "test_id",
        "name": "Blood Test - Complete Blood Count",
        "code": "CBC-001",
        "category": "pathology",
        "price": 500
      },
      "hospitalId": {
        "_id": "hospital_id",
        "name": "City Hospital"
      },
      "totalSerialsPerDay": 20,
      "serialTimeRange": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "testPrice": 500,
      "availableDays": [0, 1, 2, 3, 4, 5],
      "isActive": true
    }
  }
}
```

---

### 7. Get Test Serial Statistics

**Endpoint:** `GET /api/hospitals/:hospitalId/tests/:testId/serial-stats`

**Description:** Get statistics about test serial bookings for a specific date or today.

**Authentication:** Required (Hospital Admin)

**Query Parameters:**
- `date` (optional, string) - Date in YYYY-MM-DD format (default: today)

**Example Request:**
```
GET /api/hospitals/123/tests/456/serial-stats?date=2024-01-20
```

**Success Response (200):**
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
          "bookingNumber": "TSB-1234567890-ABC123",
          "serialNumber": 2,
          "patient": {
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+1234567890"
          },
          "time": "09:30",
          "status": "pending"
        }
      ]
    }
  }
}
```

---

## Hospital Admin - Test Serial Bookings

### 8. Get All Test Serial Bookings

**Endpoint:** `GET /api/hospitals/:hospitalId/test-serial-bookings`

**Description:** Get all test serial bookings with filtering and sorting options.

**Authentication:** Required (Hospital Admin)

**Query Parameters:**
- `status` (optional, string) - Filter by status: `pending`, `confirmed`, `completed`, `cancelled`
- `date` (optional, string) - Filter by date (YYYY-MM-DD)
- `testId` (optional, string) - Filter by test ID
- `testName` (optional, string) - Filter by test name (partial match)
- `page` (optional, number) - Page number (default: 1)
- `limit` (optional, number) - Items per page (default: 20)
- `sortBy` (optional, string) - Sort field: `date`, `appointmentDate`, `serialNumber` (default: `appointmentDate`)
- `sortOrder` (optional, string) - Sort order: `asc`, `desc` (default: `desc`)

**Example Requests:**
```
GET /api/hospitals/123/test-serial-bookings?date=2024-01-20&testName=blood&sortBy=date&sortOrder=asc
GET /api/hospitals/123/test-serial-bookings?status=pending&page=1&limit=10
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "_id": "booking_id",
        "bookingNumber": "TSB-1234567890-ABC123",
        "serialNumber": 2,
        "appointmentDate": "2024-01-20T00:00:00.000Z",
        "timeSlot": {
          "startTime": "09:30",
          "endTime": "09:54"
        },
        "testPrice": 500,
        "testName": "Blood Test - Complete Blood Count",
        "patientName": "John Doe",
        "patientEmail": "john@example.com",
        "patientPhone": "+1234567890",
        "status": "pending",
        "testId": {
          "_id": "test_id",
          "name": "Blood Test - Complete Blood Count",
          "code": "CBC-001",
          "category": "pathology"
        },
        "patientId": {
          "_id": "patient_id",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        },
        "createdAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "total": 15,
    "page": 1,
    "limit": 20,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

---

## Patient - Test Serial Booking

### 9. Get Available Test Serials (Hospital)

**Endpoint:** `GET /api/patient/hospitals/:hospitalId/tests/:testId/serials`

**Description:** Get available test serials for a specific date at a hospital.

**Authentication:** Required (Patient)

**Request Parameters:**
- `hospitalId` (URL parameter) - Hospital ID
- `testId` (URL parameter) - Test ID

**Query Parameters:**
- `date` (required, string) - Date in YYYY-MM-DD format

**Example Request:**
```
GET /api/patient/hospitals/123/tests/456/serials?date=2024-01-20
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "test": {
      "id": "test_id",
      "name": "Blood Test - Complete Blood Count",
      "code": "CBC-001",
      "category": "pathology",
      "description": "Complete blood count test...",
      "preparation": "Fasting required for 8 hours"
    },
    "hospital": {
      "id": "hospital_id",
      "name": "City Hospital"
    },
    "date": "2024-01-20",
    "availableSerials": [
      {
        "serialNumber": 2,
        "time": "09:30",
        "endTime": "09:54",
        "available": true
      },
      {
        "serialNumber": 4,
        "time": "10:18",
        "endTime": "10:42",
        "available": true
      }
    ],
    "totalSerials": 20,
    "testPrice": 500,
    "timeRange": {
      "startTime": "09:00",
      "endTime": "17:00"
    },
    "bookedCount": 3,
    "availableCount": 7
  }
}
```

**Note:** Only even-numbered serials (2, 4, 6, 8, ...) are available for online booking.

---

### 10. Book Test Serial (Hospital)

**Endpoint:** `POST /api/patient/test-serials/book`

**Description:** Book a test serial at a hospital.

**Authentication:** Required (Patient)

**Request Body:**
```json
{
  "testId": "test_id",
  "hospitalId": "hospital_id",
  "serialNumber": 2,
  "date": "2024-01-20"
}
```

**Request Body Fields:**
- `testId` (required, string) - Test ID
- `hospitalId` (required, string) - Hospital ID (required if diagnosticCenterId is not provided)
- `diagnosticCenterId` (optional, string) - Diagnostic Center ID (required if hospitalId is not provided)
- `serialNumber` (required, number) - Serial number (must be even)
- `date` (required, string) - Date in YYYY-MM-DD format

**Success Response (201):**
```json
{
  "success": true,
  "message": "Test serial booked successfully",
  "data": {
    "booking": {
      "_id": "booking_id",
      "bookingNumber": "TSB-1234567890-ABC123",
      "serialNumber": 2,
      "appointmentDate": "2024-01-20T00:00:00.000Z",
      "timeSlot": {
        "startTime": "09:30",
        "endTime": "09:54"
      },
      "testPrice": 500,
      "testName": "Blood Test - Complete Blood Count",
      "status": "pending",
      "test": {
        "id": "test_id",
        "name": "Blood Test - Complete Blood Count",
        "code": "CBC-001",
        "category": "pathology"
      },
      "hospital": {
        "id": "hospital_id",
        "name": "City Hospital"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

**Note:** 
- Only even-numbered serials can be booked online
- Patient information is automatically sent to hospital admins
- No online payment is required

---

## Error Responses

### Common Error Responses

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "serialNumber",
      "message": "Only even-numbered serials can be booked online"
    }
  ]
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Test not found or not available"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Hospital must be approved to add tests"
}
```

**409 Conflict:**
```json
{
  "success": false,
  "message": "This serial is already booked"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to add test",
  "error": "Error details"
}
```

---

## Key Features

### Hospital Admin Features:
1. ✅ Add medical tests with full details
2. ✅ Set test prices
3. ✅ Search tests by name
4. ✅ Create and manage test serial settings
5. ✅ View how many users have taken serials for each test
6. ✅ See how many users have taken test serials on a specific date
7. ✅ Sort and filter test serials by date
8. ✅ Filter test serials by test name

### Patient Features:
1. ✅ View available test serials at hospitals
2. ✅ Book test serials (even-numbered only)
3. ✅ View test details and price before booking
4. ✅ Receive booking confirmation

### System Features:
- Only even-numbered serials available for online booking
- Automatic time slot calculation
- Real-time availability checking
- Notification system for admins and patients
- Complete booking history tracking

---

## Notes

1. **Even-Numbered Serials:** Only even-numbered serials (2, 4, 6, 8, ...) are available for online booking. Odd-numbered serials are reserved for walk-in patients.

2. **Time Slot Calculation:** Time slots are automatically calculated based on the total serials per day and time range.

3. **Available Days:** If `availableDays` is specified, serials are only available on those days (0=Sunday, 6=Saturday).

4. **Test Price:** The price in serial settings can override the default test price.

5. **Notifications:** Hospital admins receive notifications when a patient books a test serial.

---

**Last Updated:** January 2024  
**API Version:** 1.0

