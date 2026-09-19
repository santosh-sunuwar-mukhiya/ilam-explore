import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const protect = asyncHandler(async (req, _ , next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new ApiError(401, "Unauthorized request");

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findOne(decodedToken?._id);

    if (!user) throw new ApiError(401, "User no longer exists");

    req.user = user;
    next();
  } catch (err) {
    console.log("Error occured while validating access token!", err.message);
    throw new ApiError(401, err?.message || "Invalid or Expired access token");
  }
});
