import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script to verify doctor indexes
 */
const verifyIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medify247', {
      ssl: true,
      tlsAllowInvalidCertificates: true
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('doctors');

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes on doctors collection:');
    indexes.forEach(index => {
      console.log(JSON.stringify(index, null, 2));
    });

    // Check for userId index
    const userIdIndex = indexes.find(idx => idx.key?.userId === 1);
    if (userIdIndex) {
      console.log('\n✅ userId index found:');
      console.log('   - Unique:', userIdIndex.unique);
      console.log('   - Sparse:', userIdIndex.sparse);
      if (userIdIndex.unique && userIdIndex.sparse) {
        console.log('   ✅ Index is correctly configured (unique + sparse)');
      } else {
        console.log('   ⚠️  Index needs to be unique and sparse');
      }
    } else {
      console.log('\n⚠️  userId index not found');
    }

    // Count doctors with null userId
    const nullUserIdCount = await collection.countDocuments({ userId: null });
    console.log(`\n📊 Doctors with userId: null = ${nullUserIdCount}`);
    
    if (nullUserIdCount > 1 && userIdIndex?.unique && !userIdIndex?.sparse) {
      console.log('   ⚠️  Multiple null userIds will cause duplicate key error!');
    } else if (nullUserIdCount > 1 && userIdIndex?.unique && userIdIndex?.sparse) {
      console.log('   ✅ Multiple null userIds are allowed (sparse index)');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

verifyIndexes();

