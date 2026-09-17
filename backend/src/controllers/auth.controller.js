import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import {User} from "../models/user.models.js"

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
        $or: [{ email: normalizedEmail }],
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
        avatar: avatar.url,
      });

      const createdUser = await User.findOne(user._id);

      if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user!");
      }

      return res
        .status(201)
        .json(
          new ApiResponse(200, createdUser, "User registered Successfully"),
        );
    } catch (err) {
        res.json({ success: false, message: err.message });
    }
})

export {
    registerUser,
}