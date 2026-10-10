const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const connection = await mongoose.connect(process.env.MONGODB_URI);

    // Database connection information
    console.log("====================================");
    console.log("✅ MongoDB Connected Successfully!");
    console.log(`🌐 Cluster Host: ${connection.connection.host}`);
    console.log(`🗄️ Database Name: ${connection.connection.name}`);
    console.log("====================================");
  } catch (error) {
    console.error("====================================");
    console.error("❌ MongoDB Connection Failed!");
    console.error(`Error: ${error.message}`);
    console.error("====================================");

    process.exit(1);
  }
};

module.exports = connectDB;