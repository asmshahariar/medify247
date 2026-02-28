# Doctor Registration API - Complete Guide

**Base URL:** `http://localhost:5000/api`

**Endpoint:** `POST /api/doctors/register`

**Auth:** ❌ No authentication required (public endpoint)

---

## 📋 Common Fields (Both Scenarios)

All doctor registrations require these fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | ✅ Yes | Doctor's full name |
| `email` | String | ✅ Yes | Valid email address (unique) |
| `phone` | String | ✅ Yes | Phone number (10-15 digits, international format) |
| `password` | String | ✅ Yes | Minimum 8 characters |
| `medicalLicenseNumber` | String | ✅ Yes | Medical license number (unique) |
| `specialization` | String/Array | ✅ Yes | Specialization(s) |
| `experienceYears` | Number | ✅ Yes | Years of experience (>= 0) |
| `consultationFee` | Number | ✅ Yes | Consultation fee (>= 0) |
| `schedule` | Array | ✅ Yes | Schedule array (see format below) |
| `followUpFee` | Number | ❌ Optional | Follow-up fee (default: 0) |
| `reportFee` | Number | ❌ Optional | Report fee (default: 0) |
| `licenseDocumentUrl` | String | ❌ Optional | License document URL |
| `chamberId` | ObjectId | ❌ Optional | Existing chamber ID (must be valid MongoDB ObjectId) |
| `hospitalId` | ObjectId | ❌ Optional | Hospital ID (must be valid MongoDB ObjectId) |

---

## 🏥 Scenario 1: Standalone Doctor (Without Hospital)

### Endpoint
```
POST http://localhost:5000/api/doctors/register
```

### Request Body
```json
{
  "name": "Dr. John Smith",
  "email": "dr.smith@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "medicalLicenseNumber": "MD12345",
  "specialization": ["Cardiology", "Internal Medicine"],
  "experienceYears": 10,
  "consultationFee": 500,
  "followUpFee": 300,
  "reportFee": 200,
  "schedule": [
    {
      "dayOfWeek": 1,
      "timeSlots": [
        {
          "startTime": "09:00",
          "endTime": "12:00",
          "sessionDuration": 15
        },
        {
          "startTime": "14:00",
          "endTime": "17:00",
          "sessionDuration": 15
        }
      ]
    },
    {
      "dayOfWeek": 3,
      "timeSlots": [
        {
          "startTime": "09:00",
          "endTime": "12:00",
          "sessionDuration": 15
        }
      ]
    }
  ]
}
```

**Important:** 
- ❌ **DO NOT** include `hospitalId` field
- ❌ **DO NOT** include `chamberId` if you don't have a valid ObjectId

### Response (201)
```json
{
  "success": true,
  "message": "Doctor registration successful. Status: pending_super_admin",
  "data": {
    "doctor": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Dr. John Smith",
      "email": "dr.smith@example.com",
      "status": "pending_super_admin",
      "medicalLicenseNumber": "MD12345"
    }
  }
}
```

### Approval Flow
```
Registration → status: pending_super_admin 
→ Super Admin Approves → status: approved 
→ Doctor can login
```

---

## 🏥 Scenario 2: Doctor with Hospital

### Endpoint
```
POST http://localhost:5000/api/doctors/register
```

### Request Body (With Approved Hospital)
```json
{
  "name": "Dr. Jane Doe",
  "email": "dr.doe@example.com",
  "phone": "+1987654321",
  "password": "password123",
  "medicalLicenseNumber": "MD67890",
  "specialization": ["Pediatrics"],
  "experienceYears": 5,
  "consultationFee": 400,
  "hospitalId": "507f1f77bcf86cd799439012",
  "schedule": [
    {
      "dayOfWeek": 0,
      "timeSlots": [
        {
          "startTime": "10:00",
          "endTime": "13:00",
          "sessionDuration": 20
        }
      ]
    }
  ]
}
```

