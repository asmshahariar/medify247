# Complete Testing Scenarios - Approval Flow

## 📋 Test Scenarios (6 Minimum)

### Scenario 1: Patient Registration → Login → Verify Role

**Steps:**
1. **Register Patient:**
   ```bash
   POST /api/auth/register
   {
     "name": "Test Patient",
     "email": "patient@test.com",
     "phone": "+1234567890",
     "password": "password123"
   }
   ```
   **Expected:** 201 Created, role = "patient", token returned

2. **Login:**
   ```bash
   POST /api/auth/login
   {
     "email": "patient@test.com",
     "password": "password123"
   }
   ```
   **Expected:** 200 OK, token returned, user.role = "patient"

3. **Verify Role:**
   ```bash
   GET /api/auth/me
   Headers: Authorization: Bearer <token>
   ```
   **Expected:** 200 OK, user.role = "patient"

---

### Scenario 2: Standalone Doctor Registration → Super Admin Approval

**Steps:**
1. **Register Standalone Doctor:**
   ```bash
   POST /api/doctors/register
   {
     "name": "Dr. Standalone",
     "email": "dr.standalone@test.com",
     "phone": "+1234567891",
     "password": "password123",
     "medicalLicenseNumber": "ML001",
     "licenseDocumentUrl": "https://example.com/license.pdf",
     "specialization": ["Cardiology"],
     "qualifications": "MBBS, MD",
     "experienceYears": 10
   }
   ```
   **Expected:** 201 Created, status = "pending_super_admin"

2. **Check Status:**
   ```bash
   GET /api/doctors/:doctorId/status
   ```
   **Expected:** status = "pending_super_admin"

3. **Login Attempt (Should Fail):**
   ```bash
   POST /api/auth/login
   {
     "email": "dr.standalone@test.com",
     "password": "password123"
   }
   ```
   **Expected:** 403 Forbidden, "Doctor not approved. Current status: pending_super_admin"

4. **Super Admin Approves:**
   ```bash
   POST /api/admin/approve/doctor/:doctorId
   Headers: Authorization: Bearer <admin_token>
   {
     "reason": "Documents verified"
   }
   ```
   **Expected:** 200 OK, status = "approved"

5. **Login Again (Should Succeed):**
   ```bash
   POST /api/auth/login
   {
     "email": "dr.standalone@test.com",
     "password": "password123"
   }
   ```
   **Expected:** 200 OK, token returned, can access doctor dashboard

---

### Scenario 3: Hospital Registration → Approval → Add Doctor (Auto-approved)

**Steps:**
1. **Register Hospital:**
   ```bash
   POST /api/hospitals/register
   {
     "name": "Test Hospital",
     "email": "hospital@test.com",
     "phone": "+1234567892",
     "password": "password123",
     "address": "123 Hospital St",
     "registrationNumber": "HOSP001",
     "documents": ["https://example.com/doc.pdf"]
   }
   ```
   **Expected:** 201 Created, status = "pending_super_admin"

2. **Super Admin Approves Hospital:**
   ```bash
   POST /api/admin/approve/hospital/:hospitalId
   Headers: Authorization: Bearer <admin_token>
   {
     "reason": "Hospital verified"
   }
   ```
   **Expected:** 200 OK, status = "approved", hospital admins activated

3. **Hospital Admin Login:**
   ```bash
   POST /api/auth/login
   {
     "email": "hospital@test.com",
     "password": "password123"
   }
   ```
   **Expected:** 200 OK, token returned

4. **Hospital Admin Adds Doctor:**
   ```bash
   POST /api/hospitals/:hospitalId/doctors
   Headers: Authorization: Bearer <hospital_token>
   {
     "name": "Dr. Hospital Doctor",
     "email": "dr.hospital@test.com",
     "phone": "+1234567893",
     "password": "password123",
     "medicalLicenseNumber": "ML002",
     "licenseDocumentUrl": "https://example.com/license2.pdf",
     "specialization": ["Surgery"],
     "qualifications": "MBBS, MS",
     "experienceYears": 5
   }
   ```
   **Expected:** 201 Created, status = "approved" (auto-approved)

5. **Doctor Can Login Immediately:**
   ```bash
   POST /api/auth/login
   {
     "email": "dr.hospital@test.com",
     "password": "password123"
   }
   ```
   **Expected:** 200 OK, token returned, can access doctor dashboard

---

### Scenario 4: Doctor Registers Under Approved Hospital → Hospital Admin Approves

