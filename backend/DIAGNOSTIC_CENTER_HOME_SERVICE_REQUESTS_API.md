# Diagnostic Center Home Service Requests API

Complete API documentation for managing home service requests in the Diagnostic Center system.

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

## 1. Get All Home Service Requests

**GET** `/api/diagnostic-centers/:centerId/home-service-requests`

**Description**: Get all home service requests for the diagnostic center with filtering and pagination

**Query Parameters:**
- `status` (optional) - Filter by status: `pending`, `accepted`, `rejected`, `completed`, `cancelled`
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Example Request:**
```bash
GET /api/diagnostic-centers/507f1f77bcf86cd799439011/home-service-requests?status=pending&page=1&limit=20
Authorization: Bearer <diagnostic_center_admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "requestNumber": "HSR-1705123456-ABC123",
        "patientId": {
          "_id": "507f1f77bcf86cd799439014",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        },
        "homeServiceId": {
          "_id": "507f1f77bcf86cd799439012",
          "serviceType": "Home Sample Collection",
          "price": 500,
          "note": "Our lab technician will collect samples from your home"
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
        "serviceType": "Home Sample Collection",
        "servicePrice": 500,
        "serviceNote": "Our lab technician will collect samples from your home",
        "status": "pending",
        "requestedDate": "2024-01-20T00:00:00.000Z",
        "requestedTime": "14:00",
        "notes": "",
        "createdAt": "2024-01-16T10:00:00.000Z",
        "updatedAt": "2024-01-16T10:00:00.000Z"
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

---

## 2. Get Single Home Service Request

**GET** `/api/diagnostic-centers/:centerId/home-service-requests/:requestId`

**Description**: Get complete details of a specific home service request

**Example Request:**
```bash
GET /api/diagnostic-centers/507f1f77bcf86cd799439011/home-service-requests/507f1f77bcf86cd799439013
Authorization: Bearer <diagnostic_center_admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "request": {
      "_id": "507f1f77bcf86cd799439013",
      "requestNumber": "HSR-1705123456-ABC123",
      "patientId": {
        "_id": "507f1f77bcf86cd799439014",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890"
      },
      "homeServiceId": {
        "_id": "507f1f77bcf86cd799439012",
        "serviceType": "Home Sample Collection",
        "price": 500,
        "note": "Our lab technician will collect samples from your home",
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
      "serviceType": "Home Sample Collection",
      "servicePrice": 500,
      "serviceNote": "Our lab technician will collect samples from your home",
      "status": "pending",
      "requestedDate": "2024-01-20T00:00:00.000Z",
      "requestedTime": "14:00",
      "notes": "",
      "acceptedBy": null,
      "rejectedBy": null,
      "acceptedAt": null,
      "rejectedAt": null,
      "rejectionReason": null,
      "createdAt": "2024-01-16T10:00:00.000Z",
      "updatedAt": "2024-01-16T10:00:00.000Z"
    }
  }
}
```

---

## 3. Accept Home Service Request

**PUT** `/api/diagnostic-centers/:centerId/home-service-requests/:requestId/accept`

**Description**: Accept a pending home service request. Only requests with status `pending` can be accepted.

**Request Body (optional):**
```json
{
  "notes": "Service will be provided on requested date. Our technician will arrive at 14:00."
}
```

**Example Request:**
```bash
PUT /api/diagnostic-centers/507f1f77bcf86cd799439011/home-service-requests/507f1f77bcf86cd799439013/accept
Authorization: Bearer <diagnostic_center_admin_token>
Content-Type: application/json

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
      "_id": "507f1f77bcf86cd799439013",
      "requestNumber": "HSR-1705123456-ABC123",
      "status": "accepted",
      "acceptedAt": "2024-01-16T10:30:00.000Z",
      "acceptedBy": "507f1f77bcf86cd799439015",
      "notes": "Service will be provided on requested date",
      "updatedAt": "2024-01-16T10:30:00.000Z"
    }
  }
}
```

**Error Response (Invalid Status):**
```json
{
  "success": false,
  "message": "Request cannot be accepted. Current status: accepted"
}
```

**What Happens:**
1. Request status changes from `pending` to `accepted`
2. `acceptedAt` is set to current date/time
3. `acceptedBy` is set to the admin's user ID
4. Optional `notes` field is updated
5. Notification is sent to the patient

---

## 4. Reject Home Service Request

**PUT** `/api/diagnostic-centers/:centerId/home-service-requests/:requestId/reject`

**Description**: Reject a pending home service request. Only requests with status `pending` can be rejected. Rejection reason is required.

**Request Body (required):**
```json
{
  "rejectionReason": "Service not available on requested date. Please choose another date or contact us for alternative arrangements."
}
```

**Example Request:**
```bash
PUT /api/diagnostic-centers/507f1f77bcf86cd799439011/home-service-requests/507f1f77bcf86cd799439013/reject
Authorization: Bearer <diagnostic_center_admin_token>
Content-Type: application/json

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
      "_id": "507f1f77bcf86cd799439013",
      "requestNumber": "HSR-1705123456-ABC123",
      "status": "rejected",
      "rejectedAt": "2024-01-16T10:30:00.000Z",
      "rejectedBy": "507f1f77bcf86cd799439015",
      "rejectionReason": "Service not available on requested date. Please choose another date.",
      "updatedAt": "2024-01-16T10:30:00.000Z"
    }
  }
}
```

**Error Response (Missing Reason):**
```json
{
  "success": false,
  "message": "Rejection reason is required"
}
```

**Error Response (Invalid Status):**
```json
{
  "success": false,
  "message": "Request cannot be rejected. Current status: accepted"
}
```

**What Happens:**
1. Request status changes from `pending` to `rejected`
2. `rejectedAt` is set to current date/time
3. `rejectedBy` is set to the admin's user ID
4. `rejectionReason` is saved (required field)
5. Notification is sent to the patient with the rejection reason

---

## 📊 Request Status Flow

```
pending → accepted → completed
       ↘ rejected
       ↘ cancelled
