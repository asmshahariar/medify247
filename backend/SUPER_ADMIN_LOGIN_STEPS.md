# Super Admin Login - Step by Step

## ⚠️ Important: Make Sure Server is Running First!

Before testing, ensure your server is running:
```bash
npm run dev
# or
npm start
```

You should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
```

---

## Method 1: Using Postman

1. **Open Postman**
2. **Create New Request:**
   - Method: `POST`
   - URL: `http://localhost:5000/api/auth/login`
   - **Headers Tab:**
     - Key: `Content-Type`
     - Value: `application/json`
   - **Body Tab:**
     - Select: `raw`
     - Select: `JSON` (from dropdown)
     - Paste:
     ```json
     {
       "email": "admin@medify247.com",
       "password": "admin123"
     }
     ```
3. **Click Send**

---

## Method 2: Using Thunder Client (VS Code Extension)

1. **Open VS Code**
2. **Open Thunder Client** (Extension)
3. **Create New Request:**
   - Method: `POST`
   - URL: `http://localhost:5000/api/auth/login`
   - **Headers:**
     - `Content-Type: application/json`
   - **Body:**
     - Select: `JSON`
     - Paste:
     ```json
     {
       "email": "admin@medify247.com",
       "password": "admin123"
     }
     ```
4. **Click Send**

---

## Method 3: Using cURL (Command Line)

**Windows PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@medify247.com","password":"admin123"}'
```

**Windows CMD:**
```cmd
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"admin@medify247.com\",\"password\":\"admin123\"}"
```

**Git Bash / Linux / Mac:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medify247.com","password":"admin123"}'
```

---

## Method 4: Using Browser (JavaScript Console)

Open browser console (F12) and run:
```javascript
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@medify247.com',
    password: 'admin123'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error('Error:', err));
```

---

## Step-by-Step Checklist

### ✅ Step 1: Create Super Admin (If Not Exists)
```bash
npm run seed
```

**Expected Output:**
```
✅ Connected to MongoDB
✅ Super admin created successfully!
📧 Email: admin@medify247.com
🔑 Password: admin123
```

### ✅ Step 2: Start Server
```bash
npm run dev
```

**Expected Output:**
```
✅ MongoDB connected
🚀 Server running on port 5000
```

### ✅ Step 3: Test Login

**Request:**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@medify247.com",
  "password": "admin123"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "...",
      "name": "Super Admin",
      "email": "admin@medify247.com",
      "role": "super_admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 🔧 Troubleshooting

### Error: "URL using bad/illegal format or missing URL"

**Possible Causes:**
1. **Server not running** - Start with `npm run dev`
2. **Wrong URL format** - Use `http://localhost:5000/api/auth/login` (not `https://`)
3. **Port conflict** - Check if port 5000 is available
4. **Tool issue** - Try a different tool (Postman, Thunder Client, cURL)

### Error: "Invalid email or password"

**Solutions:**
1. Run `npm run seed` to create super admin
2. Verify credentials:
   - Email: `admin@medify247.com`
   - Password: `admin123`
3. Check if super admin exists in database

### Error: "ECONNREFUSED" or "Cannot connect"

**Solutions:**
1. Make sure server is running (`npm run dev`)
2. Check if MongoDB is connected
3. Verify `.env` file exists and has correct `MONGO_URI`
4. Check firewall settings

---

## 📝 Complete Test Script

**Save this as `test-login.ps1` (PowerShell):**
```powershell
# Test Super Admin Login
$body = @{
    email = "admin@medify247.com"
    password = "admin123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body

Write-Host "Login Successful!"
Write-Host "Token: $($response.data.token)"
Write-Host "User: $($response.data.user.name) - $($response.data.user.role)"
```

**Run:**
```powershell
.\test-login.ps1
```

---

## ✅ Quick Verification

After successful login, test with the token:

```bash
# Replace TOKEN with actual token from login response
GET http://localhost:5000/api/admin/pending
Authorization: Bearer TOKEN
```

---

**If you're still getting errors, make sure:**
1. ✅ Server is running (`npm run dev`)
2. ✅ Super admin exists (`npm run seed`)
3. ✅ Using correct URL: `http://localhost:5000/api/auth/login`
4. ✅ Using correct method: `POST`
5. ✅ Content-Type header: `application/json`
6. ✅ Correct JSON body format

