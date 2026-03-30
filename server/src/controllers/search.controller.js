import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import Category from "../models/category.model.js";
import Program from "../models/program.model.js";
import Subject from "../models/subject.model.js";
import Topic from "../models/topic.model.js";
import Video from "../models/video.model.js";

export const globalSearch = asyncHandler(async (req, res) => {

  let { q } = req.query;

  /* -------------------- VALIDATION -------------------- */

  if (!q || typeof q !== "string" || q.trim().length < 2) {
    throw new ApiError(400, "Search query must be at least 2 characters");
  }

  const normalized = q.trim().toLowerCase();

  const escapeRegex = (text) =>
    text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const safeSearch = escapeRegex(normalized);

  const limit = 5; // 🔥 limit per section

  /* =========================================================
     SEARCH QUERIES (PARALLEL)
  ========================================================= */

  const [

    categories,
    programs,
    subjects,
    topics,
    videos

  ] = await Promise.all([

    /* ---------------- CATEGORY ---------------- */

    Category.find({
      isActive: true,
      name: { $regex: `^${safeSearch}`, $options: "i" }
    })
      .select("name slug icon")
      .limit(limit)
      .lean(),

    /* ---------------- PROGRAM ---------------- */

    Program.find({
      isActive: true,
      name: { $regex: `^${safeSearch}`, $options: "i" }
    })
      .select("name slug")
      .populate("category", "name")
      .limit(limit)
      .lean(),

    /* ---------------- SUBJECT ---------------- */

    Subject.find({
      isActive: true,
      name: { $regex: `^${safeSearch}`, $options: "i" }
    })
      .select("name slug")
      .populate("program", "name")
      .limit(limit)
      .lean(),

    /* ---------------- TOPIC ---------------- */

    Topic.find({
      isActive: true,
      title: { $regex: `^${safeSearch}`, $options: "i" }
    })
      .select("title slug")
      .populate("chapter", "title")
      .limit(limit)
      .lean(),

    /* ---------------- VIDEO ---------------- */

    Video.find({
      title: { $regex: `^${safeSearch}`, $options: "i" }
    })
      .select("title thumbnail views duration videoType youtubeVideoId videoUrl")
      .sort({ views: -1 })
      .limit(limit)
      .lean()

  ]);

  /* -------------------- RESPONSE -------------------- */

  return res.status(200).json(
    new ApiResponse(200, {
      categories,
      programs,
      subjects,
      topics,
      videos
    }, "Global search results fetched")
  );
});