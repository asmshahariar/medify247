# Home Service Viewing and Request System

## Overview

This feature allows users to view all available home services on the platform, search by hospital, view service details, submit service requests, and view their complete history of serials and home service requests.

---

## Features

### 1. **View All Home Services**
- Users can view all active home services across all hospitals
- Filter by hospital to see services for a specific hospital
- Search by service type
- Pagination support

### 2. **View Service Details**
- Full details of each home service including:
  - Service name/type
  - Price
  - Available time range
  - Notes/description
  - Hospital information
  - Off days

### 3. **Submit Home Service Request**
Users can request a home service by providing:
- Patient name
- Age
- Gender
- Home address (street, city, state, zipCode, country, coordinates)
- Phone number
- Optional: Requested date and time
- Optional: Additional notes

### 4. **Hospital Admin Management**
- View all home service requests for their hospital
- Filter requests by status (pending, accepted, rejected, completed, cancelled)
- Accept or reject requests
- Provide rejection reason when rejecting

### 5. **User History**
Users can view their complete history including:
- All serials (appointments) taken
- All home service requests submitted
- Filter by type (serials, home_services, or all)
- See full details of each item including status, dates, fees, etc.

---

## API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Get All Home Services
**GET** `/api/shared/home-services`

**Query Parameters:**
- `hospitalId` (optional) - Filter by hospital
- `serviceType` (optional) - Search by service type (case-insensitive)
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Example:**
```bash
GET /api/shared/home-services?hospitalId=507f1f77bcf86cd799439011&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "homeServices": [
      {
        "_id": "...",
        "hospitalId": "...",
        "serviceType": "home_doctor_visit",
        "price": 1500,
        "note": "Doctor will visit patient's home for consultation",
        "availableTime": {
          "startTime": "09:00",
          "endTime": "17:00"
        },
        "offDays": [0, 6],
        "isActive": true,
        "hospital": {
          "id": "...",
          "name": "City General Hospital",
          "address": "123 Main St",
          "logo": "https://...",
          "contactInfo": {
            "phone": ["+1234567890"],
            "email": "info@hospital.com"
          }
        }
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

#### 2. Get Home Service Details
**GET** `/api/shared/home-services/:serviceId`

**Response:**
```json
{
  "success": true,
  "data": {
    "homeService": {
      "_id": "...",
      "hospitalId": "...",
      "serviceType": "home_doctor_visit",
      "price": 1500,
      "note": "Doctor will visit patient's home for consultation",
      "availableTime": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "offDays": [0, 6],
      "isActive": true,
      "hospital": {
        "id": "...",
        "name": "City General Hospital",
        "address": "123 Main St, City, State",
        "logo": "https://...",
        "contactInfo": {
          "phone": ["+1234567890"],
          "email": "info@hospital.com",
          "website": "https://hospital.com"
        },
        "departments": ["Cardiology", "General Medicine"]
      }
    }
  }
}
```

---

### Patient Endpoints (Authentication Required)

#### 3. Submit Home Service Request
**POST** `/api/patient/home-services/request`

**Request Body:**
```json
{
  "hospitalId": "507f1f77bcf86cd799439011",
  "homeServiceId": "507f1f77bcf86cd799439012",
  "patientName": "John Doe",
  "patientAge": 35,
  "patientGender": "male",
  "homeAddress": {
    "street": "123 Main Street",
    "city": "City",
    "state": "State",
    "zipCode": "12345",
    "country": "Country",
    "coordinates": {
      "latitude": 40.7128,
      "longitude": -74.0060
    }
  },
  "phoneNumber": "+1234567890",
  "requestedDate": "2024-01-20",
  "requestedTime": "14:00",
  "notes": "Patient has mobility issues"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Home service request submitted successfully",
  "data": {
    "request": {
      "_id": "...",
      "requestNumber": "HSR-1705123456-ABC123",
      "patientId": "...",
      "hospitalId": "...",
      "homeServiceId": "...",
      "patientName": "John Doe",
      "patientAge": 35,
      "patientGender": "male",
      "homeAddress": {
        "street": "123 Main Street",
        "city": "City",
        "state": "State",
        "zipCode": "12345",
        "country": "Country"
      },
      "phoneNumber": "+1234567890",
      "serviceType": "home_doctor_visit",
      "servicePrice": 1500,
      "status": "pending",
      "hospital": {
        "id": "...",
        "name": "City General Hospital"
      },
      "service": {
        "id": "...",
        "serviceType": "home_doctor_visit",
        "price": 1500
      },
      "createdAt": "..."
    }
  }
}
```

#### 4. Get My History
**GET** `/api/patient/history?type=all&page=1&limit=20`

**Query Parameters:**
- `type` (optional) - Filter by type: `serials`, `home_services`, or `all` (default: `all`)
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "type": "serial",
        "id": "...",
        "requestNumber": "SR-1705123456-ABC123",
        "serialNumber": "2",
        "doctor": {
          "id": "...",
          "name": "Dr. John Smith",
          "specialization": ["Cardiology"],
          "profilePhotoUrl": "https://..."
        },
        "hospital": {
          "id": "...",
          "name": "City General Hospital",
          "address": "123 Main St",
          "logo": "https://..."
        },
        "chamber": {
          "id": "...",
          "name": "Cardiology Chamber",
          "address": "Hospital Building, Floor 2"
        },
        "date": "2024-01-15T00:00:00.000Z",
        "time": "09:15",
        "endTime": "09:30",
        "fee": 1500,
        "status": "pending",
        "paymentStatus": "pending",
        "createdAt": "...",
        "updatedAt": "..."
      },
      {
        "type": "home_service",
        "id": "...",
        "requestNumber": "HSR-1705123456-ABC123",
        "hospital": {
          "id": "...",
          "name": "City General Hospital",
          "address": "123 Main St",
          "logo": "https://...",
          "contactInfo": {
            "phone": ["+1234567890"],
            "email": "info@hospital.com"
          }
        },
        "service": {
          "id": "...",
          "serviceType": "home_doctor_visit",
          "price": 1500,
          "note": "Doctor will visit patient's home",
          "availableTime": {
            "startTime": "09:00",
            "endTime": "17:00"
          }
        },
        "patientName": "John Doe",
        "patientAge": 35,
        "patientGender": "male",
        "homeAddress": {
          "street": "123 Main Street",
          "city": "City",
          "state": "State",
          "zipCode": "12345"
        },
        "phoneNumber": "+1234567890",
        "requestedDate": "2024-01-20T00:00:00.000Z",
        "requestedTime": "14:00",
        "status": "pending",
        "createdAt": "...",
        "updatedAt": "..."
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

### Hospital Admin Endpoints (Authentication Required)

#### 5. Get Home Service Requests
**GET** `/api/hospitals/:hospitalId/home-service-requests?status=pending&page=1&limit=20`

**Query Parameters:**
- `status` (optional) - Filter by status: `pending`, `accepted`, `rejected`, `completed`, `cancelled`
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "...",
        "requestNumber": "HSR-1705123456-ABC123",
        "patientId": {
          "_id": "...",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        },
        "homeServiceId": {
          "_id": "...",
          "serviceType": "home_doctor_visit",
          "price": 1500,
          "note": "Doctor will visit patient's home"
        },
        "patientName": "John Doe",
        "patientAge": 35,
        "patientGender": "male",
        "homeAddress": {
          "street": "123 Main Street",
          "city": "City",
          "state": "State",
          "zipCode": "12345"
        },
        "phoneNumber": "+1234567890",
        "serviceType": "home_doctor_visit",
        "servicePrice": 1500,
        "status": "pending",
        "requestedDate": "2024-01-20T00:00:00.000Z",
        "requestedTime": "14:00",
        "createdAt": "..."
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "pages": 1
    }
  }
}
```

