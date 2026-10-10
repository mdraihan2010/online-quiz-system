const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Read admin details from environment variables
    const name = process.env.ADMIN_NAME?.trim();
    const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;

    // Validate environment variables
    if (!name || !email || !password) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be configured in .env"
      );
    }

    if (password.length < 12 || password.length > 72) {
      throw new Error("Admin password must be between 12 and 72 characters.");
    }

    if (name.length < 2 || name.length > 50) {
      throw new Error("Admin name must be between 2 and 50 characters.");
    }

    // Check whether the account already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role === "admin") {
        console.log("An admin account with this email already exists.");
      } else {
        console.log(
          "An account with this email already exists as a regular user."
        );
        console.log(
          "No role changes were made. Verify the account before promoting it."
        );
      }

      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin account
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      isActive: true,
    });

    console.log("Admin account created successfully.");
    console.log(`Admin email: ${email}`);
  } catch (error) {
    console.error("Admin creation failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();