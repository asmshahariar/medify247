# ⚠️ IMPORTANT: Restart Backend Server

## The userId index has been fixed, but you MUST restart your backend server!

### Why?
- The database index has been updated
- The code has been updated to not set `userId` (leaves it undefined)
- But the running server still has the old model/connection cached

### How to Restart:

1. **Stop the current server:**
   - Press `Ctrl+C` in the terminal where the server is running
   - Or kill the process

2. **Start the server again:**
   ```bash
   cd backend
   npm start
   ```
   Or for development:
   ```bash
   npm run dev
   ```

3. **Test doctor registration:**
   ```json
   POST http://localhost:5000/api/doctors/register
   {
     "name": "Dr. adil leuri",
     "email": "dr.adil334@test.com",
     "phone": "+12345678237",
     "password": "password123",
     "medicalLicenseNumber": "ML004542",
     "licenseDocumentUrl": "https://example.com/license.pdf",
     "specialization": ["Cardiology"],
     "qualifications": "MBBS",
     "experienceYears": 30
   }
   ```

### What Was Fixed:

1. ✅ Database index: `userId_1` is now sparse and unique (allows multiple undefined/null)
2. ✅ Model: Removed `default: null` from userId field
3. ✅ Controllers: Don't set `userId` at all (leaves it undefined)

### After Restart:

The error should be completely resolved. Doctors will be created in the `doctors` table only, with no `userId` field set.

---

**Restart your server now and try again!** 🚀

