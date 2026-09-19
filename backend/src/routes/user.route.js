import express from "express"
import {
  updateProfile,
  listActiveUsers,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.patch("/profile",protect, upload.single("avatar"), updateProfile);

router.get("/active-users", protect, adminOnly, listActiveUsers);

export default router;