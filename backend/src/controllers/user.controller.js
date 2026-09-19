import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../config/cloudinary.js";

// Fields safe to expose: never includes password or refreshToken
const USER_SAFE_FIELDS = "name email role avatar isVerified createdAt updatedAt";

const updateProfile = asyncHandler(async (req, res) => {
    const avatarFilePath = req.file?.path;

    if (!avatarFilePath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    const previousAvatar = req.user?.avatar;

    const avatar = await uploadOnCloudinary(avatarFilePath);

    if (!avatar?.url) {
        throw new ApiError(500, "Error while uploading Avatar!");
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: avatar.url,
        },
      },
      { returnDocument: "after" },
    ).select(USER_SAFE_FIELDS);

    if (!user) {
        throw new ApiError(404, "User does not exist!");
    }

    // remove the replaced avatar from Cloudinary (no orphan assets)
    if (previousAvatar && previousAvatar !== user.avatar) {
        await deleteFromCloudinary(previousAvatar);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Avatar Changed Successfully!"));
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

export { updateProfile, listUsers, listActiveUsers };