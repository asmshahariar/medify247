# Step-by-Step Fix for Connection Issues

## 🔧 What Was Fixed

1. ✅ Removed deprecated MongoDB options causing warnings
2. ✅ Fixed duplicate index error on Order model
3. ✅ Added automatic reconnection (server won't stop)
4. ✅ Better error messages for debugging

## 📝 Steps to Fix Your Connection

### Step 1: Create .env File

**Windows:**
```bash
cd backend
copy env_template.txt .env
```

**Mac/Linux:**
```bash
cd backend
cp env_template.txt .env
```

### Step 2: Verify MongoDB Atlas Settings

1. **Go to MongoDB Atlas Dashboard:** https://cloud.mongodb.com/
2. **Check Network Access:**
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
   
3. **Verify Database User:**
   - Click "Database Access" in left sidebar
   - Find user: `medify247project_db_user`
   - Verify password is: `3u6fK2pdWon95y52`
   - If user doesn't exist, create it with "Atlas Admin" role

4. **Check Cluster Status:**
   - Make sure cluster is running (not paused)
   - If paused, click "Resume"

### Step 3: Update Connection String (If Needed)

Open `backend/.env` and verify this line:

```env
MONGO_URI=mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247?retryWrites=true&w=majority
```

**OR get it from Atlas:**
1. In Atlas dashboard, click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with `3u6fK2pdWon95y52`
5. Replace `<database>` with `medify247`

### Step 4: Test Connection

```bash
cd backend
npm run test:connection
```

This will test the connection without starting the full server.

**Expected output if successful:**
```
🔍 Testing MongoDB connection...
✅ MongoDB connection successful!
📊 Connected to: cluster0.dgbx3hj.mongodb.net
🗄️  Database: medify247
✅ Connection closed successfully
```

**If it fails**, check the error message and follow the troubleshooting tips.

### Step 5: Start Server

```bash
npm start
```

**Expected output:**
```
✅ MongoDB connected
🚀 Server running on port 5000
📱 Environment: development
```

## 🧪 Test the API

Once server is running:

1. **Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"OK","message":"Medify247 API is running"}`

2. **In Postman:**
   - Create GET request: `http://localhost:5000/health`
   - Send request
   - Should get 200 OK response

## 🐛 Common Issues & Solutions

### Issue 1: "Couldn't connect to server" in Postman
**Solution:**
- Make sure server is running (check terminal)
- Verify port is 5000 (check `PORT` in .env)
- Try: `curl http://localhost:5000/health` first

### Issue 2: Server stops immediately
**Fixed!** Server now retries connection instead of exiting.

### Issue 3: MongoDB connection error
**Solutions:**
- Run `npm run test:connection` to see detailed error
- Check MongoDB Atlas Network Access (allow 0.0.0.0/0)
- Verify database user credentials
- Make sure cluster is running (not paused)

### Issue 4: SSL/TLS error
**Solution:**
- MongoDB Atlas requires SSL
- Connection string must start with `mongodb+srv://`
- Check network/firewall isn't blocking

## ✅ Verification Checklist

- [ ] .env file exists in `backend/` directory
- [ ] MONGO_URI is set correctly in .env
- [ ] MongoDB Atlas Network Access allows your IP (or 0.0.0.0/0)
- [ ] Database user exists in Atlas
- [ ] Cluster is running (not paused)
- [ ] `npm run test:connection` succeeds
- [ ] `npm start` shows "✅ MongoDB connected"
- [ ] Health endpoint works: `http://localhost:5000/health`

## 🎯 Quick Commands

```bash
# Test connection only
cd backend
npm run test:connection

# Start server
npm start

# Start with auto-reload (development)
npm run dev

# Create super admin (after connection works)
npm run seed
```

## 📞 Still Having Issues?

1. Check MongoDB Atlas dashboard - cluster must be running
2. Run `npm run test:connection` to see exact error
3. Verify .env file is in correct location: `backend/.env`
4. Check terminal output for specific error messages
5. Make sure no other application is using port 5000

---

**Once connection works, you can test all APIs! 🚀**
