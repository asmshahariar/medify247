# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

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

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASS=

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Upload Configuration
MAX_FILE_SIZE=5242880
```

## Important Notes

1. **Cloudinary Cloud Name**: Replace `your_cloud_name` with your actual Cloudinary cloud name from your Cloudinary dashboard.

2. **MongoDB URI**: The MongoDB Atlas connection string is already configured. Make sure the database name is `medify247`.

3. **JWT Secret**: Change `your_super_secret_jwt_key_change_in_production` to a strong random string for production.

## Getting Your Cloudinary Cloud Name

1. Log in to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Your cloud name is displayed at the top of the dashboard
3. Copy it and replace `your_cloud_name` in the `.env` file

## File Structure

Files uploaded to Cloudinary will be organized as follows:
- `medify247/images/` - Profile images, banners
- `medify247/documents/` - Degrees, certificates, BMDC proofs
- `medify247/reports/` - Diagnostic reports
- `medify247/prescriptions/` - Prescription PDFs
- `medify247/serial-lists/` - Serial list PDFs

