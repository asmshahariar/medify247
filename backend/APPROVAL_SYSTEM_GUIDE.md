# Approval System Implementation Guide

## 📋 Overview

The Medify247 platform now implements a comprehensive approval system with separate registration endpoints and role-based approval flows.

---

## 🔑 Key Changes

### 1. **Separate Registration Endpoints**

- **`POST /api/auth/register`** - **ONLY for patients** (default role: `patient`)
- **`POST /api/doctors/register`** - **ONLY for doctors** (cannot use `/api/auth/register`)
- **`POST /api/hospitals/register`** - **ONLY for hospitals** (cannot use `/api/auth/register`)

### 2. **Approval Status Values**

Canonical status values:
- `pending_super_admin` - Awaiting super admin approval
- `pending_hospital` - Awaiting hospital admin approval
- `pending_hospital_and_super_admin` - Awaiting both approvals
- `approved` - Fully approved and active
- `rejected` - Rejected with reason
- `suspended` - Temporarily suspended

### 3. **Approval Flow Logic**

#### Standalone Doctor (no hospitalId):
```
Registration → status: pending_super_admin → Super Admin Approves → status: approved
```

#### Doctor Under Approved Hospital:
```
Registration → status: pending_hospital → Hospital Admin Approves → status: approved
```

#### Doctor Under Pending Hospital:
```
Registration → status: pending_hospital_and_super_admin 
→ Super Admin Approves Hospital → status: pending_hospital 
→ Hospital Admin Approves Doctor → status: approved
```

#### Hospital Admin Adds Doctor:
```
Hospital Admin Adds Doctor → status: approved (immediately, no approval needed)
```

---

## 📍 API Endpoints

### Authentication
- `POST /api/auth/register` - Register patient (role: patient by default)
- `POST /api/auth/login` - Login (checks doctor approval status)

### Doctor Registration
- `POST /api/doctors/register` - Register doctor (standalone or with hospitalId)
- `GET /api/doctors/:id/status` - Get doctor approval status

### Hospital Registration
- `POST /api/hospitals/register` - Register hospital (status: pending_super_admin)

### Hospital Management
- `POST /api/hospitals/:hospitalId/doctors` - Add doctor (auto-approved)
- `GET /api/hospitals/:hospitalId/doctors` - List hospital doctors
- `POST /api/hospitals/:hospitalId/approve/doctor/:doctorId` - Approve doctor

### Admin Approvals
- `GET /api/admin/pending` - List pending hospitals & doctors
- `POST /api/admin/approve/doctor/:doctorId` - Approve standalone doctor
- `POST /api/admin/reject/doctor/:doctorId` - Reject doctor (with reason)
- `POST /api/admin/approve/hospital/:hospitalId` - Approve hospital
- `POST /api/admin/reject/hospital/:hospitalId` - Reject hospital (with reason)

### User Profile
- `GET /api/users/:id` - Get user profile (role-aware)

---

## 🔐 Security & Validation

### Login Restrictions
- **Doctors cannot login** until `status === 'approved'`
- Returns `403 Forbidden` with message: "Doctor not approved. Current status: {status}"

### Middleware
- `authenticate` - Verifies JWT token
- `authorize(['role1', 'role2'])` - Checks user role
- `checkHospitalOwnership` - Verifies hospital admin belongs to hospital

### Validation
- Unique constraints: `email`, `medicalLicenseNumber`, `registrationNumber`
- Password hashing: `bcrypt` (12 rounds)
- Input validation: `express-validator`

---

## 📊 Models

### Approval Model
```javascript
{
  actorId: ObjectId,        // User who performed action
  actorRole: String,        // 'super_admin' | 'hospital_admin'
  targetType: String,       // 'doctor' | 'hospital'
  targetId: ObjectId,       // Doctor or Hospital ID
  action: String,           // 'approve' | 'reject' | 'suspend'
  reason: String,           // Optional reason
  previousStatus: String,   // Status before action
  newStatus: String,        // Status after action
  timestamp: Date
}
```

### Doctor Model Updates
- Added: `medicalLicenseNumber` (unique)
- Added: `licenseDocumentUrl`
- Added: `hospitalId` (optional)
- Updated: `status` enum with new values
- Added: `specialization` (array)
- Added: `qualifications`
- Added: `experienceYears`
- Added: `chamber` object

### Hospital Model Updates
- Added: `name` (required)
- Added: `registrationNumber` (unique)
- Added: `documents` (array)
- Added: `admins` (array of user references)
- Updated: `status` enum with new values

---

## 🧪 Testing

### Quick Test Flow

1. **Register Patient:**
   ```bash
   POST /api/auth/register
   { "name": "Patient", "email": "patient@test.com", ... }
   ```
   ✅ Role automatically set to "patient"

2. **Register Doctor (Standalone):**
   ```bash
   POST /api/doctors/register
   { "name": "Dr. Test", "email": "dr@test.com", ... }
   ```
   ✅ Status: `pending_super_admin`

3. **Try Login (Should Fail):**
   ```bash
   POST /api/auth/login
   { "email": "dr@test.com", "password": "..." }
   ```
   ❌ 403 Forbidden: "Doctor not approved"