#### 6. Get Single Home Service Request
**GET** `/api/hospitals/:hospitalId/home-service-requests/:requestId`

**Response:**
```json
{
  "success": true,
  "data": {
    "request": {
      "_id": "...",
      "requestNumber": "HSR-1705123456-ABC123",
      "patientId": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "homeServiceId": {
        "_id": "...",
        "serviceType": "home_doctor_visit",
        "price": 1500,
        "note": "Doctor will visit patient's home",
        "availableTime": {
          "startTime": "09:00",
          "endTime": "17:00"
        }
      },
      "patientName": "John Doe",
      "patientAge": 35,
      "patientGender": "male",
      "homeAddress": {
        "street": "123 Main Street",
        "city": "City",
        "state": "State",
        "zipCode": "12345",
        "country": "Country",
        "coordinates": {
          "latitude": 40.7128,
          "longitude": -74.0060
        }
      },
      "phoneNumber": "+1234567890",
      "status": "pending",
      "requestedDate": "2024-01-20T00:00:00.000Z",
      "requestedTime": "14:00",
      "notes": "Patient has mobility issues",
      "createdAt": "..."
    }
  }
}
```

#### 7. Accept Home Service Request
**PUT** `/api/hospitals/:hospitalId/home-service-requests/:requestId/accept`

