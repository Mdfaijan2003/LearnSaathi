import WatchHistory from "../models/watchHistory.model.js";
import Video from "../models/video.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const updateWatchHistory = asyncHandler(async (req, res) => {

  const { videoId, watchedSeconds } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  let record = await WatchHistory.findOne({
    user: req.user._id,
    video: videoId
  });

  if (!record) {
    record = await WatchHistory.create({
      user: req.user._id,
      video: videoId,
      watchedSeconds
    });
  } else {
    record.watchedSeconds = watchedSeconds;
    record.lastWatchedAt = new Date();
  }

  if (video.duration && watchedSeconds >= video.duration) {
    record.completed = true;
  }

  await record.save();

  return res.status(200).json(
    new ApiResponse(200, record, "Watch history updated")
  );

});

export const getVideoWatchProgress = asyncHandler(async (req, res) => {

  const { videoId } = req.params;

  const record = await WatchHistory.findOne({
    user: req.user._id,
    video: videoId
  });

  return res.status(200).json(
    new ApiResponse(200, record || {}, "Watch progress fetched")
  );

});

export const getUserWatchHistory = asyncHandler(async (req, res) => {

  const history = await WatchHistory.find({
    user: req.user._id
  })
    .populate("video", "title thumbnail duration")
    .sort({ updatedAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, history, "Watch history fetched")
  );

});