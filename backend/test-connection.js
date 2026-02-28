import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/medify247';
    
    console.log('🔍 Testing MongoDB connection...');
    console.log('📍 Connection string:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide password
    
    const options = {
      serverSelectionTimeoutMS: 30000, // Increased for SSL handshake
      socketTimeoutMS: 45000,
      retryWrites: true,
      // SSL is automatic with mongodb+srv:// but we can be explicit
    };

    await mongoose.connect(mongoURI, options);
    console.log('✅ MongoDB connection successful!');
    console.log('📊 Connected to:', mongoose.connection.host);
    console.log('🗄️  Database:', mongoose.connection.name);
    
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection failed!');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.reason) {
      console.error('Reason:', error.reason.message || error.reason);
    }
    
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Check if .env file exists in backend directory');
    console.log('2. Verify MONGO_URI in .env file');
    console.log('3. Check MongoDB Atlas Network Access settings');
    console.log('4. Verify database user credentials');
    console.log('5. Make sure cluster is running (not paused)');
    
    process.exit(1);
  }
};

testConnection();