```

### Status Values:
- **`pending`** - Request submitted, awaiting diagnostic center admin action
- **`accepted`** - Diagnostic center admin accepted the request
- **`rejected`** - Diagnostic center admin rejected the request (with reason)
- **`completed`** - Service has been completed
- **`cancelled`** - Request was cancelled

---

## 🔔 Notifications

### When Request is Accepted:
- **Patient receives notification:**
  - Type: `order_status_update`
  - Title: "Home Service Request Accepted"
  - Message: `"Your home service request #HSR-XXX has been accepted by [Diagnostic Center Name]"`

### When Request is Rejected:
- **Patient receives notification:**
  - Type: `order_status_update`
  - Title: "Home Service Request Rejected"
  - Message: `"Your home service request #HSR-XXX has been rejected. Reason: [rejection reason]"`

---

## 📝 Request Data Structure

Each home service request contains:

### Patient Information:
- `patientName` - Name of the patient
- `patientAge` - Age of the patient
- `patientGender` - Gender (male, female, other)
- `homeAddress` - Complete address with coordinates
- `phoneNumber` - Contact phone number

### Service Information (Snapshot):
- `serviceType` - Type of service requested
- `servicePrice` - Price at time of request
- `serviceNote` - Service description/note

### Request Details:
- `requestNumber` - Unique request identifier (format: HSR-timestamp-random)
- `requestedDate` - Preferred date for service (optional)
- `requestedTime` - Preferred time for service (optional, HH:mm format)
- `notes` - Additional notes from patient or admin

### Status Tracking:
- `status` - Current status of the request
- `acceptedAt` - When request was accepted
- `acceptedBy` - Admin who accepted the request
- `rejectedAt` - When request was rejected
- `rejectedBy` - Admin who rejected the request
- `rejectionReason` - Reason for rejection

---

## ⚠️ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Rejection reason is required",
      "param": "rejectionReason",
      "location": "body"
    }
  ]
}
```

### 400 Bad Request (Invalid Status)
```json
{
  "success": false,
  "message": "Request cannot be accepted. Current status: accepted"
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
  "message": "Home service request not found"
}
```

### 404 Not Found (Diagnostic Center)
```json
{
  "success": false,
  "message": "Diagnostic center not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to fetch home service requests",
  "error": "Error message details"
}
```

---

## 🚀 Example Usage Scenarios

### Scenario 1: View All Pending Requests
```bash
GET /api/diagnostic-centers/507f1f77bcf86cd799439011/home-service-requests?status=pending
Authorization: Bearer <diagnostic_center_admin_token>
```

