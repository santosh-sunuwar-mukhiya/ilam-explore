import mongoose from "mongoose";
import "../config/env.js";
import connectDB from "../config/db.js";
import { User } from "../models/user.model.js";

// Credentials can be overridden with ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD
// environment variables. Defaults are used only for local/demo seeding.
const DEFAULT_ADMIN_PASSWORD = "Admin@12345";
const usingDefaultPassword = !process.env.ADMIN_PASSWORD;

const adminData = {
  name: process.env.ADMIN_NAME || "Ilam Explore Admin",
  email: (process.env.ADMIN_EMAIL || "admin@ilamexplore.com").trim().toLowerCase(),
  password: process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD,
};

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingUser = await User.findOne({ email: adminData.email });

    if (existingUser) {
      if (existingUser.role !== "admin") {
        existingUser.role = "admin";
        await existingUser.save();
        console.log(`Admin role granted to existing user: ${existingUser.email}`);
      } else {
        console.log(`Admin already exists, nothing to do: ${existingUser.email}`);
      }
    } else {
      const admin = await User.create({
        name: adminData.name,
        email: adminData.email,
        password: adminData.password,
        role: "admin",
        isVerified: true,
      });
      console.log(`Admin created: ${admin.email}`);
    }

    console.log("-----------------------------------------------");
    console.log(`Login email    : ${adminData.email}`);
    console.log(
      usingDefaultPassword
        ? `Login password : ${DEFAULT_ADMIN_PASSWORD} (built-in default, change it if needed)`
        : "Login password : ADMIN_PASSWORD from environment",
    );
    console.log("-----------------------------------------------");
  } catch (err) {
    console.error(`Admin seeding failed: ${err.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
  }
};

seedAdmin();