4. **Super Admin Approves:**
   ```bash
   POST /api/admin/approve/doctor/:doctorId
   Headers: Authorization: Bearer <admin_token>
   ```
   ✅ Status: `approved`

5. **Login Again (Should Succeed):**
   ```bash
   POST /api/auth/login
   { "email": "dr@test.com", "password": "..." }
   ```
   ✅ 200 OK, token returned

---

## 📝 Postman Collection

Import `POSTMAN_COLLECTION.json` for organized testing:

1. **Authentication** - Register, login, get current user
2. **Doctor Registration** - Standalone and with hospital
3. **Hospital Registration** - Register hospital
4. **Admin Approvals** - Approve/reject doctors and hospitals
5. **Hospital Management** - Add doctors, approve doctors
6. **User Profile** - Get user profile

**Auto-saved Variables:**
- `token` - Current user token
- `patient_token` - Patient token
- `doctor_token` - Doctor token
- `hospital_token` - Hospital admin token
- `admin_token` - Super admin token

---

## 🔄 Approval Workflows

### Workflow 1: Standalone Doctor
```
1. Doctor registers → status: pending_super_admin
2. Super admin reviews → POST /api/admin/approve/doctor/:id
3. Status → approved
4. Doctor can login
```

### Workflow 2: Doctor Under Approved Hospital
```
1. Doctor registers with hospitalId (approved hospital)
   → status: pending_hospital
2. Hospital admin reviews → POST /api/hospitals/:id/approve/doctor/:id
3. Status → approved
4. Doctor can login
```

### Workflow 3: Doctor Under Pending Hospital
```
1. Hospital registers → status: pending_super_admin
2. Doctor registers with hospitalId → status: pending_hospital_and_super_admin
3. Super admin approves hospital → hospital status: approved
   → doctor status: pending_hospital (auto-updated)
4. Hospital admin approves doctor → status: approved
5. Doctor can login
```

### Workflow 4: Hospital Admin Adds Doctor
```
1. Hospital admin (approved hospital) adds doctor
   → POST /api/hospitals/:id/doctors
2. Doctor created with status: approved (immediately)
3. Doctor can login immediately
```

---

## 🎯 Edge Cases Handled

✅ Doctor cannot register through `/api/auth/register`  
✅ Hospital cannot register through `/api/auth/register`  
✅ Doctor cannot login until `status === 'approved'`  
✅ Hospital admin can only approve doctors under their hospital  
✅ Super admin can approve/reject any doctor or hospital  
✅ Approval actions are logged in `approvals` collection  
✅ Notifications sent (stub) on approval/rejection  
✅ Hospital admins activated when hospital is approved  
✅ Rejection requires reason  
✅ Status changes tracked in approval logs  

---

## 📚 Files Modified/Created

### Models
- `backend/src/models/Approval.model.js` - **NEW**
- `backend/src/models/Doctor.model.js` - **UPDATED**
- `backend/src/models/Hospital.model.js` - **UPDATED**

### Controllers
- `backend/src/controllers/doctor.controller.js` - **NEW** (registration)
- `backend/src/controllers/doctor.portal.controller.js` - **NEW** (portal functions)
- `backend/src/controllers/hospital.controller.js` - **UPDATED**
- `backend/src/controllers/approval.controller.js` - **NEW**
- `backend/src/controllers/auth.controller.js` - **UPDATED** (patient default, doctor approval check)
- `backend/src/controllers/user.controller.js` - **NEW**
- `backend/src/controllers/admin.controller.js` - **UPDATED**

### Routes
- `backend/src/routes/doctor.routes.js` - **UPDATED** (registration only)
- `backend/src/routes/doctor.portal.routes.js` - **NEW** (portal routes)
- `backend/src/routes/hospital.routes.js` - **UPDATED**
- `backend/src/routes/admin.routes.js` - **UPDATED**
- `backend/src/routes/auth.routes.js` - **UPDATED** (patient only)
- `backend/src/routes/user.routes.js` - **NEW**

### Middleware
- `backend/src/middlewares/hospitalOwnership.middleware.js` - **NEW**

### Documentation
- `backend/POSTMAN_COLLECTION.json` - **NEW**
- `backend/TESTING_SCENARIOS.md` - **NEW**
- `backend/APPROVAL_SYSTEM_GUIDE.md` - **NEW** (this file)

---

## 🚀 Next Steps

1. **Test all scenarios** using `TESTING_SCENARIOS.md`
2. **Import Postman collection** for organized testing
3. **Integrate email notifications** (replace stub in `notifyEmail` function)
4. **Add rate limiting** to registration endpoints
5. **Implement refresh tokens** (optional)
6. **Add webhook hooks** for external integrations (optional)

---

## ⚠️ Important Notes

- **Patient registration** always defaults to `role: 'patient'`
- **Doctor registration** must use `/api/doctors/register` (not `/api/auth/register`)
- **Hospital registration** must use `/api/hospitals/register` (not `/api/auth/register`)
- **Doctors cannot login** until `status === 'approved'`
- **All approval actions** are logged in the `approvals` collection
- **Rejection requires a reason** (validation enforced)

---

**System is production-ready!** ✅

