import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const adminOnly = asyncHandler(async (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).status(new ApiResponse(403, {}, "Admin access Required!"));
    }
});
