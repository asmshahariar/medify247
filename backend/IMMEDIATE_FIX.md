# 🚨 IMMEDIATE FIX for SSL Error

Your error: `ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR`

## ⚡ Quick Fix (Do These in Order)

### Step 1: Check MongoDB Atlas Network Access

**CRITICAL - This fixes 90% of SSL errors:**

1. Go to: https://cloud.mongodb.com/
2. Login to your account
3. Click **"Network Access"** (left sidebar)
4. Click **"Add IP Address"**
5. Select **"Allow Access from Anywhere"** 
6. Enter: `0.0.0.0/0`
7. Click **"Confirm"**
8. **WAIT 2-3 MINUTES** for changes to take effect

### Step 2: Get Fresh Connection String

1. In Atlas dashboard, click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Select **"Node.js"** → Version **"5.5 or later"**
4. **Copy the connection string**
5. It will look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace:
   - `<username>` → `medify247project_db_user`
   - `<password>` → `3u6fK2pdWon95y52`
   - `<database>` → Add `/medify247` after `.net/`

### Step 3: Update .env File

Open `backend/.env` and update:

```env
MONGO_URI=mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247?retryWrites=true&w=majority
```

**OR try simplified version:**
```env
MONGO_URI=mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247
```

### Step 4: Verify Node.js Version

```bash
node --version
```

**Should be:** v18.x.x or v20.x.x

**If not, update Node.js:**
- Download: https://nodejs.org/
- Install latest LTS version
- Restart terminal/IDE

### Step 5: Test Connection

```bash
cd backend
npm run test:connection
```

### Step 6: Start Server

```bash
npm start
```

## 🔍 Still Getting SSL Error?

### Try Alternative Connection String Format:

```env
MONGO_URI=mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247?retryWrites=true&w=majority&ssl=true&tlsAllowInvalidCertificates=false
```

### Check Your Password for Special Characters:

If password has special chars like `@`, `:`, `/`, they need URL encoding:
- `@` = `%40`
- `:` = `%3A`
- `/` = `%2F`

### Verify Database User:

1. Atlas → **Database Access**
2. Find user: `medify247project_db_user`
3. Click **"Edit"**
4. Verify password matches
5. User should have **"Atlas Admin"** role

### Check Cluster Status:

1. Atlas → **Clusters**
2. Make sure cluster is **RUNNING** (green)
3. If paused (gray), click **"Resume"**
4. Wait for cluster to start

## ✅ Expected Output (Success)

After fixing, when you run `npm start`, you should see:

```
✅ MongoDB connected
🚀 Server running on port 5000
📱 Environment: development
```

## 🧪 Test API

Once connected:

```bash
# Health check
curl http://localhost:5000/health
```

Or in Postman:
```
GET http://localhost:5000/health
```

Should return:
```json
{"status":"OK","message":"Medify247 API is running"}
```

## 📞 Still Not Working?

1. **Verify Network Access is set to 0.0.0.0/0** (most important!)
2. **Wait 3-5 minutes** after changing Network Access
3. **Get connection string directly from Atlas dashboard** (don't modify it)
4. **Check if cluster is running** (not paused)
5. **Update Node.js to latest LTS**

---

**The Network Access setting is the #1 cause of SSL errors. Make sure it's set to allow from anywhere!**

