# Diagnostic Center Home Services API Endpoints

Complete list of all API endpoints for Diagnostic Center Home Services management.

---

## 🔐 Authentication

All diagnostic center admin endpoints require:
- **Authentication**: Bearer token in `Authorization` header
- **Authorization**: User must have `diagnostic_center_admin` or `super_admin` role
- **Ownership**: User must be an admin of the specified diagnostic center

---

## 📋 Diagnostic Center Admin Endpoints

### Base URL
```
/api/diagnostic-centers/:centerId
```

---

### 1. Create Home Service
**POST** `/api/diagnostic-centers/:centerId/home-services`

**Description**: Add a new home service (e.g., Home Sample Collection, Home Blood Test, ECG at Home)

**Request Body:**
```json
{
  "serviceType": "Home Sample Collection",
  "price": 500,
  "note": "Our lab technician will collect samples from your home",
  "availableTime": {
    "startTime": "09:00",
    "endTime": "17:00"
  },
  "offDays": [0, 6]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Home service created successfully",
  "data": {
    "homeService": {
      "_id": "...",
      "diagnosticCenterId": "...",
      "serviceType": "Home Sample Collection",
      "price": 500,
      "note": "Our lab technician will collect samples from your home",
      "availableTime": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "offDays": [0, 6],
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

### 2. Get All Home Services
**GET** `/api/diagnostic-centers/:centerId/home-services?isActive=true&page=1&limit=20`

**Description**: Get list of all home services for the diagnostic center

**Query Parameters:**
- `isActive` (optional) - Filter by active status (`true`/`false`)
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "homeServices": [
      {
        "_id": "...",
        "serviceType": "Home Sample Collection",
        "price": 500,
        "note": "...",
        "availableTime": {
          "startTime": "09:00",
          "endTime": "17:00"
        },
        "offDays": [0, 6],
        "isActive": true
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

### 3. Get Single Home Service
**GET** `/api/diagnostic-centers/:centerId/home-services/:serviceId`

**Description**: Get details of a specific home service

**Response:**
```json
{
  "success": true,
  "data": {
    "homeService": {
      "_id": "...",
      "diagnosticCenterId": "...",
      "serviceType": "Home Sample Collection",
      "price": 500,
      "note": "...",
      "availableTime": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "offDays": [0, 6],
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  }
}
```

---

### 4. Update Home Service
**PUT** `/api/diagnostic-centers/:centerId/home-services/:serviceId`

**Description**: Update an existing home service

**Request Body (all fields optional):**
```json
{
  "serviceType": "Home Sample Collection (Updated)",
  "price": 550,
  "note": "Updated description",
  "availableTime": {
    "startTime": "08:00",
    "endTime": "18:00"
  },
  "offDays": [0],
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Home service updated successfully",
  "data": {
    "homeService": { ... }
  }
}
```

---

### 5. Delete Home Service
**DELETE** `/api/diagnostic-centers/:centerId/home-services/:serviceId`

**Description**: Delete a home service

**Response:**
```json
{
  "success": true,
  "message": "Home service deleted successfully"
}
```

---

### 6. Get All Home Service Requests
**GET** `/api/diagnostic-centers/:centerId/home-service-requests?status=pending&page=1&limit=20`

**Description**: Get all home service requests for the diagnostic center

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
          "serviceType": "Home Sample Collection",
          "price": 500,
          "note": "..."
        },
        "patientName": "John Doe",
        "patientAge": 35,
        "patientGender": "male",
        "homeAddress": {
          "street": "123 Main St",
          "city": "City",
          "state": "State",
          "zipCode": "12345"
        },
        "phoneNumber": "+1234567890",
        "status": "pending",
        "requestedDate": "2024-01-20T00:00:00.000Z",
        "requestedTime": "14:00",
        "createdAt": "..."
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20,
    "pagination": { ... }
  }
}
```

---

### 7. Get Single Home Service Request
**GET** `/api/diagnostic-centers/:centerId/home-service-requests/:requestId`

**Description**: Get details of a specific home service request

**Response:**
```json
{
  "success": true,
  "data": {
    "request": {
      "_id": "...",
      "requestNumber": "HSR-1705123456-ABC123",
      "patientId": { ... },
      "homeServiceId": { ... },
      "patientName": "John Doe",
      "patientAge": 35,
      "patientGender": "male",
      "homeAddress": { ... },
      "phoneNumber": "+1234567890",
      "serviceType": "Home Sample Collection",
      "servicePrice": 500,
      "status": "pending",
      "requestedDate": "...",
      "requestedTime": "14:00",
      "notes": "",
      "createdAt": "..."
    }
  }
}
```

---

### 8. Accept Home Service Request
**PUT** `/api/diagnostic-centers/:centerId/home-service-requests/:requestId/accept`

**Description**: Accept a pending home service request

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

---

### 9. Reject Home Service Request
**PUT** `/api/diagnostic-centers/:centerId/home-service-requests/:requestId/reject`

**Description**: Reject a pending home service request

**Request Body (required):**
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

## 👤 User/Patient Endpoints

### Base URL
```
/api/patient
```

---

### 10. View All Home Services (Public)
**GET** `/api/patient/home-services?diagnosticCenterId=...&serviceType=...&page=1&limit=20`

**Description**: View all active home services (supports both hospitals and diagnostic centers)

**Query Parameters:**
- `diagnosticCenterId` (optional) - Filter by diagnostic center
- `hospitalId` (optional) - Filter by hospital
- `serviceType` (optional) - Search by service type (case-insensitive)
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "homeServices": [
      {
        "_id": "...",
        "serviceType": "Home Sample Collection",
        "price": 500,
        "note": "...",
        "availableTime": {
          "startTime": "09:00",
          "endTime": "17:00"
        },
        "offDays": [0, 6],
        "isActive": true,
        "diagnosticCenter": {
          "id": "...",
          "name": "City Diagnostic Center",
          "address": "123 Medical St",
          "logo": "https://...",
          "contactInfo": { ... }
        }
      }
    ],
    "total": 25,
    "page": 1,
    "limit": 20,
    "pagination": { ... }
  }
}
```

---

### 11. View Home Service Details (Public)
**GET** `/api/patient/home-services/:serviceId`

**Description**: View complete details of a specific home service

**Response:**
```json
{
  "success": true,
  "data": {
    "homeService": {
      "_id": "...",
      "serviceType": "Home Sample Collection",
      "price": 500,
      "note": "Our lab technician will collect samples from your home",
      "availableTime": {
        "startTime": "09:00",
        "endTime": "17:00"
      },
      "offDays": [0, 6],
      "isActive": true,
      "diagnosticCenter": {
        "id": "...",
        "name": "City Diagnostic Center",
        "address": "123 Medical St, City, State",
        "logo": "https://...",
        "contactInfo": {
          "phone": ["+1234567890"],
          "email": "info@diagnostic.com",
          "website": "https://diagnostic.com"
        },
        "departments": ["Pathology", "Radiology"]
      }
    }
  }
}
```

---

### 12. Submit Home Service Request (Authenticated)
**POST** `/api/patient/home-services/request`

**Description**: Submit a request for a diagnostic home service

**Authentication**: Required (Patient token)

**Request Body:**
```json
{
  "diagnosticCenterId": "507f1f77bcf86cd799439011",
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
      "diagnosticCenterId": "...",
      "homeServiceId": "...",
      "patientName": "John Doe",
      "patientAge": 35,
      "patientGender": "male",
      "homeAddress": { ... },
      "phoneNumber": "+1234567890",
      "serviceType": "Home Sample Collection",
      "servicePrice": 500,
      "status": "pending",
      "requestedDate": "2024-01-20T00:00:00.000Z",
      "requestedTime": "14:00",
      "createdAt": "..."
    }
  }
}
```

---

### 13. View Home Service History (Authenticated)
**GET** `/api/patient/history?type=home_services&page=1&limit=20`

**Description**: View user's complete history of home service requests (includes both hospital and diagnostic center services)

**Authentication**: Required (Patient token)

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
        "type": "home_service",
        "id": "...",
        "requestNumber": "HSR-1705123456-ABC123",
        "diagnosticCenter": {
          "id": "...",
          "name": "City Diagnostic Center",
          "address": "123 Medical St",
          "logo": "https://...",
          "contactInfo": { ... }
        },
        "service": {
          "id": "...",
          "serviceType": "Home Sample Collection",
          "price": 500,
          "note": "...",
          "availableTime": {
            "startTime": "09:00",
            "endTime": "17:00"
          }
        },
        "patientName": "John Doe",
        "patientAge": 35,
        "patientGender": "male",
        "homeAddress": { ... },
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
    "pagination": { ... }
  }
}
```

