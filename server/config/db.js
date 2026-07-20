import mongoose from 'mongoose';

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
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    await reconcilePostIndexes(conn.connection.db);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
