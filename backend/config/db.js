// config/db.js
const mongoose = require("mongoose");

// Set strictQuery explicitly to suppress the warning
mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    console.log('Server will continue running without database connection.');
    console.log('Please ensure MongoDB is running or check your connection string.');
    // Don't exit the process, let the server run
  }
};

module.exports = connectDB;