---

## 📝 Request Status Flow

```
pending → accepted → completed
       ↘ rejected
       ↘ cancelled
```

### Status Values:
- `pending` - Request submitted, awaiting diagnostic center admin action
- `accepted` - Diagnostic center admin accepted the request
- `rejected` - Diagnostic center admin rejected the request (with reason)
- `completed` - Service has been completed
- `cancelled` - Request was cancelled

---

## 🔔 Notifications

### When Request is Submitted:
- **Patient Notification**: "Home Service Request Submitted"
- **Diagnostic Center Admin Notification**: "New Home Service Request" (sent to all admins)

### When Request is Accepted:
- **Patient Notification**: "Home Service Request Accepted"

### When Request is Rejected:
- **Patient Notification**: "Home Service Request Rejected" (includes rejection reason)

---

## ⚠️ Error Responses

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
  "message": "Access denied. You are not an admin of this diagnostic center."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Home service not found"
}
```

---

## 📌 Important Notes

1. **Service Types**: Examples include:
   - Home Sample Collection
   - Home Blood Test
   - Urine Test Collection
   - ECG at Home
   - Home X-Ray Service
   - Any custom service type

2. **Time Format**: All times must be in `HH:mm` format (24-hour, e.g., "09:00", "17:00")

3. **Off Days**: Array of numbers where:
   - `0` = Sunday
   - `1` = Monday
   - `2` = Tuesday
   - `3` = Wednesday
   - `4` = Thursday
   - `5` = Friday
   - `6` = Saturday

4. **Ownership Check**: All diagnostic center admin endpoints verify that the authenticated user is an admin of the specified diagnostic center

5. **Approval Required**: Diagnostic center must be `approved` status before adding home services

6. **Request Validation**: Only `pending` requests can be accepted or rejected

---

## 🚀 Example Usage

### Example 1: Create Home Service
```bash
POST http://localhost:5000/api/diagnostic-centers/507f1f77bcf86cd799439011/home-services
Authorization: Bearer <diagnostic_center_admin_token>
Content-Type: application/json

