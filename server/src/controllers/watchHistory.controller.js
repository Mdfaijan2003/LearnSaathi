import mongoose from "mongoose";

import WatchHistory from "../models/watchHistory.model.js";
import Video from "../models/video.model.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { computeRecommendations } from "../services/recommendation.service.js";
import { computeHybridRecommendations } from "../services/hybridRecommendation.service.js";

import { redisClient } from "../utils/redis.js";


/* =========================================================
   UPDATE WATCH PROGRESS
========================================================= */

export const updateWatchProgress = asyncHandler(async (req, res) => {

  const { videoId, watchedSeconds } = req.body;

  /* =========================================================
     VALIDATION
  ========================================================= */

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (
    watchedSeconds === undefined ||
    typeof watchedSeconds !== "number" ||
    Number.isNaN(watchedSeconds) ||
    watchedSeconds < 0
  ) {
    throw new ApiError(400, "Invalid watched seconds");
  }

  /* =========================================================
     VIDEO
  ========================================================= */

  const video = await Video.findOne({
    _id: videoId,
    isActive: true
  }).select("duration");

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  /* =========================================================
     SAFE WATCH TIME
  ========================================================= */

  const safeWatched = Math.min(
    watchedSeconds,
    video.duration || watchedSeconds
  );

  /* =========================================================
     EXISTING HISTORY
  ========================================================= */

  const existing = await WatchHistory.findOne({
    user: req.user._id,
    video: videoId
  }).select("watchedSeconds");

  // 🔥 prevent backward progress
  const finalWatched = Math.max(
    safeWatched,
    existing?.watchedSeconds || 0
  );

  /* =========================================================
     PROGRESS CALCULATION
  ========================================================= */

  const progressPercent = video.duration
    ? Math.min(
        (finalWatched / video.duration) * 100,
        100
      )
    : 0;

  // 🔥 industry-standard completion logic
  const completed = progressPercent >= 90;

  /* =========================================================
     UPSERT
  ========================================================= */

  const history = await WatchHistory.findOneAndUpdate(

    {
      user: req.user._id,
      video: videoId
    },

    {
      $set: {

        watchedSeconds: finalWatched,

        progressPercent,

        completed,

        lastWatchedAt: new Date()

      },

      $setOnInsert: {
        firstWatchedAt: new Date()
      }

    },

    {
      new: true,
      upsert: true,
      runValidators: true
    }

  )

    .populate(
      "video",
      "title thumbnail duration slug"
    )

    .lean();

  /* =========================================================
     CACHE INVALIDATION
  ========================================================= */

  try {

    if (redisClient.isOpen) {

      const userId = req.user._id.toString();

      await Promise.all([

        redisClient.del(
          `recommendations:${userId}`
        ),

        redisClient.del(
          `hybrid:${userId}`
        ),

        redisClient.del(
          `continue:${userId}`
        )

      ]);

    }

  } catch (err) {

    console.log(
      "Redis invalidation failed:",
      err.message
    );

  }

  /* =========================================================
     RESPONSE
  ========================================================= */

  return res.status(200).json(

    new ApiResponse(

      200,

      history,

      "Watch progress updated successfully"

    )

  );

});


/* =========================================================
   CONTINUE WATCHING
========================================================= */

export const getContinueWatching = asyncHandler(async (req, res) => {

  const history = await WatchHistory.find({

    user: req.user._id,

    progressPercent: {
      $gt: 0,
      $lt: 90
    }

  })

    .sort({
      lastWatchedAt: -1
    })

    .limit(20)

    .populate({

      path: "video",

      match: {
        isActive: true
      },

      select: `
        title
        thumbnail
        duration
        views
        slug
        videoType
      `

    })

    .lean();

  /* =====================================================
     REMOVE DELETED/INACTIVE VIDEOS
  ===================================================== */

  const filtered = history.filter(h => h.video);

  /* =====================================================
     RESPONSE
  ===================================================== */

  return res.status(200).json(

    new ApiResponse(

      200,

      filtered,

      "Continue watching fetched successfully"

    )

  );

});


/* =========================================================
   WATCH HISTORY
========================================================= */

export const getWatchHistory = asyncHandler(async (req, res) => {

  let {
    page = 1,
    limit = 20
  } = req.query;

  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Number(limit) || 20, 50);

  const skip = (page - 1) * limit;

  const [history, total] = await Promise.all([

    WatchHistory.find({
      user: req.user._id
    })

      .sort({ lastWatchedAt: -1 })

      .skip(skip)

      .limit(limit)

      .populate({
        path: "video",
        match: { isActive: true },
        select: `
          title
          thumbnail
          duration
          views
          slug
          videoType
        `
      })

      .lean(),

    WatchHistory.countDocuments({
      user: req.user._id
    })

  ]);

  const filtered = history.filter(h => h.video);

  return res.status(200).json(

    new ApiResponse(

      200,

      {
        history: filtered,

        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },

      "Watch history fetched"

    )

  );

});


