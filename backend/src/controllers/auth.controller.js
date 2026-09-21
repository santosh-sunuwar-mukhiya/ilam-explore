import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Refresh tokens are stored hashed, so a database leak does not expose usable
// tokens. The plain token only ever lives in the client cookie.
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const hashesMatch = (first = "", second = "") => {
  const a = Buffer.from(first);
  const b = Buffer.from(second);

  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const generateVerificationOtp = () =>
  crypto.randomInt(100000, 1000000).toString();

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

// Method to Generate access and Refresh token.
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend.
  // validation - details not empty.
  // check weather email already registered or not.
  // avatar is OPTIONAL: upload to cloudinary only when a file is provided.
  // check for user creation.
  // return user (password & refreshToken are excluded by the model schema).
  const { name, email, password } = req.body || {};
  const normalizedEmail = email?.trim().toLowerCase();

  if (!name?.trim() || !normalizedEmail || !password) {
    throw new ApiError(400, "All the fields are required!");
  }

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    throw new ApiError(400, "Please provide a valid email");
  }

  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  const existedUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existedUser) {
    throw new ApiError(409, "Email is already Registered.");
  }

  // Registration without avatar -> no req.file -> skip Cloudinary -> keep default ""
  let avatarUrl = "";
  const avatarLocalPath = req.file?.path;

  if (avatarLocalPath) {
    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);

    if (!uploadedAvatar?.url) {
      throw new ApiError(500, "Error while uploading avatar");
    }

    avatarUrl = uploadedAvatar.url;
  }

  const verificationOtp = generateVerificationOtp();

  const user = await User.create({
    name: name.trim(),
    password,
    email: normalizedEmail,
    avatar: avatarUrl,
    isVerified: false,
    verifyOtp: hashOtp(verificationOtp),
    verifyOtpExpireAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmail({
    to: user.email,
    subject: "Verify your Ilam Explore account",
    text: [
      "Welcome to Ilam Explore.",
      "",
      `Your account verification OTP is: ${verificationOtp}`,
      "This OTP expires in 10 minutes.",
      "",
      "If you did not create this account, you can ignore this email.",
    ].join("\n"),
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        email: user.email,
        isVerified: user.isVerified,
        verificationRequired: true,
      },
      "Account created. Please verify your email.",
    ),
  );
});

const verifyEmail = asyncHandler(async (req, res) => {
  const { email, otp, code } = req.body || {};
  const submittedOtp = otp ?? code;
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !submittedOtp) {
    throw new ApiError(400, "Email and OTP are required!");
  }

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    throw new ApiError(400, "Please provide a valid email");
  }

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+verifyOtp +verifyOtpExpireAt",
  );

  if (!user) {
    throw new ApiError(404, "User does not exist!");
  }

  if (user.isVerified) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Email is already verified."));
  }

  if (!user.verifyOtp || !user.verifyOtpExpireAt) {
    throw new ApiError(400, "Verification OTP is not available.");
  }

  if (user.verifyOtpExpireAt.getTime() < Date.now()) {
    throw new ApiError(400, "Verification OTP has expired.");
  }

  if (!hashesMatch(hashOtp(String(submittedOtp)), user.verifyOtp)) {
    throw new ApiError(400, "Invalid verification OTP.");
  }

  user.isVerified = true;
  user.verifyOtp = null;
  user.verifyOtpExpireAt = null;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Email verified successfully."));
});

const loginUser = asyncHandler(async (req, res) => {
  // details from frontend
  // email, password
  // find user (password is select:false -> explicitly select it)
  // check password
  // access and refresh token
  // send cookie
  const { email, password } = req.body || {};

  if (!email) throw new ApiError(400, "email is required!");
  if (!password) throw new ApiError(400, "password is required!");

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select("+password");

  if (!user) throw new ApiError(404, "User does not exist!");

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  if (user.isSuspended) {
    throw new ApiError(403, "Your account has been suspended");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
        },
        "User logged In Successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // removes the field from document.
      },
    },
    {
      returnDocument: "after",
    },
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorized request");

  let decodedToken;
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
  } catch (err) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  // refreshToken is select:false in the schema -> select it explicitly.
  const user = await User.findById(decodedToken?._id).select("+refreshToken");

  if (!user) {
    throw new ApiError(401, "Invalid refresh Token!");
  }

  if (user.isSuspended) {
    throw new ApiError(403, "Your account has been suspended");
  }

  if (!hashesMatch(hashToken(incomingRefreshToken), user.refreshToken || "")) {
    throw new ApiError(401, "Refresh Token is expired or already used!");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  // generateAccessAndRefreshTokens returns { accessToken, refreshToken }
  const { accessToken, refreshToken: newRefreshToken } =
    await generateAccessAndRefreshTokens(user._id);

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
      new ApiResponse(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed",
      ),
    );
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body || {};

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All the fields are required!");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "new password and confirm password did not matched.");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  // password is select:false -> select it explicitly before comparing
  const user = await User.findById(req.user?._id).select("+password");

  if (!user) {
    throw new ApiError(404, "User does not exist!");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Old Password!");
  }

  user.password = newPassword;
  // pre("save") hook re-hashes because password is modified
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Updated Successfully!"));
});

const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "User fetched Successfully!"));
});

export {
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getMe,
};