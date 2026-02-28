# Diagnostic Center Registration and Management System

## Overview

This feature allows diagnostic centers to register on the platform, get approved by super admins, complete their profiles, and manage their tests, orders, and reports through a comprehensive dashboard.

---

## Features

### 1. **Registration**
Diagnostic centers can register with the following required information:
- Diagnostic Center Name
- Phone Number
- Email Address
- Physical Address
- Owner/Admin Name
- Owner/Admin Phone Number
- Trade License / Registration Document (number or document upload)
- Password

### 2. **Post-Approval Profile Completion**
After super admin approval, diagnostic centers can complete their profiles with:
- Government Registration Certificate (upload)
- List of Available Tests with Prices
- List of Departments
- Operating Hours (Opening Time / Closing Time)
- Home Sample Collection Service (Yes / No)
- Emergency Service (Yes / No)
- Ambulance Service (Optional - with contact number if available)
- Number of Lab Technicians / Staff
- Reporting Time (Same day / 24 hours / Depends on test)
- Report Delivery Options (Email, Online Portal)

### 3. **Dashboard Features**
- Add and update test list
- Manage test pricing
- Manage test bookings/orders
- Upload patient reports
- View analytics and diagnostic center information

---

## API Endpoints

### Public Endpoints

#### 1. Register Diagnostic Center
**POST** `/api/diagnostic-centers/register`

**Request Body:**
```json
{
  "name": "City Diagnostic Center",
  "phone": "+1234567890",
  "email": "info@diagnostic.com",
  "address": "123 Medical Street, City, State",
  "ownerName": "John Doe",
  "ownerPhone": "+1234567891",
  "tradeLicenseNumber": "TL-12345",
  "tradeLicenseDocument": "https://...",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Diagnostic center registration successful. Status: pending_super_admin. Awaiting super admin approval.",
  "data": {
    "diagnosticCenter": {
      "id": "...",
      "userId": "...",
      "status": "pending_super_admin",
      "tradeLicenseNumber": "TL-12345"
    }
  }
}
```

---

### Diagnostic Center Admin Endpoints (Authentication Required)

#### 2. Get Profile
**GET** `/api/diagnostic-centers/:centerId/profile`

**Response:**
```json
{
  "success": true,
  "data": {
    "diagnosticCenter": {
      "_id": "...",
      "name": "City Diagnostic Center",
      "phone": "+1234567890",
      "email": "info@diagnostic.com",
      "address": "123 Medical Street",
      "ownerName": "John Doe",
      "ownerPhone": "+1234567891",
      "tradeLicenseNumber": "TL-12345",
      "status": "approved",
      "departments": ["Pathology", "Radiology"],
      "operatingHours": {
        "openingTime": "09:00",
        "closingTime": "17:00"
      },
      "homeSampleCollection": true,
      "emergencyService": true,
      "ambulanceService": {
        "available": true,
        "contactNumber": "+1234567892"
      },
      "numberOfLabTechnicians": 5,
      "numberOfStaff": 10,
      "reportingTime": "24_hours",
      "reportDeliveryOptions": {
        "email": true,
        "onlinePortal": true
      }
    }
  }
}
```

#### 3. Update Profile (Post-Approval)
**PUT** `/api/diagnostic-centers/:centerId/profile`

**Request Body:**
```json
{
  "governmentRegistrationCertificate": "https://...",
  "departments": ["Pathology", "Radiology", "Microbiology"],
  "operatingHours": {
    "openingTime": "09:00",
    "closingTime": "17:00"
  },
  "homeSampleCollection": true,
  "emergencyService": true,
  "ambulanceService": {
    "available": true,
    "contactNumber": "+1234567892"
  },
  "numberOfLabTechnicians": 5,
  "numberOfStaff": 10,
  "reportingTime": "24_hours",
  "reportDeliveryOptions": {
    "email": true,
    "onlinePortal": true
  },
  "logo": "https://...",
  "contactInfo": {
    "phone": ["+1234567890"],
    "email": "info@diagnostic.com",
    "website": "https://diagnostic.com"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Diagnostic center profile updated successfully",
  "data": {
    "diagnosticCenter": { ... }
  }
}
```

#### 4. Get Dashboard
**GET** `/api/diagnostic-centers/:centerId/dashboard`

