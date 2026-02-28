import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Force fix userId index - completely remove and recreate
 */
const forceFixUserIdIndex = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medify247', {
      ssl: true,
      tlsAllowInvalidCertificates: true
    });
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('doctors');

    // Get all indexes first
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:');
    indexes.forEach(idx => {
      if (idx.key?.userId) {
        console.log(`   - userId index: ${JSON.stringify(idx)}`);
      }
    });

    // Try to drop userId index with different possible names
    const userIdIndexNames = ['userId_1', 'userId_1_unique', 'userId_1_sparse'];
    
    for (const indexName of userIdIndexNames) {
      try {
        await collection.dropIndex(indexName);
        console.log(`✅ Dropped index: ${indexName}`);
      } catch (error) {
        if (error.code === 27 || error.codeName === 'IndexNotFound') {
          console.log(`ℹ️  Index ${indexName} does not exist, skipping`);
        } else {
          console.log(`⚠️  Error dropping ${indexName}: ${error.message}`);
        }
      }
    }

    // Also try to drop by key pattern
    try {
      await collection.dropIndex({ userId: 1 });
      console.log('✅ Dropped userId index by key pattern');
    } catch (error) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('ℹ️  No userId index found by key pattern');
      } else {
        console.log(`⚠️  Error: ${error.message}`);
      }
    }

    // Wait a moment for index drop to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create new sparse unique index
    try {
      await collection.createIndex({ userId: 1 }, { unique: true, sparse: true, name: 'userId_1_sparse' });
      console.log('✅ Created new sparse unique index on userId');
    } catch (error) {
      console.error('❌ Error creating index:', error.message);
    }

    // Verify the new index
    const newIndexes = await collection.indexes();
    const newUserIdIndex = newIndexes.find(idx => idx.key?.userId === 1);
    
    if (newUserIdIndex) {
      console.log('\n✅ Final userId index:');
      console.log(`   - Unique: ${newUserIdIndex.unique}`);
      console.log(`   - Sparse: ${newUserIdIndex.sparse}`);
      if (newUserIdIndex.unique && newUserIdIndex.sparse) {
        console.log('   ✅ Index is correctly configured!');
      }
    }

    // Count documents with null/undefined userId
    const nullCount = await collection.countDocuments({ userId: null });
    const undefinedCount = await collection.countDocuments({ userId: { $exists: false } });
    console.log(`\n📊 Doctors with userId: null = ${nullCount}`);
    console.log(`📊 Doctors with userId: undefined = ${undefinedCount}`);

    console.log('\n✅ Index fix completed!');
    console.log('⚠️  IMPORTANT: Restart your backend server for changes to take effect!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

forceFixUserIdIndex();

