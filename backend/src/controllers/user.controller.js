import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Review } from "../models/review.model.js";
import { Trip } from "../models/trip.model.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../config/cloudinary.js";

// Fields safe to expose: never includes password or refreshToken
const USER_SAFE_FIELDS =
  "name email role avatar isVerified isSuspended suspendedAt createdAt updatedAt";

const getTargetUser = async (userId, currentUserId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user._id.toString() === currentUserId.toString()) {
    throw new ApiError(400, "You cannot modify your own account");
  }

  if (user.role === "admin") {
    throw new ApiError(403, "Admin accounts cannot be modified here");
  }

  return user;
};

const updateProfile = asyncHandler(async (req, res) => {
  const avatarFilePath = req.file?.path;
  const previousAvatar = req.user?.avatar;
  const name = req.body?.name;

  if (!avatarFilePath && name === undefined) {
    throw new ApiError(400, "Name or avatar is required");
  }

  const update = {};

  if (name !== undefined) {
    const trimmedName = name.trim();

    if (!trimmedName) {
      throw new ApiError(400, "Name cannot be empty");
    }

    if (trimmedName.length > 100) {
      throw new ApiError(400, "Name must be 100 characters or fewer");
    }

    update.name = trimmedName;
  }

  if (avatarFilePath) {
    const avatar = await uploadOnCloudinary(avatarFilePath);

    if (!avatar?.url) {
      throw new ApiError(500, "Error while uploading Avatar!");
    }

    update.avatar = avatar.url;
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { $set: update },
    { returnDocument: "after" },
  ).select(USER_SAFE_FIELDS);

  if (!user) {
    throw new ApiError(404, "User does not exist!");
  }

  // remove the replaced avatar from Cloudinary (no orphan assets)
  if (avatarFilePath && previousAvatar && previousAvatar !== user.avatar) {
    await deleteFromCloudinary(previousAvatar);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"));
});

// Admin only: all registered users
const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select(USER_SAFE_FIELDS)
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { users, total: users.length },
        "All users retrieved successfully",
      ),
    );
});

// Admin only: active/authenticated users.
// In this architecture a logged-in user is one that holds a stored refreshToken.
const listActiveUsers = asyncHandler(async (req, res) => {
  const users = await User.find({
    refreshToken: { $exists: true, $ne: null },
  })
    .select(USER_SAFE_FIELDS)
    .sort({ updatedAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { users, total: users.length },
        "Active users retrieved successfully",
      ),
    );
});

const suspendUser = asyncHandler(async (req, res) => {
  const user = await getTargetUser(req.params.userId, req.user._id);

  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        isSuspended: true,
        suspendedAt: new Date(),
      },
      $unset: { refreshToken: 1 },
    },
  );

  const safeUser = await User.findById(user._id).select(USER_SAFE_FIELDS);

  return res
    .status(200)
    .json(new ApiResponse(200, safeUser, "User suspended successfully"));
});

const unsuspendUser = asyncHandler(async (req, res) => {
  const user = await getTargetUser(req.params.userId, req.user._id);

  user.isSuspended = false;
  user.suspendedAt = null;
  await user.save({ validateBeforeSave: false });

  const safeUser = await User.findById(user._id).select(USER_SAFE_FIELDS);

  return res
    .status(200)
    .json(new ApiResponse(200, safeUser, "User unsuspended successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await getTargetUser(req.params.userId, req.user._id);
  const deletedReviews = await Review.deleteMany({ user: user._id });
  const deletedTrip = await Trip.findOneAndDelete({ user: user._id });

  if (user.avatar) {
    await deleteFromCloudinary(user.avatar);
  }

  await user.deleteOne();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        deletedUserId: user._id,
        deletedReviews: deletedReviews.deletedCount,
        deletedTrip: Boolean(deletedTrip),
      },
      "User deleted successfully",
    ),
  );
});

export {
  updateProfile,
  listUsers,
  listActiveUsers,
  suspendUser,
  unsuspendUser,
  deleteUser,
};
