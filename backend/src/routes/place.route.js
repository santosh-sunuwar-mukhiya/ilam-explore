import { Router } from "express";
import {
  listPlaces,
  getPlaceById,
  savePlace,
  unsavePlace,
  listSavedPlaces,
  createPlace,
  updatePlace,
  deletePlace,
} from "../controllers/place.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { adminOnly } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

// public read
router.route("/").get(listPlaces);

// authenticated saved places
router.route("/saved").get(protect, listSavedPlaces);

router
  .route("/:placeId/save")
  .post(protect, savePlace)
  .delete(protect, unsavePlace);

router.route("/:id").get(getPlaceById);

// admin only
router
  .route("/")
  .post(protect, adminOnly, upload.array("images", 5), createPlace);

router
  .route("/:id")
  .patch(protect, adminOnly, upload.array("images", 5), updatePlace)
  .delete(protect, adminOnly, deletePlace);

export default router;