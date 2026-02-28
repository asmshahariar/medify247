import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.model.js';

dotenv.config();

const seedSuperAdmin = async () => {
  try {
    // Use same connection options as server.js
    const mongoOptions = {
      ssl: true,
      tlsAllowInvalidCertificates: true // Remove in production
    };
    
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medify247', mongoOptions);
    console.log('✅ Connected to MongoDB');

    // Check if super admin already exists
    const existingAdmin = await User.findOne({ role: 'super_admin' });
    
    if (existingAdmin) {
      console.log('⚠️  Super admin already exists');
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@medify247.com',
      phone: '1234567890',
      password: 'admin123',
      role: 'super_admin',
      isVerified: true,
      isActive: true
    });

    console.log('✅ Super admin created successfully!');
    console.log('📧 Email: admin@medify247.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding super admin:', error);
    process.exit(1);
  }
};

seedSuperAdmin();
