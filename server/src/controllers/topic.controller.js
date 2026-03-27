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

  if (!title || !chapter || order === undefined) {
    throw new ApiError(400, "Title, chapter and order are required");
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
      throw new ApiError(409, "Duplicate topic or order exists");
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

  page = parseInt(page);
  limit = parseInt(limit);

  if (page < 1 || limit < 1) {
    throw new ApiError(400, "Invalid pagination values");
  }

  const matchStage = {};

  // 🔥 user → only active
  if (!req.user || req.user.role !== "admin") {
    matchStage.isActive = true;
  }

  /* -------------------- CHAPTER FILTER -------------------- */

  if (chapter) {
    if (!mongoose.Types.ObjectId.isValid(chapter)) {
      throw new ApiError(400, "Invalid chapter ID");
    }
    matchStage.chapter = new mongoose.Types.ObjectId(chapter);
  }

  /* -------------------- SEARCH (FIXED) -------------------- */

  if (search) {
    const normalizedSearch = search.trim().toLowerCase();

    matchStage.$or = [
      // ⚡ prefix search (fast, uses index)
      {
        title: {
          $regex: `^${normalizedSearch}`,
          $options: "i"
        }
      },
      // 🔍 fallback search
      {
        title: {
          $regex: normalizedSearch,
          $options: "i"
        }
      }
    ];
  }

  const skip = (page - 1) * limit;

  /* -------------------- PIPELINE -------------------- */

  const pipeline = [

    { $match: matchStage },

    // 🔥 join chapter (optimized)
    {
      $lookup: {
        from: "chapters",
        localField: "chapter",
        foreignField: "_id",
        pipeline: [
          { $project: { title: 1 } }
        ],
        as: "chapter"
      }
    },
    { $unwind: "$chapter" },

    // 🔥 video count (optimized)
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "topic",
        pipeline: [
          { $project: { _id: 1 } }
        ],
        as: "videos"
      }
    },

    {
      $addFields: {
        videoCount: { $size: "$videos" }
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

    // 🔥 smart sorting
    {
      $sort: search
        ? { title: 1 }   // search → alphabetical
        : { order: 1 }   // normal → structured
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

  const updateData = {};

  if (title) {
    const normalized = title.trim().toLowerCase();
    updateData.title = normalized;
    updateData.slug = normalized.replace(/\s+/g, "-");
  }

  if (order !== undefined) {
    updateData.order = order;
  }

  const updated = await Topic.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();

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