/* =========================================================
   REMOVE FROM HISTORY
========================================================= */

export const removeFromHistory = asyncHandler(async (req, res) => {

  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const deleted = await WatchHistory.findOneAndDelete({

    user: req.user._id,
    video: videoId

  });

  if (!deleted) {
    throw new ApiError(404, "History entry not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Removed from watch history"
    )
  );

});


/* =========================================================
   BASIC RECOMMENDATIONS
========================================================= */

export const getAdvancedRecommendations = asyncHandler(async (req, res) => {

  const userId = req.user._id.toString();

  const cacheKey = `recommendations:${userId}`;

  /* ---------------- CACHE ---------------- */

  try {

    if (redisClient.isOpen) {

      const cached = await redisClient.get(cacheKey);

      if (cached) {

        return res.status(200).json(
          new ApiResponse(
            200,
            JSON.parse(cached),
            "Recommendations from cache"
          )
        );

      }
    }

  } catch (err) {
    console.log("Redis read failed");
  }

  /* ---------------- COMPUTE ---------------- */

  const recommendations =
    await computeRecommendations(userId);

  /* ---------------- SAVE CACHE ---------------- */

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
    new ApiResponse(
      200,
      recommendations,
      "Recommendations fetched"
    )
  );

});


/* =========================================================
   COLLABORATIVE RECOMMENDATIONS
========================================================= */

export const getCollaborativeRecommendations =asyncHandler(async (req, res) => {

  const userId = req.user._id;

  /* ---------------- USER HISTORY ---------------- */

  const userHistory = await WatchHistory.find({
    user: userId
  })

    .select("video")

    .lean();

  const userVideoIds =
    userHistory.map(h => h.video);

  /* ---------------- FALLBACK ---------------- */

  if (userVideoIds.length === 0) {

    const trending = await Video.find({
      isActive: true
    })

      .sort({
        views: -1,
        createdAt: -1
      })

      .limit(10)

      .lean();

    return res.status(200).json(
      new ApiResponse(
        200,
        trending,
        "Trending videos"
      )
    );

  }

  /* ---------------- SIMILAR USERS ---------------- */

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
      $sort: {
        commonVideos: -1
      }
    },

    {
      $limit: 20
    }

  ]);

  const similarUserIds =
    similarUsers.map(u => u._id);

  if (similarUserIds.length === 0) {

    return res.status(200).json(
      new ApiResponse(
        200,
        [],
        "No similar users found"
      )
    );

  }

  /* ---------------- RECOMMENDATIONS ---------------- */

  const recommendations =
    await WatchHistory.aggregate([

      {
        $match: {
          user: { $in: similarUserIds },
          video: { $nin: userVideoIds }
        }
      },

      {
        $group: {
          _id: "$video",
          score: { $sum: 1 }
        }
      },

      {
        $sort: {
          score: -1
        }
      },

      {
        $limit: 20
      },

      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "_id",
          as: "video"
        }
      },

      {
        $unwind: "$video"
      },

      {
        $match: {
          "video.isActive": true
        }
      },

      {
        $project: {
          _id: "$video._id",
          title: "$video.title",
          thumbnail: "$video.thumbnail",
          views: "$video.views",
          slug: "$video.slug",
          score: 1
        }
      }

    ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      recommendations,
      "Collaborative recommendations fetched"
    )
  );

});


/* =========================================================
   HYBRID RECOMMENDATIONS
========================================================= */

export const getHybridRecommendations = asyncHandler(async (req, res) => {

    const userId = req.user._id.toString();

    const cacheKey = `hybrid:${userId}`;

    /* ---------------- CACHE ---------------- */

    try {

        if (redisClient.isOpen) {

        const cached = await redisClient.get(cacheKey);

        if (cached) {

            return res.status(200).json(
            new ApiResponse(
                200,
                JSON.parse(cached),
                "Hybrid recommendations from cache"
            )
            );

        }
        }

    } catch (err) {
        console.log("Redis read failed");
    }

    /* ---------------- COMPUTE ---------------- */

    const result =
        await computeHybridRecommendations(userId);

    /* ---------------- SAVE CACHE ---------------- */

    try {

        if (redisClient.isOpen) {

        await redisClient.setEx(
            cacheKey,
            60 * 60,
            JSON.stringify(result)
        );

        }

    } catch (err) {
        console.log("Redis write failed");
    }

    return res.status(200).json(
        new ApiResponse(
        200,
        result,
        "Hybrid recommendations fetched"
        )
    );

});