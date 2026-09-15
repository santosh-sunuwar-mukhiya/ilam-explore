import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    images: [{ type: String, trim: true }],
    bestTimeToVisit: { type: String, trim: true, default: "" },
    entryFee: { type: String, trim: true, default: "" },
    thingsToDo: [{ type: String, trim: true }],
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
  },
  { timestamps: true },
);


export const Place = mongoose.model("Place", placeSchema);
