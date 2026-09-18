import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

// Method to Generate access and Refresh token.
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
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
  //validation - details not empty.
  // check weather email already registered or not.
  // check avatar, images
  // upload avatar to cloudinary.
  // check for user creation
  // remove refreshtoken & password.
  // retur user.
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !normalizedEmail || !password) {
      throw new ApiError(400, "All the fields are required!");
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide a valid email" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const existedUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existedUser) {
      throw new ApiError(409, "Email is already Registered.");
    }

    console.log(req.file);

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
      throw new ApiError(400, "Avatar file is required");
    }

    const user = await User.create({
      name: name.trim(),
      password,
      email: normalizedEmail,
      avatar: avatar?.url || "",
    });

    const createdUser = await User.findOne(user._id);

    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering user!");
    }

    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User registered Successfully"));
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  // details from frontend
  // email, password
  // find user
  // check password
  // access and refresh token
  // send cookie
  try {
    const { email, password } = req.body;

    if (!email) throw new ApiError(400, "email is required!");

    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "User does not exist!");

    const isPasswordValid = await user
      .isPasswordCorrect(password)
      .select("+password");

    if (!isPasswordValid) {
      throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user._id,
    );

    const loggedInUser = await User.findOne(user._id);

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
            accessToken,
            refreshToken,
          },
          "User logged In Successfully",
        ),
      );
  } catch (err) {
    throw new ApiError(500, "Error while logging");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: 1, // removes the field from document.
      },
    },
    {
      new: true,
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
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) throw new ApiError(401, "unauthorized request");

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid refresh Token!");
    }
      
      if (incomingRefreshToken !== user?.refreshToken) {
         throw new ApiError(401, "Refresh Token is expired!");
     } 

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    };
    
      const { newRefreshToken, accessToken } = await generateAccessAndRefreshTokens(user._id);

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed",
        );
    
  } catch (err) {
      throw new ApiError(401, err?.message || "Invalid refresh token");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      throw new ApiError(400, "Invalid Old Password!");
    }

    if (!(newPassword === confirmPassword)){
      throw new ApiError(400, "new password and confirm password did not matched.")
    }

    user.password = newPassword;
    return res.status(200).json(new ApiResponse(200, {}, "Password Updated Successfully!"));
  } catch (err) {
    throw new ApiError(500, "Error occured while changing password!")
  }
});

const getMe = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "User fetched Successfully!"));
});

export { registerUser, loginUser, logoutUser, refreshAccessToken, changePassword, getMe };