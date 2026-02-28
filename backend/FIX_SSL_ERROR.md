# Fix SSL/TLS Error: ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR

This error occurs when connecting to MongoDB Atlas. Here are the solutions:

## 🔥 QUICK FIX (Try This First!)

### Option 1: Simplify Connection String

In your `.env` file, use this simplified connection string:

```env
MONGO_URI=mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247
```

**Remove all query parameters** (`?retryWrites=true&w=majority`) and try just the base URL first.

### Option 2: Get Fresh Connection String from Atlas

1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com/)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select **"Node.js"** and version **"5.5 or later"**
5. Copy the connection string
6. Replace `<password>` with: `3u6fK2pdWon95y52`
7. Replace `<database>` with: `medify247`

Use that exact string in your `.env` file.

## 🔧 Solution 1: Update Node.js Version

The SSL error might be due to outdated Node.js/OpenSSL:

1. **Check your Node.js version:**
   ```bash
   node --version
   ```
   Should be **18.x** or **20.x** (LTS)

2. **If outdated, update:**
   - Download from: https://nodejs.org/
   - Install the latest LTS version
   - Restart your terminal/IDE

3. **Reinstall dependencies:**
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

## 🔧 Solution 2: Fix Connection String Format

### Current (might be causing issue):
```
mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247?retryWrites=true&w=majority
```

### Try These Variations:

**Format 1 (Simplified):**
```
MONGO_URI=mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247
```

**Format 2 (With options):**
```
MONGO_URI=mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247?retryWrites=true&w=majority&ssl=true
```

**Format 3 (URL encoded password - if password has special chars):**
If your password has special characters, URL-encode them:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`

## 🔧 Solution 3: Check MongoDB Atlas Settings

### 1. Network Access (MOST IMPORTANT!)

1. Go to MongoDB Atlas → **Network Access**
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**
5. **Wait 1-2 minutes** for changes to propagate

### 2. Database User

1. Go to **Database Access**
2. Verify user: `medify247project_db_user`
3. Verify password: `3u6fK2pdWon95y52`
4. User should have **"Atlas Admin"** or **"Read and write to any database"** role

### 3. Cluster Status

- Make sure cluster is **running** (not paused)
- If paused, click **"Resume"**
- Wait for cluster to start

## 🔧 Solution 4: Windows-Specific Fixes

If you're on Windows:

1. **Check Windows Firewall:**
   - Allow Node.js through firewall
   - Temporarily disable to test

2. **Check Antivirus:**
   - Add Node.js as exception
   - Temporarily disable to test

3. **Check Proxy Settings:**
   ```bash
   # Set these if behind proxy
   set HTTP_PROXY=
   set HTTPS_PROXY=
   ```

4. **Try Different Network:**
   - Use mobile hotspot
   - Use different WiFi network

## 🔧 Solution 5: Use Standard Connection (Not SRV)

If `mongodb+srv://` keeps failing, get the standard connection string:

1. In Atlas → Connect → Choose **"Connect with MongoDB Compass"**
2. Copy the connection string (will look like: `mongodb://...`)
3. Update it with your credentials
4. Use in `.env` file

## ✅ Step-by-Step Fix Process

1. **Get fresh connection string from Atlas dashboard**
2. **Update `.env` file with simplified connection string**
3. **Check Network Access allows 0.0.0.0/0**
4. **Verify Node.js version is 18+ or 20+**
5. **Test connection:**
   ```bash
   npm run test:connection
   ```
6. **If still failing, try standard connection format**

## 🧪 Test After Each Change

After making any change, test:

```bash
cd backend
npm run test:connection
```

This will show you exactly what's failing.

## 📝 Most Common Fix

**99% of SSL errors are fixed by:**

1. ✅ Getting connection string directly from Atlas dashboard
2. ✅ Making sure Network Access allows 0.0.0.0/0
3. ✅ Using Node.js 18+ or 20+
4. ✅ Using simplified connection string without extra params

## 🆘 Still Not Working?

Try this exact format (copy-paste into `.env`):

```env
MONGO_URI=mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247?retryWrites=true&w=majority
```

Then:
1. Delete `node_modules` folder
2. Run `npm install` again
3. Run `npm run test:connection`

