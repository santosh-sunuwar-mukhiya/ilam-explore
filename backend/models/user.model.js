import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, select: false },
  verificationExpires: { type: Date, select: false },
  avatar: { type: String, default: "" },
}, {timstamps:true});

export const User = mongoose.model("User", userSchema);