**Important:**
- ✅ `hospitalId` must be a **valid MongoDB ObjectId** (24 hex characters)
- ✅ Hospital must exist in database
- ✅ If hospital is approved → status: `pending_hospital`
- ✅ If hospital is not approved → status: `pending_hospital_and_super_admin`

### Response (201) - Hospital Approved
```json
{
  "success": true,
  "message": "Doctor registration successful. Status: pending_hospital",
  "data": {
    "doctor": {
      "id": "507f1f77bcf86cd799439013",
      "name": "Dr. Jane Doe",
      "email": "dr.doe@example.com",
      "status": "pending_hospital",
      "medicalLicenseNumber": "MD67890"
    }
  }
}
```

### Response (201) - Hospital Not Approved
```json
{
  "success": true,
  "message": "Doctor registration successful. Status: pending_hospital_and_super_admin",
  "data": {
    "doctor": {
      "id": "507f1f77bcf86cd799439013",
      "name": "Dr. Jane Doe",
      "email": "dr.doe@example.com",
      "status": "pending_hospital_and_super_admin",
      "medicalLicenseNumber": "MD67890"
    }
  }
}
```

### Approval Flow (Hospital Approved)
```
Registration → status: pending_hospital 
→ Hospital Admin Approves → status: approved 
→ Doctor can login
```

### Approval Flow (Hospital Not Approved)
```
Registration → status: pending_hospital_and_super_admin 
→ Super Admin Approves Hospital → status: pending_hospital 
→ Hospital Admin Approves Doctor → status: approved 
→ Doctor can login
```

---

## 📅 Schedule Format

The `schedule` field is an array of schedule objects:

```json
"schedule": [
  {
    "dayOfWeek": 1,  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    "timeSlots": [
      {
        "startTime": "09:00",      // HH:MM format (24-hour)
        "endTime": "12:00",        // HH:MM format (24-hour)
        "sessionDuration": 15,     // minutes
        "maxPatients": 1          // optional, default: 1
      }
    ]
  }
]
```

### Day of Week Values
- `0` = Sunday
- `1` = Monday
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday

---

## 🔍 How to Get Hospital ID

If you want to register a doctor with a hospital, you need the hospital's `_id`:

### Option 1: Get from Hospital Registration Response
When you register a hospital, the response includes the `hospitalId`:
```json
{
  "data": {
    "hospital": {
      "id": "507f1f77bcf86cd799439012"  // Use this as hospitalId
    }
  }
}
```

### Option 2: Get from Shared Hospitals Endpoint
```bash
GET http://localhost:5000/api/shared/hospitals
```

Response will include hospital IDs:
```json
{
  "success": true,
  "data": {
    "hospitals": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "City General Hospital",
        "status": "approved"
      }
    ]
  }
}
```

---

## ✅ Complete Examples

### Example 1: Standalone Doctor (No Hospital)

```bash
POST http://localhost:5000/api/doctors/register
Content-Type: application/json

{
  "name": "Dr. Robert Johnson",
  "email": "dr.johnson@example.com",
  "phone": "+1122334455",
  "password": "password123",
  "medicalLicenseNumber": "MD11111",
  "specialization": ["Orthopedics"],
  "experienceYears": 15,
  "consultationFee": 600,
  "schedule": [
    {
      "dayOfWeek": 1,
      "timeSlots": [
        {
          "startTime": "08:00",
          "endTime": "11:00",
          "sessionDuration": 15
        }
      ]
    },
    {
      "dayOfWeek": 4,
      "timeSlots": [
        {
          "startTime": "14:00",
          "endTime": "17:00",
          "sessionDuration": 15
        }
      ]
    }
  ]
}
```

### Example 2: Doctor with Hospital

