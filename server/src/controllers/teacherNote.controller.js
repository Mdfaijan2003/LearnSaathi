import mongoose from "mongoose";
import TeacherNote from "../models/teacherNote.model.js";
import Topic from "../models/topic.model.js";
import Category from "../models/category.model.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { redisClient } from "../utils/redis.js";
import { uploadCloudinary } from "../utils/cloudinary.js";

/* ================= COMMON ================= */

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ================= UPLOAD ================= */

export const uploadNote = asyncHandler(async (req, res) => {

  if (
    req.user.role !== "admin" &&
    !(req.user.role === "teacher" && req.user.teacherStatus === "approved")
  ) {
    throw new ApiError(403, "Not allowed");
  }

  let {
    title,
    description,
    category,
    program,
    subject,
    chapter,
    topic,
    isFree
  } = req.body;

  /* 🔒 VALIDATION */

  if (!title || title.trim().length < 2) {
    throw new ApiError(400, "Valid title required");
  }

  if (!category || !isValidId(category)) {
    throw new ApiError(400, "Invalid category");
  }

  if (topic && !isValidId(topic)) throw new ApiError(400, "Invalid topic");
  if (chapter && !isValidId(chapter)) throw new ApiError(400, "Invalid chapter");
  if (subject && !isValidId(subject)) throw new ApiError(400, "Invalid subject");
  if (program && !isValidId(program)) throw new ApiError(400, "Invalid program");

  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) throw new ApiError(404, "Category not found");

  /* 🔥 SINGLE LEVEL RULE */
  const levels = [topic, chapter, subject, program].filter(Boolean);
  if (levels.length > 1) {
    throw new ApiError(400, "Only one hierarchy level allowed");
  }

  /* 🔥 AUTO RESOLVE */
  if (topic) {
    const topicDoc = await Topic.findById(topic).populate({
      path: "chapter",
      populate: {
        path: "subject",
        populate: { path: "program" }
      }
    });

    if (!topicDoc) throw new ApiError(404, "Topic not found");

    chapter = topicDoc.chapter._id;
    subject = topicDoc.chapter.subject._id;
    program = topicDoc.chapter.subject.program._id;
    category = topicDoc.chapter.subject.program.category;
  }

  /* 📄 FILE CHECK */
  if (!req.file || req.file.mimetype !== "application/pdf") {
    throw new ApiError(400, "Only PDF allowed");
  }

  /* ☁️ CLOUD UPLOAD */
  const uploaded = await uploadCloudinary(req.file.path);

  const note = await TeacherNote.create({
    title: title.trim(),
    description,
    fileUrl: uploaded.url,
    fileSize: req.file.size,
    category,
    program,
    subject,
    chapter,
    topic,
    isFree,
    uploadedBy: req.user._id
  });

  /* 🧹 CACHE CLEAR */
  try {
    await redisClient.del("notes:all");
  } catch (err) {
    console.log("Redis error:", err.message);
  }

  return res.status(201).json(
    new ApiResponse(201, note, "Note uploaded")
  );
});


/* ================= GET NOTES ================= */

export const getNotes = asyncHandler(async (req, res) => {

  let {
    category,
    program,
    subject,
    chapter,
    topic,
    page = 1,
    limit = 10,
    sort = "latest"
  } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  const cacheKey = `notes:${page}:${limit}:${category || ""}:${program || ""}:${subject || ""}:${chapter || ""}:${topic || ""}:${sort}`;

  /* 🔥 CACHE */
  let cached = null;
  try {
    cached = await redisClient.get(cacheKey);
  } catch (err) {
    console.log("Redis read:", err.message);
  }

  if (cached) {
    return res.json(new ApiResponse(200, JSON.parse(cached)));
  }

  const filter = { isActive: true };

  if (topic) filter.topic = topic;
  else if (chapter) filter.chapter = chapter;
  else if (subject) filter.subject = subject;
  else if (program) filter.program = program;
  else if (category) filter.category = category;

  const sortOptions = {
    latest: { createdAt: -1 },
    popular: { downloads: -1 },
    views: { views: -1 }
  };

  const skip = (page - 1) * limit;

  const [notes, total] = await Promise.all([
    TeacherNote.find(filter)
      .select("title fileUrl views downloads createdAt")
      .sort(sortOptions[sort] || sortOptions.latest)
      .skip(skip)
      .limit(limit)
      .lean(),

    TeacherNote.countDocuments(filter)
  ]);

  const data = {
    notes,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };

  try {
    await redisClient.setEx(cacheKey, 300, JSON.stringify(data));
  } catch (err) {
    console.log("Redis write:", err.message);
  }

  return res.json(new ApiResponse(200, data));
});