**Request Body (optional):**
```json
{
  "notes": "Service will be provided on requested date"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Home service request accepted successfully",
  "data": {
    "request": {
      "_id": "...",
      "status": "accepted",
      "acceptedAt": "2024-01-16T10:00:00.000Z",
      "acceptedBy": "...",
      "notes": "Service will be provided on requested date"
    }
  }
}
```

#### 8. Reject Home Service Request
**PUT** `/api/hospitals/:hospitalId/home-service-requests/:requestId/reject`

**Request Body:**
```json
{
  "rejectionReason": "Service not available on requested date. Please choose another date."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Home service request rejected successfully",
  "data": {
    "request": {
      "_id": "...",
      "status": "rejected",
      "rejectedAt": "2024-01-16T10:00:00.000Z",
      "rejectedBy": "...",
      "rejectionReason": "Service not available on requested date. Please choose another date."
    }
  }
}
```

---

## Data Models

### HomeServiceRequest Schema

```javascript
{
  patientId: ObjectId,          // User who submitted request
  hospitalId: ObjectId,          // Hospital providing service
  homeServiceId: ObjectId,       // Home service requested
  requestNumber: String,         // Unique request number
  patientName: String,           // Patient name
  patientAge: Number,            // Patient age
  patientGender: String,         // male, female, other
  homeAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  phoneNumber: String,           // Contact phone
  serviceType: String,           // Snapshot of service type
  servicePrice: Number,          // Snapshot of service price
  serviceNote: String,           // Snapshot of service note
  status: String,                // pending, accepted, rejected, completed, cancelled
  requestedDate: Date,          // Optional requested date
  requestedTime: String,         // Optional requested time (HH:mm)
  notes: String,                 // Additional notes
  acceptedAt: Date,              // When accepted
  acceptedBy: ObjectId,          // Who accepted
  rejectedAt: Date,              // When rejected
  rejectedBy: ObjectId,          // Who rejected
  rejectionReason: String,       // Reason for rejection
  completedAt: Date,             // When completed
  createdAt: Date,
  updatedAt: Date
}
```

---

## Request Status Flow

```
pending → accepted → completed
       ↘ rejected
       ↘ cancelled
```

### Status Values
- `pending` - Request submitted, awaiting hospital admin action
- `accepted` - Hospital admin accepted the request
- `rejected` - Hospital admin rejected the request (with reason)
- `completed` - Service has been completed
- `cancelled` - Request was cancelled

---

## Notification System

### When Request is Submitted
1. **Patient Notification:**
   - Type: `order_created`
   - Title: "Home Service Request Submitted"
   - Message: Includes service type and request number

2. **Hospital Admin Notification:**
   - Type: `order_created`
   - Title: "New Home Service Request"
   - Message: Includes patient name, phone, and service type
   - Sent to all hospital admins

### When Request is Accepted
- **Patient Notification:**
  - Type: `order_status_update`
  - Title: "Home Service Request Accepted"
  - Message: Includes request number and hospital name

### When Request is Rejected
- **Patient Notification:**
  - Type: `order_status_update`
  - Title: "Home Service Request Rejected"
  - Message: Includes request number and rejection reason

---

## Security & Access Control

### Public Access
- Viewing home services (list and details) is public
- No authentication required for viewing

### Patient Access
- Submitting home service requests requires patient authentication
- Viewing history requires patient authentication
- Patients can only view their own history

