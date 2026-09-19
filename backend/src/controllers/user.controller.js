import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";

const updateProfile = asyncHandler(async (req, res) => {
    try {
        const avatarFilePath = req.file?.path;

        if (!avatarFilePath) {
            throw new ApiError(400, "Avatar file is missing");
        }

        const avatar = await uploadOnCloudinary(avatarFilePath);

        if (!avatar.url) {
            throw new ApiError(400, "Error while uploading Avatar!");
        }

        const user = await User.findByIdAndUpdate(
          req.user?._id,
          {
            $set: {
              avatar: avatar.url,
            },
          },
          { new: true },
        );

        return res.status(200).json(new ApiResponse(200, "Avatar Changed Successfully!"));
    } catch (err) { 
        throw new ApiError(400, "Error while changing avatar")
    }
});

const listActiveUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.findAll(req.users?._id);
        if (!users) {
            throw new ApiError(404, "No any active User!");
        }
        res.json(200).status(new ApiResponse(200, {users}, "Retrived All Active User!"))
    } catch (err) {
        throw new ApiError(400, "Failed listing Users.")
    }
})

export { updateProfile, listActiveUsers };