### Scenario 2: View Request Details
```bash
GET /api/diagnostic-centers/507f1f77bcf86cd799439011/home-service-requests/507f1f77bcf86cd799439013
Authorization: Bearer <diagnostic_center_admin_token>
```

### Scenario 3: Accept Request with Notes
```bash
PUT /api/diagnostic-centers/507f1f77bcf86cd799439011/home-service-requests/507f1f77bcf86cd799439013/accept
Authorization: Bearer <diagnostic_center_admin_token>
Content-Type: application/json

{
  "notes": "Our technician will arrive at 14:00. Please ensure patient is available."
}
```

### Scenario 4: Reject Request with Reason
```bash
PUT /api/diagnostic-centers/507f1f77bcf86cd799439011/home-service-requests/507f1f77bcf86cd799439013/reject
Authorization: Bearer <diagnostic_center_admin_token>
Content-Type: application/json

{
  "rejectionReason": "Service not available on requested date. Please contact us to reschedule."
}
```

### Scenario 5: View All Accepted Requests
```bash
GET /api/diagnostic-centers/507f1f77bcf86cd799439011/home-service-requests?status=accepted&page=1&limit=10
Authorization: Bearer <diagnostic_center_admin_token>
```

### Scenario 6: View All Requests (No Filter)
```bash
GET /api/diagnostic-centers/507f1f77bcf86cd799439011/home-service-requests?page=1&limit=20
Authorization: Bearer <diagnostic_center_admin_token>
```

---

## 📌 Important Notes

1. **Status Validation**: Only `pending` requests can be accepted or rejected. Once accepted or rejected, the status cannot be changed back to pending.

2. **Rejection Reason**: Rejection requires a reason to be provided. The reason is trimmed and cannot be empty.

3. **Ownership Check**: All endpoints verify that the authenticated user is an admin of the specified diagnostic center.

4. **Patient Information**: Full patient details (name, age, gender, address, phone) are available in each request for the diagnostic center admin to review.

5. **Service Snapshot**: Service details (type, price, note) are saved as a snapshot at the time of request to preserve information even if the service is later modified.

6. **Notifications**: Automatic notifications are sent to patients when requests are accepted or rejected.

7. **Pagination**: All list endpoints support pagination for efficient data retrieval.

8. **Request Number**: Each request gets a unique request number in format: `HSR-{timestamp}-{random}`

9. **Populated Fields**: 
   - List view: `patientId` (name, email, phone), `homeServiceId` (serviceType, price, note)
   - Single view: Also includes `availableTime` in `homeServiceId`, `acceptedBy`, and `rejectedBy` user details

10. **Sorting**: Requests are sorted by creation date (most recent first)

---

## 🔄 Complete Request Lifecycle

1. **Patient Submits Request** → Status: `pending`
   - Patient provides: name, age, gender, address, phone
   - Request is created with unique request number
   - Diagnostic center admins receive notification

2. **Admin Reviews Request** → View request details
   - Admin can see all patient information
   - Admin can see service details and price

3. **Admin Accepts Request** → Status: `accepted`
   - Admin can add optional notes
   - Patient receives acceptance notification
   - Request is ready for service delivery

4. **Admin Rejects Request** → Status: `rejected`
   - Admin must provide rejection reason
   - Patient receives rejection notification with reason
   - Request cannot be changed after rejection

5. **Service Completed** → Status: `completed`
   - (Can be updated manually or through separate endpoint if needed)

---

## 📋 Complete Endpoint List

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/diagnostic-centers/:centerId/home-service-requests` | Get all requests | ✅ Diagnostic Center Admin |
| GET | `/api/diagnostic-centers/:centerId/home-service-requests/:requestId` | Get single request | ✅ Diagnostic Center Admin |
| PUT | `/api/diagnostic-centers/:centerId/home-service-requests/:requestId/accept` | Accept request | ✅ Diagnostic Center Admin |
| PUT | `/api/diagnostic-centers/:centerId/home-service-requests/:requestId/reject` | Reject request | ✅ Diagnostic Center Admin |

---

**All endpoints are ready to use!** ✅

The Diagnostic Center Home Service Request system is identical to the Hospital Home Service Request system in functionality, structure, and behavior.

