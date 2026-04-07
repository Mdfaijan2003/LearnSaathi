import UserProgress from "../models/UserProgress.model.js";
import Video from "../models/video.model.js";
import mongoose from "mongoose";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* =====================================================
   🔥 UPDATE PROGRESS
===================================================== */
export const updateProgress = asyncHandler(async (req, res) => {

  const { videoId, watchedSeconds } = req.body;

  /* 🔥 VALIDATION */
  if (!videoId || !isValidId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (watchedSeconds === undefined || watchedSeconds < 0) {
    throw new ApiError(400, "Invalid watchedSeconds");
  }

  /* 🔥 FETCH VIDEO */
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  /* 🔥 UPSERT */
  const progress = await UserProgress.findOneAndUpdate(
    { user: req.user._id, video: videoId },
    {
      $set: {
        watchedSeconds,
        duration: video.duration,
        topic: video.topic,
        subject: video.subject,
        program: video.program
      }
    },
    {
      new: true,
      upsert: true
    }
  ).select("+progress");

  return res.json(
    new ApiResponse(200, progress, "Progress updated")
  );
});

/* =====================================================
   🔥 GET TOPIC PROGRESS
===================================================== */
export const getTopicProgress = asyncHandler(async (req, res) => {

  const { topicId } = req.params;

  if (!isValidId(topicId)) {
    throw new ApiError(400, "Invalid topic ID");
  }

  /* TOTAL VIDEOS */
  const total = await Video.countDocuments({ topic: topicId });

  if (total === 0) {
    return res.json(new ApiResponse(200, { progress: 0 }));
  }

  /* COMPLETED */
  const completed = await UserProgress.countDocuments({
    user: req.user._id,
    topic: topicId,
    completed: true
  });

  const progress = Math.round((completed / total) * 100);

  return res.json(
    new ApiResponse(200, {
      total,
      completed,
      progress
    }, "Topic progress")
  );
});

/* =====================================================
   🔥 CONTINUE WATCHING
===================================================== */
export const continueWatching = asyncHandler(async (req, res) => {

  const data = await UserProgress.find({
    user: req.user._id,
    completed: false
  })
    .sort({ lastWatchedAt: -1 })
    .limit(5)
    .populate("video", "title thumbnail duration");

  return res.json(
    new ApiResponse(200, data, "Continue watching")
  );
});