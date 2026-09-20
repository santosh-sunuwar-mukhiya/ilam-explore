import express from "express"
import {
  updateProfile,
  listUsers,
  listActiveUsers,
  suspendUser,
  unsuspendUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.patch("/profile",protect, upload.single("avatar"), updateProfile);

router.get("/", protect, adminOnly, listUsers);

router.get("/active-users", protect, adminOnly, listActiveUsers);

router.patch("/:userId/suspend", protect, adminOnly, suspendUser);

router.patch("/:userId/unsuspend", protect, adminOnly, unsuspendUser);

router.delete("/:userId", protect, adminOnly, deleteUser);

export default router;