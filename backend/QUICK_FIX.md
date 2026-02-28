# Quick Fix for MongoDB Connection

## Immediate Steps

### 1. Create .env file in backend folder

Copy `env_template.txt` to `.env`:

```bash
cd backend
copy env_template.txt .env
```

### 2. Update MongoDB URI in .env

Replace the MONGO_URI with one of these options:

**Option A - Get from Atlas Dashboard (RECOMMENDED):**
1. Go to https://cloud.mongodb.com/
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Copy the connection string
5. Replace `<password>` with: `3u6fK2pdWon95y52`
6. Replace `<database>` with: `medify247`

**Option B - Use this format:**
```
MONGO_URI=mongodb+srv://medify247project_db_user:3u6fK2pdWon95y52@cluster0.dgbx3hj.mongodb.net/medify247
```

### 3. Check MongoDB Atlas Settings

**Network Access:**
- Go to MongoDB Atlas → Network Access
- Add your IP or use `0.0.0.0/0` for development

**Database User:**
- Go to MongoDB Atlas → Database Access
- Verify user exists: `medify247project_db_user`
- Verify password: `3u6fK2pdWon95y52`

### 4. Restart Server

```bash
npm start
```

## What's Fixed

✅ Removed deprecated MongoDB options
✅ Fixed duplicate index warning  
✅ Server won't exit on connection error (retries automatically)
✅ Better error messages

## Expected Output

When working correctly, you should see:
```
✅ MongoDB connected
🚀 Server running on port 5000
📱 Environment: development
```

## Test

```bash
# Health check
curl http://localhost:5000/health
```

Should return:
```json
{"status":"OK","message":"Medify247 API is running"}
```

