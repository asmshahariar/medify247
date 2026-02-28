# Doctor Table Migration - Complete

## ✅ Changes Completed

Doctors are now stored **ONLY in the `doctors` table**, not in the `users` table.

### What Changed:

1. **Doctor Model** - Added authentication fields:
   - `name`, `email`, `phone`, `password` fields added
   - Password hashing via pre-save hook
   - `comparePassword` method added
   - `userId` field is now optional (for backward compatibility)

2. **Doctor Registration** - No longer creates User record:
   - `POST /api/doctors/register` creates doctor directly in `doctors` table
   - No User record is created

3. **Hospital Admin Adding Doctor** - No longer creates User record:
   - `POST /api/hospitals/:hospitalId/doctors` creates doctor directly in `doctors` table
   - No User record is created

4. **Login** - Checks Doctor table first:
   - Login checks `doctors` table first for doctor email
   - Falls back to `users` table for patients, hospital admins, super admins
   - Doctors authenticate directly from `doctors` table

5. **Auth Middleware** - Updated to support doctors:
   - Checks `doctors` table first when validating JWT token
   - Falls back to `users` table for other roles
   - Attaches doctor info to `req.user` with `role: 'doctor'`

6. **All Controllers** - Updated to use doctor fields directly:
   - Removed all `doctor.userId` references
   - Using `doctor.email`, `doctor.name`, `doctor.phone` directly
   - Updated approval controllers to use `doctor.email`

---

## 🎯 Result

- ✅ Doctors are stored **ONLY in `doctors` table**
- ✅ No User records created for doctors
- ✅ Doctors can login directly from `doctors` table
- ✅ All authentication works correctly
- ✅ Approval flows still work
- ✅ Backward compatible (userId field optional)

---

## 📝 Testing

Test doctor registration:

```bash
POST /api/doctors/register
{
  "name": "Dr. Test",
  "email": "dr.test@test.com",
  "phone": "+1234567890",
  "password": "password123",
  "medicalLicenseNumber": "ML001",
  ...
}
```

**Result:** Doctor created in `doctors` table only, no entry in `users` table.

Test doctor login:

```bash
POST /api/auth/login
{
  "email": "dr.test@test.com",
  "password": "password123"
}
```

**Result:** Login successful, token generated from `doctor._id`.

---

**Migration Complete!** ✅

