# Hospital API Endpoints - Complete Testing Guide

**Base URL:** `http://localhost:5000/api`

**Authentication:** Most endpoints require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 🔓 Public Endpoints (No Authentication)

### 1. Register Hospital
- **POST** `/api/hospitals/register`
- **Description:** Register a new hospital (public endpoint)
- **Auth:** ❌ No authentication required
- **Request Body:**
```json
{
  "name": "City General Hospital",
  "email": "hospital@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "address": "123 Medical Street, City",
  "registrationNumber": "HOSP12345",
  "documents": ["https://example.com/license.pdf"]
}
```
- **Response (201):**
```json
{
  "success": true,
  "message": "Hospital registration successful. Status: pending_super_admin. Awaiting super admin approval.",
  "data": {
    "hospital": {
      "id": "507f1f77bcf86cd799439011",
      "userId": "507f1f77bcf86cd799439012",
      "status": "pending_super_admin",
      "registrationNumber": "HOSP12345"
    }
  }
}
```

---

## 🔐 Hospital Admin Endpoints (Authentication Required)

**All endpoints below require:**
- `Authorization: Bearer <hospital_admin_token>`
- User must be `hospital_admin` role
- User must be admin of the specified hospital (via `checkHospitalOwnership` middleware)

---

### 2. Get Hospital Profile
- **GET** `/api/hospitals/:hospitalId/profile`
- **Description:** View hospital profile details
- **Auth:** ✅ Required (hospital_admin)
- **URL Params:** `hospitalId` - Hospital ID
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "hospital": {
      "_id": "...",
      "name": "City General Hospital",
      "address": "123 Medical Street",
      "logo": "https://example.com/logo.png",
      "departments": ["Cardiology", "Orthopedics", "Pediatrics"],
      "contactInfo": {
        "phone": ["+1234567890"],
        "email": "hospital@example.com"
      },
      "status": "approved",
      "associatedDoctors": [...],
      "admins": [...]
    }
  }
}
```

---

### 3. Update Hospital Profile
- **PUT** `/api/hospitals/:hospitalId/profile`
- **Description:** Update hospital profile (read-only if status = approved)
- **Auth:** ✅ Required (hospital_admin)
- **URL Params:** `hospitalId` - Hospital ID
- **Request Body:**
```json
{
  "name": "Updated Hospital Name",
  "address": "New Address",
  "logo": "https://example.com/new-logo.png",
  "departments": ["Cardiology", "Orthopedics", "Pediatrics", "Neurology"],
  "contactInfo": {
    "phone": ["+1234567890", "+1234567891"],
    "email": "newemail@hospital.com",
    "website": "https://hospital.com"
  },
  "facilities": ["ICU", "Emergency", "Operation Theater"],
  "services": ["Surgery", "Consultation", "Emergency Care"]
}
```
- **Response (200):**
```json
{
  "success": true,
  "message": "Hospital profile updated successfully",
  "data": {
    "hospital": {...}
  }
}
```
- **Error (403) - If status = approved:**
```json
{
  "success": false,
  "message": "Hospital profile is read-only when verification status is Active (approved)"
}
```

---

### 4. Add Doctor (Create New)
- **POST** `/api/hospitals/:hospitalId/doctors`
- **Description:** Hospital admin adds a new doctor directly (auto-approved)
- **Auth:** ✅ Required (hospital_admin)
- **URL Params:** `hospitalId` - Hospital ID
- **Request Body:**
```json
{
  "name": "Dr. John Smith",
  "email": "dr.smith@example.com",
  "phone": "+1234567891",
  "password": "password123",
  "medicalLicenseNumber": "MD12345",
  "licenseDocumentUrl": "https://example.com/license.pdf",
  "specialization": ["Cardiology"],
  "qualifications": "MBBS, MD",
  "experienceYears": 10,
  "chamber": {
    "name": "Cardiology Chamber",
    "address": "Hospital Building, Floor 2"
  },
  "profilePhotoUrl": "https://example.com/photo.jpg"
}
```
- **Response (201):**
```json
{
  "success": true,
  "message": "Doctor added and approved successfully",
  "data": {
    "doctor": {
      "id": "...",
      "name": "Dr. John Smith",
      "email": "dr.smith@example.com",
      "status": "approved",
      "medicalLicenseNumber": "MD12345"
    }
  }
}
```

---

### 5. List Hospital Doctors
- **GET** `/api/hospitals/:hospitalId/doctors`
- **Description:** Get all doctors linked to the hospital
- **Auth:** ✅ Required (hospital_admin)
- **URL Params:** `hospitalId` - Hospital ID
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "_id": "...",
        "name": "Dr. John Smith",
        "email": "dr.smith@example.com",
        "specialization": ["Cardiology"],
        "status": "approved",
        "hospitalId": "..."
      }
    ],
    "hospital": {
      "id": "...",
      "name": "City General Hospital",
      "status": "approved"
    }
  }
}
```