{
  "serviceType": "Home Sample Collection",
  "price": 500,
  "note": "Our lab technician will collect samples from your home",
  "availableTime": {
    "startTime": "09:00",
    "endTime": "17:00"
  },
  "offDays": [0, 6]
}
```

### Example 2: View All Services for Diagnostic Center
```bash
GET http://localhost:5000/api/patient/home-services?diagnosticCenterId=507f1f77bcf86cd799439011
```

### Example 3: Submit Request
```bash
POST http://localhost:5000/api/patient/home-services/request
Authorization: Bearer <patient_token>
Content-Type: application/json

{
  "diagnosticCenterId": "507f1f77bcf86cd799439011",
  "homeServiceId": "507f1f77bcf86cd799439012",
  "patientName": "John Doe",
  "patientAge": 35,
  "patientGender": "male",
  "homeAddress": {
    "street": "123 Main St",
    "city": "City"
  },
  "phoneNumber": "+1234567890"
}
```

### Example 4: Accept Request
```bash
PUT http://localhost:5000/api/diagnostic-centers/507f1f77bcf86cd799439011/home-service-requests/507f1f77bcf86cd799439013/accept
Authorization: Bearer <diagnostic_center_admin_token>
Content-Type: application/json

{
  "notes": "Service will be provided on requested date"
}
```

---

**All endpoints are ready to use!** ✅

