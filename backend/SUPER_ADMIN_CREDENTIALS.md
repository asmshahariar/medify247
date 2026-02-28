# 🔐 Super Admin Credentials

## ✅ Super Admin Created Successfully!

The super admin account has been created in your database.

### Login Credentials:

```
📧 Email: admin@medify247.com
🔑 Password: admin123
👤 Role: super_admin
```

---

## 🚀 How to Login

### Option 1: Using Postman/API

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@medify247.com",
  "password": "admin123"
}
```

**Response:**
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

### Option 2: Using cURL

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medify247.com","password":"admin123"}'
```

---

## 🔑 Using the Token

After login, copy the `token` from the response and use it in subsequent requests:

```bash
Authorization: Bearer <your_token_here>
```

### Example: Get Pending Items

```bash
GET http://localhost:5000/api/admin/pending
Authorization: Bearer <your_token_here>
```

---

## 🎯 Super Admin Capabilities

As a super admin, you can:

1. **View Pending Items:**
   - `GET /api/admin/pending` - List all pending doctors and hospitals

2. **Approve/Reject Doctors:**
   - `POST /api/admin/approve/doctor/:doctorId` - Approve standalone doctor
   - `POST /api/admin/reject/doctor/:doctorId` - Reject doctor (with reason)

3. **Approve/Reject Hospitals:**
   - `POST /api/admin/approve/hospital/:hospitalId` - Approve hospital
   - `POST /api/admin/reject/hospital/:hospitalId` - Reject hospital (with reason)

4. **Dashboard Analytics:**
   - `GET /api/admin/dashboard/stats` - View platform statistics

5. **CMS Management:**
   - `POST /api/admin/banners` - Create banners
   - `GET /api/admin/banners` - List banners
   - `PUT /api/admin/banners/:id` - Update banners

6. **Broadcast Notifications:**
   - `POST /api/admin/notifications/broadcast` - Send broadcast notifications

7. **Data Export:**
   - `GET /api/admin/export` - Export data (CSV/XLS)

---

## ⚠️ Security Warning

**IMPORTANT:** Change the password immediately after first login!

The default password `admin123` is for initial setup only. For production, you should:

1. Login with the default credentials
2. Change the password through your admin panel (if implemented)
3. Or update directly in the database

---

## 🔄 Re-run Seed Script

If you need to create the super admin again (or if it was deleted):

```bash
cd backend
npm run seed
```

**Note:** The script will check if a super admin already exists and skip creation if found.

---

## 📝 Quick Test

Test the super admin login:

```bash
# 1. Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medify247.com","password":"admin123"}'

# 2. Save token from response, then:
TOKEN="<paste_token_here>"

# 3. Get pending items
curl -X GET http://localhost:5000/api/admin/pending \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 Next Steps

1. ✅ Super admin created
2. ✅ Login with credentials above
3. ✅ Test approval endpoints
4. ✅ Approve pending doctors/hospitals
5. ⚠️ Change password for security

---

**Super admin is ready to use!** 🚀
