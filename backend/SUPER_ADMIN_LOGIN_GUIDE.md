# Super Admin Login Guide

## Step 1: Create Super Admin Account (If Not Exists)

Run the seed script to create the super admin account:

```bash
npm run seed
```

**Expected Output:**
```
✅ Connected to MongoDB
✅ Super admin created successfully!
📧 Email: admin@medify247.com
🔑 Password: admin123
⚠️  Please change the password after first login!
```

**Note:** If super admin already exists, you'll see:
```
⚠️  Super admin already exists
```

---

## Step 2: Login as Super Admin

### Endpoint
```
POST http://localhost:5000/api/auth/login
```

### Request Body
```json
{
  "email": "admin@medify247.com",
  "password": "admin123"
}
```

### Complete Request Example

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@medify247.com",
    "password": "admin123"
  }'
```

**Using Postman/Thunder Client:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Headers: `Content-Type: application/json`
- Body (JSON):
```json
{
  "email": "admin@medify247.com",
  "password": "admin123"
}
```

---

## Step 3: Get Response

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Super Admin",
      "email": "admin@medify247.com",
      "phone": "1234567890",
      "role": "super_admin",
      "profileImage": null
    },
    "roleData": null,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Save the `token` from the response!**

---

## Step 4: Use Token for Admin Endpoints

After login, use the token in the `Authorization` header for all admin endpoints:

```
Authorization: Bearer <your_token_here>
```

### Example: Get Pending Items

```bash
GET http://localhost:5000/api/admin/pending
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔑 Default Super Admin Credentials

```
📧 Email: admin@medify247.com
🔑 Password: admin123
👤 Role: super_admin
```

**⚠️ IMPORTANT:** Change the password after first login for security!

---

## 🧪 Quick Test

### 1. Create Super Admin (if needed)
```bash
npm run seed
```

### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medify247.com","password":"admin123"}'
```

### 3. Copy the token and test an admin endpoint
```bash
# Replace TOKEN with the token from login response
curl -X GET http://localhost:5000/api/admin/pending \
  -H "Authorization: Bearer TOKEN"
```

---

## 📋 Super Admin Capabilities

After login, you can:

1. **View Pending Items:**
   - `GET /api/admin/pending` - List pending doctors and hospitals

2. **Approve/Reject Doctors:**
   - `POST /api/admin/approve/doctor/:doctorId`
   - `POST /api/admin/reject/doctor/:doctorId`

3. **Approve/Reject Hospitals:**
   - `POST /api/admin/approve/hospital/:hospitalId`
   - `POST /api/admin/reject/hospital/:hospitalId`

4. **Dashboard:**
   - `GET /api/admin/dashboard/stats`

5. **Banner Management:**
   - `POST /api/admin/banners`
   - `GET /api/admin/banners`
   - `PUT /api/admin/banners/:bannerId`

6. **Broadcast Notifications:**
   - `POST /api/admin/notifications/broadcast`

7. **Data Export:**
   - `GET /api/admin/export`

---

## ❌ Common Errors

### Error: "Invalid email or password"
- Check if super admin exists: Run `npm run seed`
- Verify email: `admin@medify247.com`
- Verify password: `admin123`

### Error: "Your account is inactive"
- Super admin should be active by default
- Check database if `isActive: true`

### Error: "Super admin already exists"
- This means super admin is already created
- Just login with the credentials above

---

## 🔄 Reset Super Admin

If you need to reset the super admin:

1. Delete the existing super admin from database
2. Run `npm run seed` again

Or manually update in MongoDB:
```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { role: "super_admin" },
  { $set: { password: "$2a$12$..." } } // New hashed password
)
```

---

**Super Admin Login Ready! 🚀**

