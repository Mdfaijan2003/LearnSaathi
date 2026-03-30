import mongoose from "mongoose";
import WatchHistory from "../models/watchHistory.model.js";
import Video from "../models/video.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { computeHybridRecommendations } from "../services/hybridRecommendation.service.js";
import { computeRecommendations } from "../services/recommendation.service.js";
import { redisClient } from "../utils/redis.js";

export const updateWatchProgress = asyncHandler(async (req, res) => {

  const { videoId, watchedSeconds } = req.body;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (watchedSeconds < 0) {
    throw new ApiError(400, "Invalid watch time");
  }

  // const video = await Video.findById(videoId).select("duration");

  // if (!video) {
  //   throw new ApiError(404, "Video not found");
  // }

  // const completed = video.duration
  //   ? watchedSeconds >= video.duration * 0.9
  //   : false;

  // const history = await WatchHistory.findOneAndUpdate(

  //   { user: req.user._id, video: videoId },

  //   {
  //     $set: {
  //       watchedSeconds,
  //       completed,
  //       lastWatchedAt: new Date()
  //     }
  //   },

  //   { upsert: true, new: true }
  // );

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const safeWatched = Math.min(watchedSeconds, video.duration);

  const completed = safeWatched >= video.duration;

  const history = await WatchHistory.findOneAndUpdate(
    { user: req.user._id, video: videoId },
    {
      watchedSeconds,
      completed,
      lastWatchedAt: new Date()
    },
    { new: true, upsert: true }
  );

  const userId = req.user._id.toString();
  console.log("Deleting cache for:", userId);

  try {
    if (redisClient.isOpen) {
      await redisClient.del(`recommendations:${userId}`);
      console.log("✅ Cache invalidated");
    }
  } catch (err) {
    console.log("Redis delete failed");
  }

  return res.status(200).json(
    new ApiResponse(200, history, "Progress updated")
  );
});

export const getContinueWatching = asyncHandler(async (req, res) => {

  const history = await WatchHistory.find({
    user: req.user._id,
    completed: false
  })
    .sort({ lastWatchedAt: -1 })
    .limit(10)
    .populate("video", "title thumbnail duration");

  return res.status(200).json(
    new ApiResponse(200, history, "Continue watching")
  );
});


export const getAdvancedRecommendations = asyncHandler(async (req, res) => {

  const userId = req.user._id.toString();
  const cacheKey = `recommendations:${userId}`;

  /* -------------------- CACHE CHECK -------------------- */

  let cached = null;

  try {
    if (redisClient.isOpen) {
      cached = await redisClient.get(cacheKey);
    }
  } catch (err) {
    console.log("Redis read failed");
  }

  if (cached) {
    return res.status(200).json(
      new ApiResponse(200, JSON.parse(cached), "From cache")
    );
  }

  /* -------------------- COMPUTE -------------------- */

  const recommendations = await computeRecommendations(userId);

  /* -------------------- SAVE CACHE -------------------- */

  try {
    if (redisClient.isOpen) {
      await redisClient.setEx(
        cacheKey,
        60 * 60,
        JSON.stringify(recommendations)
      );
    }
  } catch (err) {
    console.log("Redis write failed");
  }

  return res.status(200).json(
    new ApiResponse(200, recommendations, "Fresh recommendations")
  );
});

export const getCollaborativeRecommendations = asyncHandler(async (req, res) => {

  const userId = req.user._id;

  /* -------------------- STEP 1: USER WATCH HISTORY -------------------- */

  const userHistory = await WatchHistory.find({ user: userId })
    .select("video")
    .lean();

  const userVideoIds = userHistory.map(h => h.video);

  if (userVideoIds.length === 0) {
    // fallback → trending
    const trending = await Video.find()
      .sort({ views: -1 })
      .limit(10)
      .lean();

    return res.status(200).json(
      new ApiResponse(200, trending, "Trending videos")
    );
  }

  /* -------------------- STEP 2: FIND SIMILAR USERS -------------------- */

  const similarUsers = await WatchHistory.aggregate([

    {
      $match: {
        video: { $in: userVideoIds },
        user: { $ne: userId }
      }
    },

    {
      $group: {
        _id: "$user",
        commonVideos: { $sum: 1 }
      }
    },

    {
      $sort: { commonVideos: -1 }
    },

    {
      $limit: 20 // 🔥 top similar users
    }

  ]);

  const similarUserIds = similarUsers.map(u => u._id);

  if (similarUserIds.length === 0) {
    // fallback → advanced recommendation
    return res.status(200).json(
      new ApiResponse(200, [], "No similar users found")
    );
  }

  /* -------------------- STEP 3: GET THEIR VIDEOS -------------------- */

  const recommendations = await WatchHistory.aggregate([

    {
      $match: {
        user: { $in: similarUserIds },
        video: { $nin: userVideoIds }
      }
    },

    {
      $group: {
        _id: "$video",
        count: { $sum: 1 } // 🔥 popularity among similar users
      }
    },

    {
      $sort: { count: -1 }
    },

    {
      $limit: 20
    },

    // 🔥 JOIN VIDEO DETAILS
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "_id",
        as: "video"
      }
    },

    { $unwind: "$video" },

    {
      $project: {
        _id: "$video._id",
        title: "$video.title",
        thumbnail: "$video.thumbnail",
        views: "$video.views",
        score: "$count"
      }
    }

  ]);

  /* -------------------- FINAL RESPONSE -------------------- */

  return res.status(200).json(
    new ApiResponse(200, recommendations, "Collaborative recommendations")
  );
});


export const getHybridRecommendations = asyncHandler(async (req, res) => {

  const userId = req.user._id;

  const result = await computeHybridRecommendations(userId);

  return res.status(200).json(
    new ApiResponse(200, result, "Hybrid recommendations fetched")
  );
});