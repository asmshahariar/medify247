# API Testing Examples - Fixed Phone Validation

## ✅ Fixed Phone Number Validation

The phone validation now accepts international format with `+` prefix.

### Valid Phone Formats:
- `+1234567890`
- `+8801712345678`
- `1234567890` (without + also works)
- `01712345678`

### Invalid Formats:
- `12345` (too short)
- `+12345678901234567` (too long)

---

## 📝 Example API Requests

### 1. Register Patient (CORRECTED)

**Endpoint:** `POST http://localhost:5000/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "patient",
  "dateOfBirth": "1990-01-15",
  "gender": "male"
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "role": "patient",
    "dateOfBirth": "1990-01-15",
    "gender": "male"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please verify OTP.",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "role": "patient"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "otp": "123456"
  }
}
```

---

### 2. Register Doctor

**Request Body:**
```json
{
  "name": "Dr. Jane Smith",
  "email": "dr.jane@example.com",
  "phone": "+8801712345678",
  "password": "password123",
  "role": "doctor"
}
```

---

### 3. Register Hospital Admin

**Request Body:**
```json
{
  "name": "Hospital Admin",
  "email": "admin@hospital.com",
  "phone": "+12345678901",
  "password": "password123",
  "role": "hospital_admin"
}
```

---

### 4. Login

**Endpoint:** `POST http://localhost:5000/api/auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "role": "patient"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the token** for authenticated requests!

---

### 5. Get Current User (Authenticated)

**Endpoint:** `GET http://localhost:5000/api/auth/me`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**cURL:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🧪 Testing in Postman

### Step 1: Create a Collection

1. Open Postman
2. Create new collection: "Medify247 API"
3. Create environment: "Local"
   - Variable: `base_url` = `http://localhost:5000/api`
   - Variable: `token` = (will be set automatically)

### Step 2: Test Registration

1. Create new request: "Register Patient"
2. Method: `POST`
3. URL: `{{base_url}}/auth/register`
4. Headers: `Content-Type: application/json`
5. Body (raw JSON):
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "patient"
}


6. Click "Send"
7. **Expected:** 201 Created with token

### Step 3: Auto-save Token

In the "Tests" tab of Register request, add:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    if (response.data && response.data.token) {
        pm.environment.set("token", response.data.token);
        console.log("Token saved!");
    }
}
```

### Step 4: Test Authenticated Request

1. Create new request: "Get Profile"
2. Method: `GET`
3. URL: `{{base_url}}/patient/profile`
4. Headers: `Authorization: Bearer {{token}}`
5. Click "Send"

---

## ✅ Phone Number Examples

### Valid:
- `+1234567890` ✅
- `+8801712345678` ✅ (Bangladesh)
- `1234567890` ✅
- `01712345678` ✅

### Invalid (will show error):
- `12345` ❌ (too short)
- `abc123` ❌ (contains letters)
- `+12345678901234567` ❌ (too long)

---

## 🐛 Common Errors

### Error: "Valid phone number is required"
**Solution:** 
- Make sure phone number starts with `+` for international format
- Or use 10-15 digit number
- No spaces or special characters except `+` at start

### Error: "Validation failed"
**Check:**
- All required fields are present
- Email is valid format
- Password is at least 6 characters
- Role is one of: `patient`, `doctor`, `hospital_admin`

---

## 🎯 Quick Test Script

```bash
# Test registration with international phone
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@test.com",
    "phone": "+1234567890",
    "password": "password123",
    "role": "patient"
  }'
```

**Expected:** 201 Created status

---

The phone validation is now fixed to accept international format! 🎉
