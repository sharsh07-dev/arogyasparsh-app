const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // This suppresses the warning you saw
    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log("ArogyaSparsh Database is Ready! 🏥");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;