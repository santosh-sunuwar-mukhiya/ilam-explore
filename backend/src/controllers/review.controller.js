import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Review } from "../models/review.model.js";
import { Place } from "../models/place.model.js";

const asText = (value) => {
  if (typeof value === "string") return value.trim();
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Keeps Place.averageRating / Place.reviewCount in sync with the reviews
const refreshPlaceRating = async (placeId) => {
  const stats = await Review.aggregate([
    { $match: { place: new mongoose.Types.ObjectId(`${placeId}`) } },
    {
      $group: {
        _id: "$place",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const averageRating = stats[0]?.averageRating ?? 0;
  const reviewCount = stats[0]?.reviewCount ?? 0;

  await Place.findByIdAndUpdate(placeId, {
    $set: {
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount,
    },
  });
};

const parseRating = (value) => {
  const rating = Number(value);

  if (!Number.isFinite(rating) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be a whole number between 1 and 5");
  }

  return rating;
};

// PUBLIC: all reviews of a place
const listPlaceReviews = asyncHandler(async (req, res) => {
  const { placeId } = req.params;

  if (!isValidObjectId(placeId)) {
    throw new ApiError(400, "Invalid place id");
  }

  const place = await Place.findById(placeId).select("_id");
  if (!place) {
    throw new ApiError(404, "Place not found");
  }

  const reviews = await Review.find({ place: placeId })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { reviews, total: reviews.length },
        "Reviews retrieved successfully",
      ),
    );
});

// AUTH: create review for a place
const createReview = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const placeId = asText(body.place);
  const rating = parseRating(body.rating);
  const comment = asText(body.comment);

  if (!placeId) {
    throw new ApiError(400, "place is required");
  }

  if (!isValidObjectId(placeId)) {
    throw new ApiError(400, "Invalid place id");
  }

  if (!comment) {
    throw new ApiError(400, "Comment is required");
  }

  const place = await Place.findById(placeId).select("_id");
  if (!place) {
    throw new ApiError(404, "Place not found");
  }

  const alreadyReviewed = await Review.findOne({
    place: placeId,
    user: req.user._id,
  }).select("_id");

  if (alreadyReviewed) {
    throw new ApiError(409, "You have already reviewed this place");
  }

  const review = await Review.create({
    user: req.user._id,
    place: placeId,
    rating,
    comment,
  });

  await refreshPlaceRating(placeId);

  const createdReview = await Review.findById(review._id).populate(
    "user",
    "name avatar",
  );

  return res
    .status(201)
    .json(new ApiResponse(201, createdReview, "Review created successfully"));
});

// AUTH: update own review (admin can update any review)
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid review id");
  }

  const review = await Review.findById(id);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  const isOwner = review.user.toString() === req.user?._id?.toString();
  const isAdmin = req.user?.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You can only update your own review");
  }

  const body = req.body || {};

  if (body.rating !== undefined) {
    review.rating = parseRating(body.rating);
  }

  if (body.comment !== undefined) {
    const comment = asText(body.comment);

    if (!comment) {
      throw new ApiError(400, "Comment cannot be empty");
    }

    review.comment = comment;
  }

  await review.save();
  await refreshPlaceRating(review.place);

  const updatedReview = await Review.findById(review._id).populate(
    "user",
    "name avatar",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedReview, "Review updated successfully"));
});

// AUTH: delete own review (admin can moderate any review)
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    throw new ApiError(400, "Invalid review id");
  }

  const review = await Review.findById(id);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  const isOwner = review.user.toString() === req.user?._id?.toString();
  const isAdmin = req.user?.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "You can only delete your own review");
  }

  const placeId = review.place;
  await review.deleteOne();
  await refreshPlaceRating(placeId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedReviewId: id },
        "Review deleted successfully",
      ),
    );
});

// ADMIN: every review in the database (moderation), optional ?place=
const listAllReviews = asyncHandler(async (req, res) => {
  const placeId = asText(req.query?.place);
  const filter = {};

  if (placeId) {
    if (!isValidObjectId(placeId)) {
      throw new ApiError(400, "Invalid place id");
    }

    filter.place = placeId;
  }

  const reviews = await Review.find(filter)
    .populate("user", "name email avatar")
    .populate("place", "name slug")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { reviews, total: reviews.length },
        "All reviews retrieved successfully",
      ),
    );
});

export { listPlaceReviews, listAllReviews, createReview, updateReview, deleteReview };