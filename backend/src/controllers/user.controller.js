import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";

const updateProfile = asyncHandler(async (req, res) => {
    try {
        const { name, avatar } = req.body;
        if(!name) return
    }catch(err){}
})