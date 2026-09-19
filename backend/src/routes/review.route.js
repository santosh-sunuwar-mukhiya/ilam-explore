import { Router } from "express";
import {
  listPlaceReviews,
  listAllReviews,
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";

const router = Router();

// public read
router.route("/place/:placeId").get(listPlaceReviews);

// admin moderation
router.route("/").get(protect, adminOnly, listAllReviews);

// authenticated users
router.route("/").post(protect, createReview);

router
  .route("/:id")
  .patch(protect, updateReview)
  .delete(protect, deleteReview);

export default router;