---

### 6. Search Verified Doctors
- **GET** `/api/hospitals/:hospitalId/doctors/search`
- **Description:** Search verified doctors (status = approved) to link to hospital
- **Auth:** ✅ Required (hospital_admin)
- **URL Params:** `hospitalId` - Hospital ID
- **Query Params:**
  - `search` - Search by name, email, or medical license number
  - `specialization` - Filter by specialization
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 20)
- **Example:** `GET /api/hospitals/:hospitalId/doctors/search?search=cardiology&specialization=Cardiology&page=1&limit=20`
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "_id": "...",
        "name": "Dr. Jane Doe",
        "email": "dr.doe@example.com",
        "phone": "+1234567892",
        "specialization": ["Cardiology"],
        "medicalLicenseNumber": "MD67890",
        "status": "approved"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```
- **Note:** Excludes doctors already linked to this hospital

---

### 7. Link Existing Doctor
- **POST** `/api/hospitals/:hospitalId/doctors/link`
- **Description:** Link an existing verified doctor to the hospital
- **Auth:** ✅ Required (hospital_admin)
- **URL Params:** `hospitalId` - Hospital ID
- **Request Body:**
```json
{
  "doctorId": "507f1f77bcf86cd799439013",
  "designation": "Senior Consultant",
  "department": "Cardiology"
}
```
- **Response (200):**
```json
{
  "success": true,
  "message": "Doctor linked to hospital successfully",
  "data": {
    "doctor": {
      "id": "...",
      "name": "Dr. Jane Doe",
      "email": "dr.doe@example.com"
    }
  }
}
```
- **Error (409) - If already linked:**
```json
{
  "success": false,
  "message": "Doctor is already linked to this hospital"
}
```
- **Error (400) - If doctor not approved:**
```json
{
  "success": false,
  "message": "Only verified (approved) doctors can be linked to hospitals"
}
```

---

### 8. Remove Doctor from Hospital
- **DELETE** `/api/hospitals/:hospitalId/doctors/:doctorId`
- **Description:** Remove a doctor from the hospital
- **Auth:** ✅ Required (hospital_admin)
- **URL Params:** 
  - `hospitalId` - Hospital ID
  - `doctorId` - Doctor ID
- **Response (200):**
```json
{
  "success": true,
  "message": "Doctor removed from hospital successfully"
}
```

---

### 9. Approve Doctor
- **POST** `/api/hospitals/:hospitalId/approve/doctor/:doctorId`
- **Description:** Hospital admin approves a doctor registered under the hospital
- **Auth:** ✅ Required (hospital_admin)
- **URL Params:**
  - `hospitalId` - Hospital ID
  - `doctorId` - Doctor ID
- **Response (200):**
```json
{
  "success": true,
  "message": "Doctor approved successfully",
  "data": {
    "doctor": {
      "id": "...",
      "status": "approved"
    }
  }
}
```

---

### 10. View Hospital Appointments (Read-Only)
- **GET** `/api/hospitals/:hospitalId/appointments`
- **Description:** View appointments booked under the hospital (read-only)
- **Auth:** ✅ Required (hospital_admin)
- **URL Params:** `hospitalId` - Hospital ID
- **Query Params:**
  - `date` - Filter by date (YYYY-MM-DD format)
  - `doctorId` - Filter by doctor ID
  - `status` - Filter by status (pending, accepted, rejected, completed, cancelled, no_show)
  - `page` - Page number (default: 1)
  - `limit` - Items per page (default: 20)
- **Example:** `GET /api/hospitals/:hospitalId/appointments?date=2024-01-15&status=pending&page=1&limit=20`
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "_id": "...",
        "appointmentNumber": "APT123456",
        "appointmentDate": "2024-01-15T10:00:00.000Z",
        "timeSlot": {
          "startTime": "10:00",
          "endTime": "10:15",
          "sessionDuration": 15
        },
        "status": "pending",
        "fee": 500,
        "paymentStatus": "pending",
        "patientId": {
          "_id": "...",
          "name": "Patient Name",
          "email": "patient@example.com",
          "phone": "+1234567893"
        },
        "doctorId": {
          "_id": "...",
          "name": "Dr. John Smith",
          "email": "dr.smith@example.com",
          "specialization": ["Cardiology"]
        },
        "chamberId": {
          "_id": "...",
          "name": "Cardiology Chamber",
          "address": "Hospital Building, Floor 2"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "pages": 1
    }
  }
}
```
- **Note:** This is READ-ONLY. Hospital cannot modify appointment status.

