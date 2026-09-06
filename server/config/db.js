import mongoose from 'mongoose';
import dns from 'dns';

// Force IPv4 first DNS lookup for Windows Node.js compatibility
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Ignore fallback if unsupported
}

const reconcilePostIndexes = async (db) => {
  try {
    const posts = db.collection('posts');
    const indexes = await posts.indexes();
    const badTextIndex = indexes.find((index) => (
      index.name === 'text_text_hashtags_1'
      || (index.key?._fts === 'text' && Object.prototype.hasOwnProperty.call(index.key, 'hashtags'))
    ));

    if (badTextIndex) {
      await posts.dropIndex(badTextIndex.name);
      console.log(`Dropped incompatible posts index: ${badTextIndex.name}`);
    }

    await posts.createIndex({ hashtags: 1 }, { background: true });
  } catch (error) {
    if (error.codeName === 'NamespaceNotFound') return;
    console.warn(`Post index reconciliation skipped: ${error.message}`);
  }
};

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI;
  const localUri = 'mongodb://127.0.0.1:27017/insta';

  // Strategy 1: Attempt Primary Atlas URI with short timeout
  if (primaryUri) {
    try {
      console.log('Attempting MongoDB Atlas connection...');
      const conn = await mongoose.connect(primaryUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log(`MongoDB connected: ${conn.connection.host}`);
      await reconcilePostIndexes(conn.connection.db);
      return conn;
    } catch (primaryError) {
      console.warn(`MongoDB Atlas connection skipped (${primaryError.message}). Falling back to local MongoDB...`);
    }
  }

  // Strategy 2: Fallback to local MongoDB (127.0.0.1:27017)
  try {
    console.log('Connecting to local MongoDB (mongodb://127.0.0.1:27017/insta)...');
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`Local MongoDB connected: ${conn.connection.host}`);
    await reconcilePostIndexes(conn.connection.db);
    return conn;
  } catch (localError) {
    console.error(`Local MongoDB connection failed: ${localError.message}`);
    console.warn('Backend server running. Please ensure MongoDB is whitelisted or local MongoDB service is running.');
  }
};

export default connectDB;
