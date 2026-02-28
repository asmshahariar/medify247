# MongoDB Connection Fix Guide

## Issues Fixed

1. ✅ Removed deprecated options (`useNewUrlParser`, `useUnifiedTopology`)
2. ✅ Fixed duplicate index warning on Order model
3. ✅ Added automatic reconnection logic
4. ✅ Better error handling

## Step 1: Create .env File

Create a `.env` file in the `backend` directory:

```bash
cd backend
copy env_template.txt .env
```

Or create manually:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database - MongoDB Atlas
MONGO_URI=mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=165659424529151
CLOUDINARY_API_SECRET=CF3tNTVHfsOqReb-lFjYX6XUQqo

# OTP Configuration (Simulation)
OTP_SECRET=your_otp_secret_key

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Upload Configuration
MAX_FILE_SIZE=5242880
```

## Step 2: Verify MongoDB Atlas Connection String

### Option A: Use Connection String from Atlas Dashboard

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<database>` with `medify247`

### Option B: Fix Current Connection String

If the password contains special characters, URL-encode them:

**Special characters to encode:**
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`
- `[` → `%5B`
- `]` → `%5D`

### Current Connection String Format:
```
mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247?retryWrites=true&w=majority
```

## Step 3: Check MongoDB Atlas Network Access

1. Go to MongoDB Atlas Dashboard
2. Click "Network Access" in left sidebar
3. Make sure your IP is whitelisted OR
4. Click "Add IP Address" → "Allow Access from Anywhere" (0.0.0.0/0)

**⚠️ Warning:** Allowing from anywhere is for development only!

## Step 4: Check Database User

1. Go to "Database Access" in MongoDB Atlas
2. Verify user `medify247project_db_user` exists
3. Check that the password is correct
4. User should have "Atlas Admin" or "Read and write to any database" role

## Step 5: Test Connection

Try these connection string formats:

### Format 1: Current (recommended)
```
mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247?retryWrites=true&w=majority
```

### Format 2: With SSL explicitly
```
mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247?retryWrites=true&w=majority&ssl=true
```

### Format 3: Simplified
```
mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247
```

## Step 6: Install Dependencies

Make sure all packages are installed:

```bash
cd backend
npm install
```

## Step 7: Start Server

```bash
npm start
```

The server will now:
- Retry connection if it fails
- Not exit immediately on error
- Show better error messages
- Auto-reconnect if disconnected

## Troubleshooting

### Error: "ReplicaSetNoPrimary"
**Solution:** 
- Check if cluster is running in Atlas dashboard
- Verify connection string is correct
- Try restarting the cluster in Atlas

### Error: "SSL/TLS error"
**Solution:**
- MongoDB Atlas requires SSL
- Make sure connection string starts with `mongodb+srv://`
- Check network/firewall settings

### Error: "Authentication failed"
**Solution:**
- Verify username and password in Atlas
- Check database user permissions
- URL-encode special characters in password

### Server keeps stopping
**Fixed!** The server now retries connection instead of exiting.

## Test Connection Manually

You can test the connection with MongoDB Compass:
1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Use the connection string from Atlas
3. Test connection there first

## Next Steps

Once connected:
1. Server should show: `✅ MongoDB connected`
2. Test health endpoint: `GET http://localhost:5000/health`
3. Test API endpoints with Postman

## Still Having Issues?

1. Double-check MongoDB Atlas:
   - Cluster is running (not paused)
   - Network access allows your IP
   - Database user exists and password is correct

2. Try connection string from Atlas dashboard:
   - It's guaranteed to be correct format
   - Just replace password and database name

3. Check server logs for specific error messages

4. Verify .env file is in the correct location: `backend/.env`
