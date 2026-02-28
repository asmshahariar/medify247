import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from '../src/models/Doctor.model.js';

dotenv.config();

/**
 * Script to fix the bmdcNo unique index issue
 * This will:
 * 1. Drop the old unique index on bmdcNo (if exists)
 * 2. Create a new sparse unique index (allows multiple nulls)
 * 3. Set bmdcNo = medicalLicenseNumber for existing doctors where bmdcNo is null
 */
const fixDoctorIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medify247', {
      ssl: true,
      tlsAllowInvalidCertificates: true
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('doctors');

    // Drop old unique index on bmdcNo if it exists
    try {
      await collection.dropIndex('bmdcNo_1');
      console.log('✅ Dropped old bmdcNo_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index bmdcNo_1 does not exist, skipping drop');
      } else {
        throw error;
      }
    }

    // Drop old unique index on userId if it exists
    try {
      await collection.dropIndex('userId_1');
      console.log('✅ Dropped old userId_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  Index userId_1 does not exist, skipping drop');
      } else {
        throw error;
      }
    }

    // Create sparse unique index on bmdcNo (allows multiple nulls)
    await collection.createIndex({ bmdcNo: 1 }, { unique: true, sparse: true });
    console.log('✅ Created sparse unique index on bmdcNo');

    // Create sparse unique index on userId (allows multiple nulls)
    await collection.createIndex({ userId: 1 }, { unique: true, sparse: true });
    console.log('✅ Created sparse unique index on userId');

    // Update existing doctors: set bmdcNo = medicalLicenseNumber where bmdcNo is null
    const result = await Doctor.updateMany(
      { 
        $or: [
          { bmdcNo: null },
          { bmdcNo: { $exists: false } }
        ],
        medicalLicenseNumber: { $exists: true, $ne: null }
      },
      [
        {
          $set: {
            bmdcNo: '$medicalLicenseNumber'
          }
        }
      ]
    );

    console.log(`✅ Updated ${result.modifiedCount} doctors with bmdcNo = medicalLicenseNumber`);

    console.log('✅ Index fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing index:', error);
    process.exit(1);
  }
};

fixDoctorIndex();