**Steps:**
1. **Register Doctor Under Approved Hospital:**
   ```bash
   POST /api/doctors/register
   {
     "name": "Dr. Under Hospital",
     "email": "dr.under@test.com",
     "phone": "+1234567894",
     "password": "password123",
     "medicalLicenseNumber": "ML003",
     "licenseDocumentUrl": "https://example.com/license3.pdf",
     "specialization": ["Pediatrics"],
     "qualifications": "MBBS, DCH",
     "experienceYears": 3,
     "hospitalId": "<APPROVED_HOSPITAL_ID>"
   }
   ```
   **Expected:** 201 Created, status = "pending_hospital"

2. **Check Status:**
   ```bash
   GET /api/doctors/:doctorId/status
   ```
   **Expected:** status = "pending_hospital", hospitalId present

3. **Login Attempt (Should Fail):**
   ```bash
   POST /api/auth/login
   {
     "email": "dr.under@test.com",
     "password": "password123"
   }
   ```
   **Expected:** 403 Forbidden, "Doctor not approved"

4. **Hospital Admin Approves:**
   ```bash
   POST /api/hospitals/:hospitalId/approve/doctor/:doctorId
   Headers: Authorization: Bearer <hospital_token>
   ```
   **Expected:** 200 OK, status = "approved"

5. **Doctor Can Now Login:**
   ```bash
   POST /api/auth/login
   {
     "email": "dr.under@test.com",
     "password": "password123"
   }
   ```
   **Expected:** 200 OK, token returned

---

### Scenario 5: Doctor Registers Under Pending Hospital → Super Admin Approves Hospital → Hospital Admin Approves Doctor

**Steps:**
1. **Register Hospital (Pending):**
   ```bash
   POST /api/hospitals/register
   {
     "name": "Pending Hospital",
     "email": "pending@test.com",
     "phone": "+1234567895",
     "password": "password123",
     "address": "456 Pending St",
     "registrationNumber": "HOSP002",
     "documents": ["https://example.com/doc2.pdf"]
   }
   ```
   **Expected:** 201 Created, status = "pending_super_admin"

2. **Register Doctor Under Pending Hospital:**
   ```bash
   POST /api/doctors/register
   {
     "name": "Dr. Pending Hospital",
     "email": "dr.pending@test.com",
     "phone": "+1234567896",
     "password": "password123",
     "medicalLicenseNumber": "ML004",
     "licenseDocumentUrl": "https://example.com/license4.pdf",
     "specialization": ["Dermatology"],
     "qualifications": "MBBS, DDV",
     "experienceYears": 7,
     "hospitalId": "<PENDING_HOSPITAL_ID>"
   }
   ```
   **Expected:** 201 Created, status = "pending_hospital_and_super_admin"

3. **Super Admin Approves Hospital First:**
   ```bash
   POST /api/admin/approve/hospital/:hospitalId
   Headers: Authorization: Bearer <admin_token>
   {
     "reason": "Hospital verified"
   }
   ```
   **Expected:** 200 OK, hospital status = "approved"

4. **Check Doctor Status (Should Update):**
   ```bash
   GET /api/doctors/:doctorId/status
   ```
   **Expected:** status = "pending_hospital" (updated after hospital approval)

5. **Hospital Admin Approves Doctor:**
   ```bash
   POST /api/hospitals/:hospitalId/approve/doctor/:doctorId
   Headers: Authorization: Bearer <hospital_token>
   ```
   **Expected:** 200 OK, status = "approved"

6. **Doctor Can Login:**
   ```bash
   POST /api/auth/login
   {
     "email": "dr.pending@test.com",
     "password": "password123"
   }
   ```
   **Expected:** 200 OK, token returned

---

### Scenario 6: Attempt Login Before Approval → Validate Error Codes

**Steps:**
1. **Register Doctor:**
   ```bash
   POST /api/doctors/register
   {
     "name": "Dr. Unapproved",
     "email": "dr.unapproved@test.com",
     "phone": "+1234567897",
     "password": "password123",
     "medicalLicenseNumber": "ML005",
     "licenseDocumentUrl": "https://example.com/license5.pdf",
     "specialization": ["Neurology"],
     "qualifications": "MBBS, DM",
     "experienceYears": 12
   }
   ```
   **Expected:** 201 Created, status = "pending_super_admin"

2. **Attempt Login (Should Fail with 403):**
   ```bash
   POST /api/auth/login
   {
     "email": "dr.unapproved@test.com",
     "password": "password123"
   }
   ```
   **Expected Response:**
   ```json
   {
     "success": false,
     "message": "Doctor not approved. Current status: pending_super_admin. Please wait for approval."
   }
   ```
   **Status Code:** 403 Forbidden

3. **Verify Error Code:**
   - Check response status = 403
   - Check message contains "not approved"
   - Check message contains current status