---

### 11. Get Hospital Dashboard
- **GET** `/api/hospitals/:hospitalId/dashboard`
- **Description:** Get hospital dashboard metrics
- **Auth:** ✅ Required (hospital_admin)
- **URL Params:** `hospitalId` - Hospital ID
- **Response (200):**
```json
{
  "success": true,
  "data": {
    "metrics": {
      "totalDoctorsLinked": 15,
      "todayAppointments": 8,
      "upcomingAppointments": 25
    },
    "hospital": {
      "id": "...",
      "name": "City General Hospital",
      "status": "approved"
    }
  }
}
```

---

## 📊 Complete Endpoint Summary

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/api/hospitals/register` | ❌ | Register hospital (public) |
| 2 | GET | `/api/hospitals/:hospitalId/profile` | ✅ | View hospital profile |
| 3 | PUT | `/api/hospitals/:hospitalId/profile` | ✅ | Update profile (read-only if approved) |
| 4 | POST | `/api/hospitals/:hospitalId/doctors` | ✅ | Add new doctor (auto-approved) |
| 5 | GET | `/api/hospitals/:hospitalId/doctors` | ✅ | List hospital doctors |
| 6 | GET | `/api/hospitals/:hospitalId/doctors/search` | ✅ | Search verified doctors |
| 7 | POST | `/api/hospitals/:hospitalId/doctors/link` | ✅ | Link existing doctor |
| 8 | DELETE | `/api/hospitals/:hospitalId/doctors/:doctorId` | ✅ | Remove doctor |
| 9 | POST | `/api/hospitals/:hospitalId/approve/doctor/:doctorId` | ✅ | Approve doctor |
| 10 | GET | `/api/hospitals/:hospitalId/appointments` | ✅ | View appointments (read-only) |
| 11 | GET | `/api/hospitals/:hospitalId/dashboard` | ✅ | Get dashboard metrics |

**Total: 11 endpoints** (1 public + 10 authenticated)

---

## 🧪 Testing Workflow

### Step 1: Register Hospital (Public)
```bash
POST http://localhost:5000/api/hospitals/register
Content-Type: application/json

{
  "name": "Test Hospital",
  "email": "test@hospital.com",
  "phone": "+1234567890",
  "password": "password123",
  "address": "123 Test St",
  "registrationNumber": "TEST001",
  "documents": ["https://example.com/doc.pdf"]
}
```
**Save:** `hospitalId` and `userId` from response

---

### Step 2: Get Super Admin to Approve
(Use super admin account to approve the hospital)
```bash
POST http://localhost:5000/api/admin/approve/hospital/:hospitalId
Authorization: Bearer <super_admin_token>
```

---

### Step 3: Login as Hospital Admin
```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@hospital.com",
  "password": "password123"
}
```
**Save:** `token` from response

---

### Step 4: Test Profile Endpoints
```bash
# Get profile
GET http://localhost:5000/api/hospitals/:hospitalId/profile
Authorization: Bearer <hospital_admin_token>

