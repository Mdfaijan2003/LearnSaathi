import Rating from "../models/rating.model.js";
import Video from "../models/video.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const rateVideo = asyncHandler(async (req, res) => {

  const { videoId, rating } = req.body;

  if (!videoId || !rating) {
    throw new ApiError(400, "Video and rating required");
  }

  if (rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // check existing rating
  const existingRating = await Rating.findOne({
    video: videoId,
    user: req.user._id
  });

  if (existingRating) {
    existingRating.rating = rating;
    await existingRating.save();
  } else {
    await Rating.create({
      video: videoId,
      user: req.user._id,
      rating
    });
  }

  // recalculate rating
  const stats = await Rating.aggregate([
    { $match: { video: video._id } },
    {
      $group: {
        _id: "$video",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    video.ratingAverage = stats[0].avgRating;
    video.ratingCount = stats[0].count;
    await video.save();
  }

  return res.status(200).json(
    new ApiResponse(200, video, "Rating updated")
  );

});