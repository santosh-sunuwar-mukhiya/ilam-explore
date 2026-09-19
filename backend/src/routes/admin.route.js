import { Router } from "express";
import { getDashboardStats } from "../controllers/admin.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";

const router = Router();

// admin only
router.get("/dashboard", protect, adminOnly, getDashboardStats);

export default router;