/* ================= GET ONE ================= */

export const getNoteById = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid ID");
  }

  await TeacherNote.findByIdAndUpdate(id, { $inc: { views: 1 } });

  const cacheKey = `note:${id}`;

  let cached = null;
  try {
    cached = await redisClient.get(cacheKey);
  } catch {}

  if (cached) {
    return res.json(new ApiResponse(200, JSON.parse(cached)));
  }

  const note = await TeacherNote.findById(id)
    .select("title fileUrl views downloads createdAt")
    .lean();

  if (!note) throw new ApiError(404, "Not found");

  try {
    await redisClient.setEx(cacheKey, 300, JSON.stringify(note));
  } catch {}

  return res.json(new ApiResponse(200, note));
});


/* ================= DOWNLOAD ================= */

export const downloadNote = asyncHandler(async (req, res) => {

  const { id } = req.params;

  const note = await TeacherNote.findById(id);

  if (!note) throw new ApiError(404, "Not found");

  note.downloads += 1;
  await note.save();

  return res.redirect(note.fileUrl);
});


/* ================= DELETE ================= */

export const deleteNote = asyncHandler(async (req, res) => {

  const { id } = req.params;

  const note = await TeacherNote.findById(id);

  if (!note) throw new ApiError(404, "Not found");

  if (
    req.user.role !== "admin" &&
    note.uploadedBy.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not allowed");
  }

  note.isActive = false;
  await note.save();

  try {
    await redisClient.del(`note:${id}`);
    await redisClient.del("notes:all");
  } catch {}

  return res.json(new ApiResponse(200, {}, "Deleted"));
});


/* =====================================================
   🔥 SEARCH NOTES (ADVANCED)
===================================================== */

export const searchNotes = asyncHandler(async (req, res) => {

  let {
    q,
    category,
    program,
    subject,
    chapter,
    topic,
    page = 1,
    limit = 10,
    sort = "relevance"
  } = req.query;

  if (!q || q.trim().length < 2) {
    throw new ApiError(400, "Search query must be at least 2 characters");
  }

  page = parseInt(page);
  limit = parseInt(limit);

  const skip = (page - 1) * limit;

  /* 🔥 BASE FILTER */
  const matchStage = {
    isActive: true,
    $text: { $search: q }
  };

  if (topic) matchStage.topic = topic;
  else if (chapter) matchStage.chapter = chapter;
  else if (subject) matchStage.subject = subject;
  else if (program) matchStage.program = program;
  else if (category) matchStage.category = category;

  /* 🔥 SORT LOGIC */
  let sortStage = {};

  if (sort === "relevance") {
    sortStage = { score: { $meta: "textScore" } };
  } else if (sort === "popular") {
    sortStage = { downloads: -1 };
  } else if (sort === "views") {
    sortStage = { views: -1 };
  } else {
    sortStage = { createdAt: -1 };
  }

  /* =====================================================
     🔥 AGGREGATION PIPELINE
  ===================================================== */

  const pipeline = [

    { $match: matchStage },

    {
      $addFields: {
        score: { $meta: "textScore" }
      }
    },

    { $sort: sortStage },

    { $skip: skip },

    { $limit: limit },

    {
      $project: {
        title: 1,
        fileUrl: 1,
        views: 1,
        downloads: 1,
        createdAt: 1,
        score: 1
      }
    }

  ];

  const notes = await TeacherNote.aggregate(pipeline);

  /* 🔥 COUNT (separate for performance) */
  const total = await TeacherNote.countDocuments(matchStage);

  return res.status(200).json(
    new ApiResponse(200, {
      notes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, "Search results")
  );
});