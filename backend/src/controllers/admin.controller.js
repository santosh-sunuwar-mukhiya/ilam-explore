import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Place } from "../models/place.model.js";
import { Review } from "../models/review.model.js";

// Simple counts for the admin dashboard (no heavy analytics)
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, activeUsers, totalAdmins, totalPlaces, totalReviews] =
    await Promise.all([
      User.countDocuments(),
      // active/authenticated = holds a stored refreshToken (current architecture)
      User.countDocuments({ refreshToken: { $exists: true, $ne: null } }),
      User.countDocuments({ role: "admin" }),
      Place.countDocuments(),
      Review.countDocuments(),
    ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalUsers, activeUsers, totalAdmins, totalPlaces, totalReviews },
        "Dashboard data retrieved successfully",
      ),
    );
});

export { getDashboardStats };