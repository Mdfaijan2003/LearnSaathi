import mongoose from "mongoose";
import Chapter from "../models/chapter.model.js";
import Subject from "../models/subject.model.js";
import Topic from "../models/topic.model.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


/* -------------------- CREATE -------------------- */

export const createChapter = asyncHandler(async (req, res) => {

  const {
    title,
    subject,
    order,
    estimatedMinTime,
    estimatedMaxTime
  } = req.body;

  if (!title || !subject || order === undefined) {
    throw new ApiError(400, "Title, subject and order are required");
  }

  if (!mongoose.Types.ObjectId.isValid(subject)) {
    throw new ApiError(400, "Invalid subject ID");
  }

  const subjectDoc = await Subject.findOne({
    _id: subject,
    isActive: true
  });

  if (!subjectDoc) {
    throw new ApiError(404, "Subject not found or inactive");
  }

  if (
    estimatedMinTime &&
    estimatedMaxTime &&
    estimatedMinTime > estimatedMaxTime
  ) {
    throw new ApiError(400, "Min time cannot exceed max time");
  }

  const normalizedTitle = title.trim().toLowerCase();

  let chapter;

  try {
    chapter = await Chapter.create({
      title: normalizedTitle,
      subject,
      order,
      estimatedMinTime,
      estimatedMaxTime,
      createdBy: req.user._id
    });

  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Duplicate chapter or order exists");
    }
    throw error;
  }

  return res.status(201).json(
    new ApiResponse(201, chapter, "Chapter created")
  );
});


/* -------------------- GET ALL -------------------- */

export const getAllChapters = asyncHandler(async (req, res) => {

  let { page = 1, limit = 10, subject, search } = req.query;

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

  /* -------------------- SUBJECT FILTER -------------------- */

  if (subject) {
    if (!mongoose.Types.ObjectId.isValid(subject)) {
      throw new ApiError(400, "Invalid subject ID");
    }
    matchStage.subject = new mongoose.Types.ObjectId(subject);
  }

  /* -------------------- SEARCH (NEW) -------------------- */

  if (search) {
    const normalizedSearch = search.trim().toLowerCase();

    matchStage.$or = [
      // ⚡ prefix search (fast)
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

    // 🔥 join subject (optimized)
    {
      $lookup: {
        from: "subjects",
        localField: "subject",
        foreignField: "_id",
        pipeline: [
          { $project: { name: 1 } }
        ],
        as: "subject"
      }
    },
    { $unwind: "$subject" },

    // 🔥 topic count (optimized)
    {
      $lookup: {
        from: "topics",
        localField: "_id",
        foreignField: "chapter",
        pipeline: [
          { $project: { _id: 1 } }
        ],
        as: "topics"
      }
    },

    {
      $addFields: {
        topicCount: { $size: "$topics" }
      }
    },

    {
      $project: {
        title: 1,
        order: 1,
        estimatedMinTime: 1,
        estimatedMaxTime: 1,
        slug: 1,
        topicCount: 1,
        subject: {
          _id: "$subject._id",
          name: "$subject.name"
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

  const [chapters, total] = await Promise.all([
    Chapter.aggregate(pipeline),
    Chapter.countDocuments(matchStage)
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      chapters
    }, "Chapters fetched")
  );
});


/* -------------------- GET ONE -------------------- */

export const getChapterById = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid chapter ID");
  }

  const query = { _id: id, isActive: true };

  if (req.user?.role === "admin") {
    delete query.isActive;
  }

  const chapter = await Chapter.findOne(query)
    .populate("subject", "name")
    .lean();

  if (!chapter) {
    throw new ApiError(404, "Chapter not found");
  }

  return res.status(200).json(
    new ApiResponse(200, chapter, "Chapter fetched")
  );
});


/* -------------------- UPDATE -------------------- */

export const updateChapter = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const {
    title,
    order,
    estimatedMinTime,
    estimatedMaxTime
  } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid chapter ID");
  }

  const updateData = {};

  if (title) {
    const normalized = title.trim().toLowerCase();
    updateData.title = normalized;
    updateData.slug = normalized.replace(/\s+/g, "-");
  }

  if (order !== undefined) updateData.order = order;
  if (estimatedMinTime !== undefined) updateData.estimatedMinTime = estimatedMinTime;
  if (estimatedMaxTime !== undefined) updateData.estimatedMaxTime = estimatedMaxTime;

  const updated = await Chapter.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    throw new ApiError(404, "Chapter not found");
  }

  return res.status(200).json(
    new ApiResponse(200, updated, "Chapter updated")
  );
});


/* -------------------- DELETE -------------------- */

export const deleteChapter = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid chapter ID");
  }

  const hasTopics = await Topic.exists({ chapter: id });

  if (hasTopics) {
    throw new ApiError(400, "Cannot delete chapter with topics");
  }

  const deleted = await Chapter.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!deleted) {
    throw new ApiError(404, "Chapter not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Chapter deleted")
  );
});