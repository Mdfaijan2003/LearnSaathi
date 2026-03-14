import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    }
  },
  { timestamps: true }
);

// prevent duplicate ratings
ratingSchema.index({ video: 1, user: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema);

export default Rating;