**Response:**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalTests": 25,
      "todayOrders": 5,
      "monthlyOrders": 150,
      "pendingOrders": 10,
      "completedOrders": 140
    },
    "diagnosticCenter": {
      "id": "...",
      "name": "City Diagnostic Center",
      "status": "approved"
    }
  }
}
```

#### 5. Add Test
**POST** `/api/diagnostic-centers/:centerId/tests`

**Request Body:**
```json
{
  "name": "Blood Test - Complete",
  "code": "BT-CMP",
  "category": "pathology",
  "description": "Complete blood count test",
  "price": 500,
  "duration": 24,
  "preparation": "Fasting required for 12 hours",
  "isPackage": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Test added successfully",
  "data": {
    "test": {
      "_id": "...",
      "name": "Blood Test - Complete",
      "code": "BT-CMP",
      "category": "pathology",
      "price": 500,
      "diagnosticCenterId": "...",
      "isActive": true
    }
  }
}
```

#### 6. Get Tests
**GET** `/api/diagnostic-centers/:centerId/tests?isActive=true&category=pathology&page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "data": {
    "tests": [
      {
        "_id": "...",
        "name": "Blood Test - Complete",
        "code": "BT-CMP",
        "category": "pathology",
        "price": 500,
        "duration": 24,
        "isActive": true
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

#### 7. Update Test
**PUT** `/api/diagnostic-centers/:centerId/tests/:testId`

**Request Body:**
```json
{
  "name": "Blood Test - Complete (Updated)",
  "price": 550,
  "isActive": true
}
```

#### 8. Delete Test
**DELETE** `/api/diagnostic-centers/:centerId/tests/:testId`

#### 9. Get Orders
**GET** `/api/diagnostic-centers/:centerId/orders?status=pending&page=1&limit=20`

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "...",
        "orderNumber": "ORD-1705123456-ABC123",
        "patientId": {
          "_id": "...",
          "name": "Patient Name",
          "email": "patient@example.com",
          "phone": "+1234567890"
        },
        "tests": [
          {
            "testId": "...",
            "testName": "Blood Test",
            "price": 500,
            "quantity": 1
          }
        ],
        "totalAmount": 500,
        "finalAmount": 500,
        "status": "pending",
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

#### 10. Update Order Status
**PUT** `/api/diagnostic-centers/:centerId/orders/:orderId/status`

**Request Body:**
```json
{
  "status": "completed"
}
```

**Valid Status Values:**
- `pending`
- `sample_collected`
- `in_progress`
- `completed`
- `cancelled`

#### 11. Upload Report
**POST** `/api/diagnostic-centers/:centerId/orders/:orderId/reports`

**Request Body:**
```json
{
  "testId": "...",
  "reportPath": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report uploaded successfully",
  "data": {
    "order": {
      "_id": "...",
      "reports": [
        {
          "testId": "...",
          "reportPath": "https://...",
          "uploadedAt": "...",
          "uploadedBy": "..."
        }
      ]
    }
  }
}
```

---

### Super Admin Endpoints (Authentication Required)

#### 12. Approve Diagnostic Center
**POST** `/api/admin/approve/diagnostic-center/:centerId`

**Request Body (optional):**
```json
{
  "reason": "All documents verified"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Diagnostic center approved successfully",
  "data": {
    "diagnosticCenter": {
      "id": "...",
      "status": "approved",
      "name": "City Diagnostic Center"
    }
  }
}
```

#### 13. Reject Diagnostic Center
**POST** `/api/admin/reject/diagnostic-center/:centerId`

**Request Body:**
```json
{
  "reason": "Incomplete documentation"
}
```

#### 14. Get Pending Items
**GET** `/api/admin/pending`

**Response:**
```json
{
  "success": true,
  "data": {
    "pendingDoctors": [...],
    "pendingHospitals": [...],
    "pendingDiagnosticCenters": [
      {
        "_id": "...",
        "name": "City Diagnostic Center",
        "status": "pending_super_admin",
        "userId": { ... }
      }
    ],
    "counts": {
      "doctors": 5,
      "hospitals": 3,
      "diagnosticCenters": 2
    }
  }
}
```

---

## Data Models

### DiagnosticCenter Schema

```javascript
{
  userId: ObjectId,                    // User account (diagnostic_center_admin role)
  name: String,                        // Diagnostic center name
  phone: String,                       // Phone number
  email: String,                       // Email address
  address: String,                    // Physical address
  ownerName: String,                  // Owner/Admin name
  ownerPhone: String,                  // Owner/Admin phone
  tradeLicenseNumber: String,         // Trade license number (unique)
  tradeLicenseDocument: String,       // Document URL
  governmentRegistrationCertificate: String, // Government certificate URL
  departments: [String],              // List of departments
  operatingHours: {
    openingTime: String,              // "HH:mm" format
    closingTime: String                // "HH:mm" format
  },
  homeSampleCollection: Boolean,      // Home sample collection available
  emergencyService: Boolean,          // Emergency service available
  ambulanceService: {
    available: Boolean,
    contactNumber: String
  },
  numberOfLabTechnicians: Number,     // Number of lab technicians
  numberOfStaff: Number,              // Total staff count
  reportingTime: String,              // 'same_day', '24_hours', 'depends_on_test'
  reportDeliveryOptions: {
    email: Boolean,
    onlinePortal: Boolean
  },
  logo: String,                        // Logo URL
  contactInfo: {
    phone: [String],
    email: String,
    website: String
  },
  status: String,                      // 'pending_super_admin', 'approved', 'rejected', 'suspended'
  admins: [ObjectId],                  // Admin user IDs
  verifiedAt: Date,                    // When approved
  verifiedBy: ObjectId,                 // Who approved
  rejectionReason: String,              // Rejection reason
  rating: {
    average: Number,
    count: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Test Schema (Updated)

The Test model now supports both hospitals and diagnostic centers:

```javascript
{
  name: String,
  code: String (unique),
  category: String,                   // 'pathology', 'radiology', 'cardiology', 'other'
  description: String,
  price: Number,
  duration: Number,                   // in hours
  preparation: String,
  hospitalId: ObjectId (optional),    // For hospital tests
  diagnosticCenterId: ObjectId (optional), // For diagnostic center tests
  isActive: Boolean,
  isPackage: Boolean,
  packageTests: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

**Note:** Either `hospitalId` or `diagnosticCenterId` must be provided, but not both.

### Order Schema (Updated)

The Order model now supports both hospitals and diagnostic centers:

```javascript
{
  patientId: ObjectId,
  hospitalId: ObjectId (optional),    // For hospital orders
  diagnosticCenterId: ObjectId (optional), // For diagnostic center orders
  orderNumber: String,
  tests: [{
    testId: ObjectId,
    testName: String,
    price: Number,
    quantity: Number
  }],
  totalAmount: Number,
  discount: Number,
  finalAmount: Number,
  collectionType: String,             // 'walk_in', 'home_collection'
  appointmentDate: Date,
  appointmentTime: String,
  address: { ... },
  status: String,                      // 'pending', 'sample_collected', 'in_progress', 'completed', 'cancelled'
  paymentStatus: String,
  reports: [{
    testId: ObjectId,
    reportPath: String,
    uploadedAt: Date,
    uploadedBy: ObjectId
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Patient Endpoints (Updated)

### Get Diagnostic Tests
**GET** `/api/patient/diagnostics/tests?diagnosticCenterId=...&category=pathology`

Supports both `hospitalId` and `diagnosticCenterId` query parameters.

### Create Order
**POST** `/api/patient/diagnostics/orders`

**Request Body:**
```json
{
  "diagnosticCenterId": "...",
  "tests": [
    {
      "testId": "...",
      "quantity": 1
    }
  ],
  "collectionType": "home_collection",
  "appointmentDate": "2024-01-20",
  "appointmentTime": "14:00",
  "address": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "zipCode": "12345"
  }
}
```

**Note:** Either `hospitalId` or `diagnosticCenterId` must be provided.

### Get My Orders
**GET** `/api/patient/diagnostics/orders`

Returns orders from both hospitals and diagnostic centers, with populated information.

---

## Approval Workflow

```
Registration → status: pending_super_admin 
→ Super Admin Approves → status: approved 
→ Diagnostic Center can complete profile and manage dashboard
```

### Status Values
- `pending_super_admin` - Awaiting super admin approval
- `approved` - Approved and active
- `rejected` - Rejected with reason
- `suspended` - Temporarily suspended

---

## Security & Access Control

### Public Access
- Registration endpoint is public (no authentication required)

### Diagnostic Center Admin Access
- All management endpoints require authentication
- Diagnostic center admins can only manage their own center
- `checkDiagnosticCenterOwnership` middleware ensures proper access control
- Profile updates only allowed after approval

### Super Admin Access
- Approval/rejection endpoints require super admin role
- Can view all pending diagnostic centers

---

## Middleware

### `checkDiagnosticCenterOwnership`
- Verifies user is an admin of the diagnostic center
- Allows super admin to access any center
- Returns 403 if user is not authorized

---

## Notification System

### When Diagnostic Center is Approved
- **Diagnostic Center Admin Notification:**
  - Type: Email notification
  - Title: "Diagnostic Center Approval"
  - Message: "Your diagnostic center has been approved. You can now complete your profile and manage your dashboard."

### When Order Status is Updated
- **Patient Notification:**
  - Type: `order_status_update`
  - Title: "Order Status Updated"
  - Message: Includes order number and new status

### When Report is Uploaded
- **Patient Notification:**
  - Type: `report_ready`
  - Title: "Test Report Ready"
  - Message: "Your test report for order #XXX is ready"

---

## Files Created/Modified

### New Files
- `src/models/DiagnosticCenter.model.js` - Diagnostic center data model
- `src/controllers/diagnosticCenter.controller.js` - Diagnostic center controller
- `src/routes/diagnosticCenter.routes.js` - Diagnostic center routes
- `src/middlewares/diagnosticCenterOwnership.middleware.js` - Ownership check middleware

### Modified Files
- `src/models/Test.model.js` - Added `diagnosticCenterId` support
- `src/models/Order.model.js` - Added `diagnosticCenterId` support
- `src/controllers/approval.controller.js` - Added diagnostic center approval endpoints
- `src/controllers/patient.controller.js` - Updated to support diagnostic centers
- `src/routes/admin.routes.js` - Added diagnostic center approval routes
- `src/routes/patient.routes.js` - Updated order creation validation
- `server.js` - Registered diagnostic center routes

---

## Example Usage

### Example 1: Register Diagnostic Center
```bash
POST /api/diagnostic-centers/register
{
  "name": "City Diagnostic Center",
  "phone": "+1234567890",
  "email": "info@diagnostic.com",
  "address": "123 Medical Street",
  "ownerName": "John Doe",
  "ownerPhone": "+1234567891",
  "tradeLicenseNumber": "TL-12345",
  "password": "securepassword123"
}
```

### Example 2: Complete Profile (After Approval)
```bash
PUT /api/diagnostic-centers/:centerId/profile
Authorization: Bearer <diagnostic_center_admin_token>

{
  "departments": ["Pathology", "Radiology"],
  "operatingHours": {
    "openingTime": "09:00",
    "closingTime": "17:00"
  },
  "homeSampleCollection": true,
  "reportingTime": "24_hours"
}
```

### Example 3: Add Test
```bash
POST /api/diagnostic-centers/:centerId/tests
Authorization: Bearer <diagnostic_center_admin_token>

{
  "name": "Blood Test - Complete",
  "code": "BT-CMP",
  "category": "pathology",
  "price": 500,
  "duration": 24
}
```

### Example 4: Patient Creates Order
```bash
POST /api/patient/diagnostics/orders
Authorization: Bearer <patient_token>

{
  "diagnosticCenterId": "...",
  "tests": [
    {
      "testId": "...",
      "quantity": 1
    }
  ],
  "collectionType": "home_collection",
  "appointmentDate": "2024-01-20",
  "appointmentTime": "14:00",
  "address": {
    "street": "123 Main St",
    "city": "City"
  }
}
```

### Example 5: Upload Report
```bash
POST /api/diagnostic-centers/:centerId/orders/:orderId/reports
Authorization: Bearer <diagnostic_center_admin_token>

{
  "testId": "...",
  "reportPath": "https://..."
}
```

---

## Important Notes

1. **Registration**: Diagnostic centers register with basic information and await super admin approval.

2. **Profile Completion**: After approval, diagnostic centers can complete their profiles with detailed information.

3. **Test Management**: Tests can belong to either a hospital or a diagnostic center, but not both.

4. **Order Management**: Orders can be placed with either hospitals or diagnostic centers.

5. **Report Upload**: Diagnostic centers can upload reports for specific tests within an order.

6. **Status Management**: Only approved diagnostic centers can manage their profiles and dashboard.

7. **Validation**: Operating hours must have closing time after opening time. Ambulance service requires contact number if available.

8. **Notifications**: Automatic notifications are sent for approval, order status updates, and report uploads.

---

**Feature Status:** ✅ Complete and Ready for Use

