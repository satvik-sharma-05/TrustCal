const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    // Options removed: useNewUrlParser, useUnifiedTopology (deprecated in driver 4.x)
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('Database connection error:', error.message);
    if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.error('');
      console.error('  Make sure MONGO_URI in .env is your real MongoDB Atlas connection string.');
      console.error('  Replace the placeholder (e.g. cluster.mongodb.net) with your cluster host from Atlas.');
      console.error('');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
