import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Place } from "../models/place.model.js";
import { Trip } from "../models/trip.model.js";

const emptyTrip = (userId) => ({
  user: userId,
  places: [],
});

const getPopulatedTrip = (userId) =>
  Trip.findOne({ user: userId }).populate("places");

const getMyTrip = asyncHandler(async (req, res) => {
  const trip =
    (await getPopulatedTrip(req.user._id)) || emptyTrip(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, trip, "Trip retrieved successfully"));
});

const addPlaceToTrip = asyncHandler(async (req, res) => {
  const { placeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(placeId)) {
    throw new ApiError(400, "Invalid place id");
  }

  const place = await Place.findById(placeId).select("_id");
  if (!place) {
    throw new ApiError(404, "Place not found");
  }

  await Trip.findOneAndUpdate(
    { user: req.user._id },
    { $addToSet: { places: place._id } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  const trip = await getPopulatedTrip(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, trip, "Place added to trip successfully"));
});

const removePlaceFromTrip = asyncHandler(async (req, res) => {
  const { placeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(placeId)) {
    throw new ApiError(400, "Invalid place id");
  }

  await Trip.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { places: placeId } },
  );

  const trip =
    (await getPopulatedTrip(req.user._id)) || emptyTrip(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, trip, "Place removed from trip successfully"));
});

const clearMyTrip = asyncHandler(async (req, res) => {
  await Trip.findOneAndDelete({ user: req.user._id });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        emptyTrip(req.user._id),
        "Trip cleared successfully",
      ),
    );
});

export { getMyTrip, addPlaceToTrip, removePlaceFromTrip, clearMyTrip };
