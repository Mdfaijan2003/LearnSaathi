import mongoose from "mongoose";
import Topic from "../models/topic.model.js";
import Chapter from "../models/chapter.model.js";
import Video from "../models/video.model.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


/* -------------------- CREATE -------------------- */

export const createTopic = asyncHandler(async (req, res) => {

  const { title, chapter, order } = req.body;

  if (!title?.trim() || !chapter || order === undefined) {
    throw new ApiError(400, "Title, chapter and order are required");
  }

  if (order < 0) {
    throw new ApiError(400, "Order must be >= 0");
  }

  if (!mongoose.Types.ObjectId.isValid(chapter)) {
    throw new ApiError(400, "Invalid chapter ID");
  }

  const chapterDoc = await Chapter.findOne({
    _id: chapter,
    isActive: true
  });

  if (!chapterDoc) {
    throw new ApiError(404, "Chapter not found or inactive");
  }

  const normalizedTitle = title.trim().toLowerCase();

  let topic;

  try {
    topic = await Topic.create({
      title: normalizedTitle,
      chapter,
      order,
      createdBy: req.user._id
    });

  } catch (error) {

    if (error.code === 11000) {
      if (error.keyPattern?.order) {
        throw new ApiError(409, "Topic order already exists in this chapter");
      }
      if (error.keyPattern?.title) {
        throw new ApiError(409, "Topic title already exists in this chapter");
      }
      throw new ApiError(409, "Duplicate topic");
    }

    throw error;
  }

  return res.status(201).json(
    new ApiResponse(201, topic, "Topic created")
  );
});


/* -------------------- GET ALL -------------------- */

export const getAllTopics = asyncHandler(async (req, res) => {

  let { page = 1, limit = 10, chapter, search } = req.query;

  page = Number(page) || 1;
  page = page < 1 ? 1 : page;

  limit = Math.min(Number(limit) || 10, 50);

  const matchStage = {};

  // 🔐 Only active for users
  if (!req.user || req.user.role !== "admin") {
    matchStage.isActive = true;
  }

  /* -------------------- FILTER BY CHAPTER -------------------- */

  if (chapter) {
    if (!mongoose.Types.ObjectId.isValid(chapter)) {
      throw new ApiError(400, "Invalid chapter ID");
    }

    matchStage.chapter = chapter; // ✅ clean
  }

  /* -------------------- SEARCH (SAFE) -------------------- */

  if (search) {
    const normalizedSearch = search.trim().toLowerCase();

    const escapeRegex = (text) =>
      text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const safeSearch = escapeRegex(normalizedSearch);

    matchStage.title = {
      $regex: `^${safeSearch}`,
      $options: "i"
    };
  }

  const skip = (page - 1) * limit;

  /* -------------------- PIPELINE -------------------- */

  const pipeline = [

    { $match: matchStage },

    // 📚 join chapter
    {
      $lookup: {
        from: "chapters",
        localField: "chapter",
        foreignField: "_id",
        pipeline: [{ $project: { title: 1 } }],
        as: "chapter"
      }
    },
    { $unwind: "$chapter" },

    // 🎥 optimized video count
    {
      $lookup: {
        from: "videos",
        let: { topicId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$topic", "$$topicId"] }
            }
          },
          { $count: "count" }
        ],
        as: "videoStats"
      }
    },
    {
      $addFields: {
        videoCount: {
          $ifNull: [{ $arrayElemAt: ["$videoStats.count", 0] }, 0]
        }
      }
    },

    {
      $project: {
        title: 1,
        order: 1,
        slug: 1,
        videoCount: 1,
        chapter: {
          _id: "$chapter._id",
          title: "$chapter.title"
        }
      }
    },

    {
      $sort: search
        ? { title: 1 }
        : { order: 1, createdAt: -1 }
    },

    { $skip: skip },
    { $limit: limit }
  ];

  const [topics, total] = await Promise.all([
    Topic.aggregate(pipeline),
    Topic.countDocuments(matchStage)
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      topics
    }, "Topics fetched")
  );
});


/* -------------------- GET SINGLE -------------------- */

export const getTopicById = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid topic ID");
  }

  const query = { _id: id, isActive: true };

  if (req.user?.role === "admin") {
    delete query.isActive;
  }

  const topic = await Topic.findOne(query)
    .populate("chapter", "title")
    .lean();

  if (!topic) {
    throw new ApiError(404, "Topic not found");
  }

  return res.status(200).json(
    new ApiResponse(200, topic, "Topic fetched")
  );
});


/* -------------------- UPDATE -------------------- */

export const updateTopic = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const { title, order } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid topic ID");
  }

  if (order !== undefined && order < 0) {
    throw new ApiError(400, "Order must be >= 0");
  }

  const updateData = {};

  if (title) {
    updateData.title = title.trim().toLowerCase();
    // ❌ slug handled by model
  }

  if (order !== undefined) {
    updateData.order = order;
  }

  let updated;

  try {
    updated = await Topic.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

  } catch (error) {

    if (error.code === 11000) {
      if (error.keyPattern?.order) {
        throw new ApiError(409, "Topic order already exists in this chapter");
      }
      if (error.keyPattern?.title) {
        throw new ApiError(409, "Topic title already exists in this chapter");
      }
      throw new ApiError(409, "Duplicate topic");
    }

    throw error;
  }

  if (!updated) {
    throw new ApiError(404, "Topic not found");
  }

  return res.status(200).json(
    new ApiResponse(200, updated, "Topic updated")
  );
});


/* -------------------- DELETE -------------------- */

export const deleteTopic = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid topic ID");
  }

  const hasVideos = await Video.exists({ topic: id });

  if (hasVideos) {
    throw new ApiError(400, "Cannot delete topic with videos");
  }

  const deleted = await Topic.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!deleted) {
    throw new ApiError(404, "Topic not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Topic deleted")
  );
});