```bash
POST http://localhost:5000/api/doctors/register
Content-Type: application/json

{
  "name": "Dr. Sarah Williams",
  "email": "dr.williams@example.com",
  "phone": "+1555666777",
  "password": "password123",
  "medicalLicenseNumber": "MD22222",
  "specialization": ["Dermatology"],
  "experienceYears": 8,
  "consultationFee": 450,
  "hospitalId": "695e0b8ac639304173ca347f",
  "schedule": [
    {
      "dayOfWeek": 2,
      "timeSlots": [
        {
          "startTime": "09:00",
          "endTime": "13:00",
          "sessionDuration": 20
        }
      ]
    },
    {
      "dayOfWeek": 5,
      "timeSlots": [
        {
          "startTime": "10:00",
          "endTime": "14:00",
          "sessionDuration": 20
        }
      ]
    }
  ]
}
```

---

## 🧪 Testing with cURL

### Standalone Doctor
```bash
curl -X POST http://localhost:5000/api/doctors/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Test Doctor",
    "email": "testdoctor@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "medicalLicenseNumber": "MD99999",
    "specialization": ["General Medicine"],
    "experienceYears": 5,
    "consultationFee": 500,
    "schedule": [
      {
        "dayOfWeek": 1,
        "timeSlots": [
          {
            "startTime": "09:00",
            "endTime": "12:00",
            "sessionDuration": 15
          }
        ]
      }
    ]
  }'
```

### Doctor with Hospital
```bash
curl -X POST http://localhost:5000/api/doctors/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Hospital Doctor",
    "email": "hospitaldoctor@example.com",
    "phone": "+1987654321",
    "password": "password123",
    "medicalLicenseNumber": "MD88888",
    "specialization": ["Cardiology"],
    "experienceYears": 7,
    "consultationFee": 550,
    "hospitalId": "695e0b8ac639304173ca347f",
    "schedule": [
      {
        "dayOfWeek": 1,
        "timeSlots": [
          {
            "startTime": "09:00",
            "endTime": "12:00",
            "sessionDuration": 15
          }
        ]
      }
    ]
  }'
```

---

## ⚠️ Common Errors

### Error: "Invalid hospital ID"
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Invalid hospital ID",
      "path": "hospitalId"
    }
  ]
}
```
**Solution:** 
- Use a valid MongoDB ObjectId (24 hex characters)
- Or **omit** `hospitalId` field entirely for standalone doctor

### Error: "Hospital not found"
```json
{
  "success": false,
  "message": "Hospital not found"
}
```
**Solution:** 
- Verify hospital ID exists
- Check if hospital is registered in database

### Error: "Doctor already exists"
```json
{
  "success": false,
  "message": "Doctor already exists with this email or phone"
}
```
**Solution:** 
- Use different email or phone
- Or check existing doctor records

### Error: "Medical license number already exists"
```json
{
  "success": false,
  "message": "Medical license number already exists"
}
```
**Solution:** 
- Use a different medical license number
- Each license number must be unique

---

## 📊 Status Flow Summary

| Scenario | Initial Status | After Super Admin | After Hospital Admin | Final Status |
|----------|---------------|-------------------|---------------------|--------------|
| Standalone | `pending_super_admin` | `approved` | N/A | `approved` ✅ |
| With Approved Hospital | `pending_hospital` | N/A | `approved` | `approved` ✅ |
| With Pending Hospital | `pending_hospital_and_super_admin` | `pending_hospital` | `approved` | `approved` ✅ |

---

## 🔑 Key Points

1. **Same Endpoint:** Both scenarios use the same endpoint `/api/doctors/register`
2. **Difference:** Include `hospitalId` field for hospital registration, omit for standalone
3. **Validation:** `hospitalId` must be valid ObjectId if provided
4. **Status:** Automatically determined based on hospital status
5. **Approval:** Different approval flows based on scenario

---

## ✅ Quick Checklist

### For Standalone Doctor:
- ✅ Include all required fields
- ✅ Include `schedule` array
- ❌ **DO NOT** include `hospitalId`
- ❌ **DO NOT** include `chamberId` (unless you have valid ObjectId)

### For Doctor with Hospital:
- ✅ Include all required fields
- ✅ Include `schedule` array
- ✅ Include `hospitalId` (valid MongoDB ObjectId)
- ❌ **DO NOT** use placeholder strings like `"optional_hospital_id"`

---

**Ready to test! 🚀**

