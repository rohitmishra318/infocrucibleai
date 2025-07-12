const mongoose = require('mongoose');
require('dotenv').config(); // To load .env variables

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Mongoose 6 doesn't need useCreateIndex or useFindAndModify
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

console.log('--- DEBUG: Exporting connectDB ---', typeof connectDB);

module.exports = connectDB;