### Hospital Admin Access
- Managing requests requires hospital admin authentication
- Hospital admins can only manage requests for their own hospital
- `checkHospitalOwnership` middleware ensures proper access control

---

## Example Usage

### Example 1: View All Home Services
```bash
GET /api/shared/home-services
```

### Example 2: View Services for Specific Hospital
```bash
GET /api/shared/home-services?hospitalId=507f1f77bcf86cd799439011
```

### Example 3: Search Services by Type
```bash
GET /api/shared/home-services?serviceType=doctor
```

### Example 4: View Service Details
```bash
GET /api/shared/home-services/507f1f77bcf86cd799439012
```

### Example 5: Submit Home Service Request
```bash
POST /api/patient/home-services/request
Authorization: Bearer <patient_token>

{
  "hospitalId": "507f1f77bcf86cd799439011",
  "homeServiceId": "507f1f77bcf86cd799439012",
  "patientName": "John Doe",
  "patientAge": 35,
  "patientGender": "male",
  "homeAddress": {
    "street": "123 Main Street",
    "city": "City",
    "state": "State",
    "zipCode": "12345"
  },
  "phoneNumber": "+1234567890",
  "requestedDate": "2024-01-20",
  "requestedTime": "14:00"
}
```

### Example 6: View My History (All)
```bash
GET /api/patient/history?type=all&page=1&limit=20
Authorization: Bearer <patient_token>
```

### Example 7: View Only Serials
```bash
GET /api/patient/history?type=serials&page=1&limit=20
Authorization: Bearer <patient_token>
```

### Example 8: View Only Home Service Requests
```bash
GET /api/patient/history?type=home_services&page=1&limit=20
Authorization: Bearer <patient_token>
```

### Example 9: Hospital Admin Views Pending Requests
```bash
GET /api/hospitals/507f1f77bcf86cd799439011/home-service-requests?status=pending
Authorization: Bearer <hospital_admin_token>
```

### Example 10: Accept Request
```bash
PUT /api/hospitals/507f1f77bcf86cd799439011/home-service-requests/507f1f77bcf86cd799439013/accept
Authorization: Bearer <hospital_admin_token>

{
  "notes": "Service will be provided on requested date"
}
```

### Example 11: Reject Request
```bash
PUT /api/hospitals/507f1f77bcf86cd799439011/home-service-requests/507f1f77bcf86cd799439013/reject
Authorization: Bearer <hospital_admin_token>

{
  "rejectionReason": "Service not available on requested date"
}
```

---

## Files Created/Modified

### New Files
- `src/models/HomeServiceRequest.model.js` - Home service request data model

### Modified Files
- `src/controllers/patient.controller.js` - Added functions:
  - `getAllHomeServices`
  - `getHomeServiceDetails`
  - `submitHomeServiceRequest`
  - `getMyHistory`
- `src/controllers/hospital.controller.js` - Added functions:
  - `getHomeServiceRequests`
  - `getHomeServiceRequest`
  - `acceptHomeServiceRequest`
  - `rejectHomeServiceRequest`
- `src/routes/patient.routes.js` - Added routes for home services and history
- `src/routes/hospital.routes.js` - Added routes for managing requests
- `src/routes/shared.routes.js` - Added public routes for viewing home services

---

## Important Notes

1. **Service Snapshot**: When a request is submitted, the service details (type, price, note) are saved as a snapshot to preserve the information even if the service is later modified.

2. **Address Format**: Home address includes street, city, state, zipCode, country, and optional coordinates for mapping.

3. **Request Number**: Each request gets a unique request number in format: `HSR-{timestamp}-{random}`

4. **Status Management**: Only pending requests can be accepted or rejected. Once accepted or rejected, the status cannot be changed back to pending.

5. **Rejection Reason**: Rejection requires a reason to be provided.

6. **History Sorting**: History is sorted by creation date (most recent first), combining both serials and home service requests.

7. **Pagination**: All list endpoints support pagination for efficient data retrieval.

8. **Hospital Filtering**: Only approved hospitals and active services are shown to users.

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [...]
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Home service not found"
}
```

### 400 Bad Request (Status Change)
```json
{
  "success": false,
  "message": "Request cannot be accepted. Current status: accepted"
}
```

---

**Feature Status:** ✅ Complete and Ready for Use

