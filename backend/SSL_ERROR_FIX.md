# Fix for SSL/TLS Error (ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR)

This error occurs when connecting to MongoDB Atlas due to SSL/TLS handshake issues.

## 🔧 Solution 1: Update Connection String with SSL Options

Update your `.env` file's `MONGO_URI` to explicitly set SSL options:

### Current (causing error):
```
MONGO_URI=mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247?retryWrites=true&w=majority
```

### Fixed Version 1 (Add tls options):
```
MONGO_URI=mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247?retryWrites=true&w=majority&tls=true&tlsAllowInvalidCertificates=false
```

### Fixed Version 2 (Simplified - Try this first):
```
MONGO_URI=mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247
```

## 🔧 Solution 2: Update Connection Code

Update `server.js` to handle SSL properly for Windows:

```javascript
// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/medify247';
    
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      // SSL/TLS options for MongoDB Atlas
      ssl: true,
      sslValidate: true,
      // Windows-specific SSL fixes
      tls: true,
      tlsAllowInvalidCertificates: false,
    };

    await mongoose.connect(mongoURI, options);
    // ... rest of code
  } catch (err) {
    // ... error handling
  }
};
```

## 🔧 Solution 3: Use Standard Connection String Format

Try using the standard format from MongoDB Atlas dashboard:

1. Go to MongoDB Atlas → Connect → Connect your application
2. Copy the connection string
3. Replace `<password>` with your password
4. Replace `<database>` with `medify247`

Format should be:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

## 🔧 Solution 4: Update Node.js/OpenSSL

The error might be due to outdated Node.js or OpenSSL:

1. **Update Node.js:**
   - Download latest LTS version from https://nodejs.org/
   - Current recommended: Node.js 18.x or 20.x

2. **Check Node.js version:**
   ```bash
   node --version
   ```

3. **Reinstall dependencies:**
   ```bash
   cd backend
   rm -rf node_modules package-lock.json
   npm install
   ```

## 🔧 Solution 5: Use Alternative Connection Method

If `mongodb+srv://` doesn't work, try standard connection:

```env
MONGO_URI=mongodb://medify247project_db_user:3u6fK2pdWon95y52@cluster0-shard-00-00.dgbx3hj.mongodb.net:27017,cluster0-shard-00-01.dgbx3hj.mongodb.net:27017,cluster0-shard-00-02.dgbx3hj.mongodb.net:27017/medify247?ssl=true&replicaSet=atlas-xxx&authSource=admin&retryWrites=true&w=majority
```

**Note:** Get the replica set connection string from Atlas dashboard.

## 🔧 Solution 6: Check Network/Firewall

1. **Check if proxy is interfering:**
   - Disable proxy temporarily
   - Try different network (mobile hotspot)

2. **Check Windows Firewall:**
   - Allow Node.js through firewall
   - Temporarily disable firewall to test

3. **Check Antivirus:**
   - Add exception for Node.js
   - Temporarily disable to test

## 🔧 Solution 7: MongoDB Atlas Settings

1. **Check Cluster Configuration:**
   - Go to Atlas → Clusters
   - Verify cluster is running
   - Check if using M0 (free tier) - might have connection limits

2. **Network Access:**
   - Go to Network Access
   - Add IP: `0.0.0.0/0` (allow all for testing)
   - Wait 1-2 minutes after adding

3. **Database User:**
   - Verify user exists
   - Check password is correct
   - Verify user has proper roles

## ✅ Quick Fix Steps

1. **Try simplified connection string first:**
   ```
   MONGO_URI=mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247
   ```

2. **Update Node.js to latest LTS version**

3. **Get fresh connection string from Atlas dashboard**

4. **Test with `npm run test:connection`**

5. **If still failing, try Solution 5 (standard connection)**

## 🧪 Test Connection

After making changes:

```bash
cd backend
npm run test:connection
```

This will show if the SSL issue is resolved.

## 📝 Most Likely Fix

**90% of the time, this works:**

1. Get connection string directly from MongoDB Atlas dashboard
2. Use simplified format without extra query parameters
3. Make sure you're using Node.js 18+ or 20+
4. Verify network access allows your IP

Try this connection string format:
```
mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247
```

Remove all query parameters first, then add them back if needed.

