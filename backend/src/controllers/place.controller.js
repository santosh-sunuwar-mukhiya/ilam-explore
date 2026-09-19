import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Place } from "../models/place.model.js";
import { Review } from "../models/review.model.js";
import { uploadOnCloudinary, deleteFromCloudinaryMany } from "../config/cloudinary.js";

// Numbers / null / undefined must not break the controllers
const asText = (value) => {
  if (typeof value === "string") return value.trim();
  if (value === undefined || value === null) return "";
  return String(value).trim();
};

const escapeRegex = (value = "") =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const slugify = (value = "") =>
  asText(value)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// Accepts ["a","b"] or "a,b" (also from multipart form-data)
const parseList = (value) => {
  if (value === undefined || value === null || value === "") return [];
  const items = Array.isArray(value) ? value : String(value).split(",");
  return items.map(asText).filter(Boolean);
};

// Uses the existing Cloudinary helper (same upload system as avatars)
const uploadPlaceImages = async (files = []) => {
  const urls = [];
  for (const file of files) {
    const uploaded = await uploadOnCloudinary(file.path);
    if (uploaded?.url) urls.push(uploaded.url);
  }
  return urls;
};

// Appends -2, -3 ... when an auto generated slug is already taken
const buildUniqueSlug = async (baseSlug) => {
  let slug = baseSlug;
  let counter = 1;

  while (await Place.exists({ slug })) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
};

// PUBLIC: list places, optional ?category= and ?search=
const listPlaces = asyncHandler(async (req, res) => {
  const category = asText(req.query?.category);
  const search = asText(req.query?.search);
  const filter = {};

  if (category) {
    filter.category = new RegExp(`^${escapeRegex(category)}$`, "i");
  }

  if (search) {
    const pattern = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { name: pattern },
      { location: pattern },
      { description: pattern },
    ];
  }

  const places = await Place.find(filter).sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { places, total: places.length },
        "Places retrieved successfully",
      ),
    );
});

// PUBLIC: single place
const getPlaceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid place id");
  }

  const place = await Place.findById(id);

  if (!place) {
    throw new ApiError(404, "Place not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, place, "Place retrieved successfully"));
});
// ADMIN: create place
const createPlace = asyncHandler(async (req, res) => {
  const body = req.body || {};

  const name = asText(body.name);
  const description = asText(body.description);
  const location = asText(body.location);
  const category = asText(body.category);

  const missingFields = [];
  if (!name) missingFields.push("name");
  if (!description) missingFields.push("description");
  if (!location) missingFields.push("location");
  if (!category) missingFields.push("category");

  if (missingFields.length) {
    throw new ApiError(400, `Missing required fields: ${missingFields.join(", ")}`);
  }

  const givenSlug = asText(body.slug);
  let slug;

  if (givenSlug) {
    slug = slugify(givenSlug);

    if (!slug) {
      throw new ApiError(400, "Please provide a valid slug");
    }

    // an explicitly given slug must stay unique -> clean 409
    if (await Place.exists({ slug })) {
      throw new ApiError(409, `Place with slug "${slug}" already exists`);
    }
  } else {
    slug = slugify(name);

    if (!slug) {
      throw new ApiError(400, "A valid slug could not be generated, please provide a slug");
    }

    // slug derived from the name -> keep it unique instead of failing
    slug = await buildUniqueSlug(slug);
  }

  const uploadedImages = await uploadPlaceImages(req.files);
  const images = [...uploadedImages, ...parseList(body.images)];

  const place = await Place.create({
    name,
    slug,
    description,
    location,
    category,
    images,
    bestTimeToVisit: asText(body.bestTimeToVisit),
    entryFee: asText(body.entryFee),
    thingsToDo: parseList(body.thingsToDo),
    createdBy: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, place, "Place created successfully"));
});

// ADMIN: update place (partial update)
const updatePlace = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid place id");
  }

  const place = await Place.findById(id);

  if (!place) {
    throw new ApiError(404, "Place not found");
  }

  const body = req.body || {};
  const textFields = ["name", "description", "location", "category"];
  const originalImages = [...place.images];

  for (const field of textFields) {
    if (body[field] === undefined) continue;

    const value = asText(body[field]);

    if (!value) {
      throw new ApiError(400, `${field} cannot be empty`);
    }

    place[field] = value;
  }

  if (body.bestTimeToVisit !== undefined) {
    place.bestTimeToVisit = asText(body.bestTimeToVisit);
  }

  if (body.entryFee !== undefined) {
    place.entryFee = asText(body.entryFee);
  }

  if (body.thingsToDo !== undefined) {
    place.thingsToDo = parseList(body.thingsToDo);
  }

  if (body.slug !== undefined) {
    const newSlug = slugify(body.slug);

    if (!newSlug) {
      throw new ApiError(400, "Please provide a valid slug");
    }

    const slugTaken = await Place.findOne({
      slug: newSlug,
      _id: { $ne: place._id },
    }).select("_id");

    if (slugTaken) {
      throw new ApiError(409, `Place with slug "${newSlug}" already exists`);
    }

    place.slug = newSlug;
  }

  // body.images replaces the list, uploaded files are appended to it
  if (body.images !== undefined) {
    place.images = parseList(body.images);
  }

  const uploadedImages = await uploadPlaceImages(req.files);
  if (uploadedImages.length) {
    place.images = [...place.images, ...uploadedImages];
  }

  const updatedPlace = await place.save();

  // drop Cloudinary assets that are no longer referenced by this place
  const removedImages = originalImages.filter(
    (url) => !updatedPlace.images.includes(url),
  );

  if (removedImages.length) {
    await deleteFromCloudinaryMany(removedImages);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlace, "Place updated successfully"));
});

// ADMIN: delete place (and its reviews, so no orphan reviews are left)
const deletePlace = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid place id");
  }

  const place = await Place.findById(id);

  if (!place) {
    throw new ApiError(404, "Place not found");
  }

  const deletedReviews = await Review.deleteMany({ place: place._id });
  await place.deleteOne();

  // remove the place photos from Cloudinary too
  const deletedImages = await deleteFromCloudinaryMany(place.images);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          deletedPlaceId: place._id,
          deletedReviews: deletedReviews.deletedCount,
          deletedImages,
        },
        "Place deleted successfully",
      ),
    );
});

export { listPlaces, getPlaceById, createPlace, updatePlace, deletePlace };