# Update profile (if status != approved)
PUT http://localhost:5000/api/hospitals/:hospitalId/profile
Authorization: Bearer <hospital_admin_token>
Content-Type: application/json

{
  "logo": "https://example.com/logo.png",
  "departments": ["Cardiology", "Orthopedics"]
}
```

---

### Step 5: Test Doctor Management
```bash
# Search verified doctors
GET http://localhost:5000/api/hospitals/:hospitalId/doctors/search?search=cardiology
Authorization: Bearer <hospital_admin_token>

# Link existing doctor
POST http://localhost:5000/api/hospitals/:hospitalId/doctors/link
Authorization: Bearer <hospital_admin_token>
Content-Type: application/json

{
  "doctorId": "507f1f77bcf86cd799439013",
  "designation": "Senior Consultant",
  "department": "Cardiology"
}

# List hospital doctors
GET http://localhost:5000/api/hospitals/:hospitalId/doctors
Authorization: Bearer <hospital_admin_token>

# Add new doctor
POST http://localhost:5000/api/hospitals/:hospitalId/doctors
Authorization: Bearer <hospital_admin_token>
Content-Type: application/json

{
  "name": "Dr. New Doctor",
  "email": "newdoctor@example.com",
  "phone": "+1234567894",
  "password": "password123",
  "medicalLicenseNumber": "MD99999",
  "licenseDocumentUrl": "https://example.com/license.pdf",
  "specialization": ["General Medicine"],
  "experienceYears": 5
}
```

---

### Step 6: Test Appointments & Dashboard
```bash
# View appointments
GET http://localhost:5000/api/hospitals/:hospitalId/appointments?date=2024-01-15&status=pending
Authorization: Bearer <hospital_admin_token>

# Get dashboard
GET http://localhost:5000/api/hospitals/:hospitalId/dashboard
Authorization: Bearer <hospital_admin_token>
```

---

## 🔑 Authentication Flow

1. **Register Hospital** → Get `hospitalId` and `userId`
2. **Super Admin Approves** → Hospital status becomes `approved`
3. **Login as Hospital Admin** → Get JWT token
4. **Use Token** → Include in `Authorization: Bearer <token>` header

---

## ⚠️ Important Notes

1. **Profile Update Restriction:**
   - If `hospital.status === 'approved'`, profile is READ-ONLY
   - Can only update when status is `pending_super_admin` or `rejected`

2. **Doctor Linking:**
   - Only verified doctors (`status === 'approved'`) can be linked
   - Prevents duplicate mappings automatically
   - Excludes already-linked doctors from search results

3. **Appointments:**
   - READ-ONLY view only
   - Hospital cannot modify appointment status
   - Filters by hospital's chambers

4. **Ownership:**
   - Hospital admin can only access their own hospital
   - Super admin can access any hospital

---

## 📝 Common Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "No token provided. Access denied."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. You are not an admin of this hospital."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Hospital not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Doctor is already linked to this hospital"
}
```

---

## 🧪 Quick Test with cURL

```bash
# Register
curl -X POST http://localhost:5000/api/hospitals/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital",
    "email": "test@hospital.com",
    "phone": "+1234567890",
    "password": "password123",
    "address": "123 Test St",
    "registrationNumber": "TEST001",
    "documents": ["https://example.com/doc.pdf"]
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@hospital.com",
    "password": "password123"
  }'

# Get Profile (replace TOKEN and HOSPITAL_ID)
curl -X GET http://localhost:5000/api/hospitals/HOSPITAL_ID/profile \
  -H "Authorization: Bearer TOKEN"

# Get Dashboard
curl -X GET http://localhost:5000/api/hospitals/HOSPITAL_ID/dashboard \
  -H "Authorization: Bearer TOKEN"
```

---

**Happy Testing! 🚀**

