import { Router } from "express";
import {
  getMyTrip,
  addPlaceToTrip,
  removePlaceFromTrip,
  clearMyTrip,
} from "../controllers/trip.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(protect, getMyTrip).delete(protect, clearMyTrip);
router
  .route("/places/:placeId")
  .post(protect, addPlaceToTrip)
  .delete(protect, removePlaceFromTrip);

export default router;