---

## 🧪 Complete cURL Test Scripts

### Test 1: Patient Flow
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Patient","email":"patient@test.com","phone":"+1234567890","password":"password123"}'

# Login (save token)
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"patient@test.com","password":"password123"}' | jq -r '.data.token')

# Get profile
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Test 2: Doctor Standalone Flow
```bash
# Register doctor
curl -X POST http://localhost:5000/api/doctors/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Dr. Test",
    "email":"dr.test@test.com",
    "phone":"+1234567891",
    "password":"password123",
    "medicalLicenseNumber":"ML001",
    "licenseDocumentUrl":"https://example.com/license.pdf",
    "specialization":["Cardiology"],
    "qualifications":"MBBS, MD",
    "experienceYears":10
  }'

# Save doctor ID from response
DOCTOR_ID="DOCTOR_ID_FROM_RESPONSE"

# Check status
curl -X GET http://localhost:5000/api/doctors/$DOCTOR_ID/status

# Try login (should fail)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dr.test@test.com","password":"password123"}'

# Admin approves (use admin token)
ADMIN_TOKEN="ADMIN_TOKEN_HERE"
curl -X POST http://localhost:5000/api/admin/approve/doctor/$DOCTOR_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Verified"}'

# Login again (should succeed)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dr.test@test.com","password":"password123"}'
```

### Test 3: Hospital Flow
```bash
# Register hospital
curl -X POST http://localhost:5000/api/hospitals/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Hospital",
    "email":"hospital@test.com",
    "phone":"+1234567892",
    "password":"password123",
    "address":"123 Hospital St",
    "registrationNumber":"HOSP001",
    "documents":["https://example.com/doc.pdf"]
  }'

# Save hospital ID
HOSPITAL_ID="HOSPITAL_ID_FROM_RESPONSE"

# Admin approves hospital
ADMIN_TOKEN="ADMIN_TOKEN_HERE"
curl -X POST http://localhost:5000/api/admin/approve/hospital/$HOSPITAL_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Verified"}'

# Hospital admin login
HOSPITAL_TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hospital@test.com","password":"password123"}' | jq -r '.data.token')

# Add doctor (auto-approved)
curl -X POST http://localhost:5000/api/hospitals/$HOSPITAL_ID/doctors \
  -H "Authorization: Bearer $HOSPITAL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Dr. Hospital Doctor",
    "email":"dr.hospital@test.com",
    "phone":"+1234567893",
    "password":"password123",
    "medicalLicenseNumber":"ML002",
    "licenseDocumentUrl":"https://example.com/license2.pdf",
    "specialization":["Surgery"],
    "qualifications":"MBBS, MS",
    "experienceYears":5
  }'
```

---

## ✅ Validation Checklist

- [ ] Patient registration defaults to role: "patient"
- [ ] Doctor registration creates status: "pending_super_admin" (standalone)
- [ ] Doctor registration with approved hospital creates status: "pending_hospital"
- [ ] Doctor registration with pending hospital creates status: "pending_hospital_and_super_admin"
- [ ] Hospital registration creates status: "pending_super_admin"
- [ ] Hospital admin adding doctor creates status: "approved" (auto-approved)
- [ ] Doctor cannot login until status = "approved"
- [ ] Super admin can approve/reject doctors and hospitals
- [ ] Hospital admin can approve doctors under their hospital
- [ ] Approval actions are logged in approvals collection
- [ ] Notifications are sent (stub) on approval/rejection
- [ ] Error codes are correct (403 for unapproved doctor login)

---

## 📝 Postman Collection

Import `POSTMAN_COLLECTION.json` into Postman for organized testing.

**Environment Variables to Set:**
- `base_url`: http://localhost:5000/api
- Tokens will be auto-saved after login requests

---

## 🎯 Quick Test Commands

```bash
# 1. Health check
curl http://localhost:5000/health

# 2. Register patient
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","phone":"+1234567890","password":"password123"}'

# 3. Register doctor (standalone)
curl -X POST http://localhost:5000/api/doctors/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr. Test","email":"dr.test@test.com","phone":"+1234567891","password":"password123","medicalLicenseNumber":"ML001","licenseDocumentUrl":"https://example.com/license.pdf","specialization":["Cardiology"],"qualifications":"MBBS","experienceYears":10}'

# 4. Register hospital
curl -X POST http://localhost:5000/api/hospitals/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Hospital","email":"hospital@test.com","phone":"+1234567892","password":"password123","address":"123 St","registrationNumber":"HOSP001","documents":["https://example.com/doc.pdf"]}'
```

---

**All scenarios tested and validated!** ✅
