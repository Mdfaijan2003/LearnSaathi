import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import Category from "../models/category.model.js";
import Program from "../models/program.model.js";
import Subject from "../models/subject.model.js";
import Topic from "../models/topic.model.js";
import Video from "../models/video.model.js";

export const autocompleteSearch = asyncHandler(async (req, res) => {

  let { q } = req.query;

  /* -------------------- VALIDATION -------------------- */

  if (!q || typeof q !== "string" || q.trim().length < 1) {
    throw new ApiError(400, "Query is required");
  }

  const normalized = q.trim().toLowerCase();

  // 🔒 escape regex
  const escapeRegex = (text) =>
    text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const safeSearch = escapeRegex(normalized);

  const limit = 5; // per type

  /* =========================================================
     PARALLEL SEARCH
  ========================================================= */

  const [
    categories,
    programs,
    subjects,
    topics,
    videos
  ] = await Promise.all([

    Category.find({
      isActive: true,
      name: { $regex: `^${safeSearch}`, $options: "i" }
    })
      .select("name")
      .limit(limit)
      .lean(),

    Program.find({
      isActive: true,
      name: { $regex: `^${safeSearch}`, $options: "i" }
    })
      .select("name")
      .limit(limit)
      .lean(),

    Subject.find({
      isActive: true,
      name: { $regex: `^${safeSearch}`, $options: "i" }
    })
      .select("name")
      .limit(limit)
      .lean(),

    Topic.find({
      isActive: true,
      title: { $regex: `^${safeSearch}`, $options: "i" }
    })
      .select("title")
      .limit(limit)
      .lean(),

    Video.find({
      title: { $regex: `^${safeSearch}`, $options: "i" }
    })
      .select("title")
      .limit(limit)
      .lean()

  ]);

  /* =========================================================
     FORMAT RESULTS
  ========================================================= */

  let suggestions = [];

  categories.forEach(c =>
    suggestions.push({ type: "category", label: c.name })
  );

  programs.forEach(p =>
    suggestions.push({ type: "program", label: p.name })
  );

  subjects.forEach(s =>
    suggestions.push({ type: "subject", label: s.name })
  );

  topics.forEach(t =>
    suggestions.push({ type: "topic", label: t.title })
  );

  videos.forEach(v =>
    suggestions.push({ type: "video", label: v.title })
  );

  /* =========================================================
     PRIORITY SORT
  ========================================================= */

  const priority = {
    category: 1,
    program: 2,
    subject: 3,
    topic: 4,
    video: 5
  };

  suggestions.sort((a, b) => priority[a.type] - priority[b.type]);

  /* =========================================================
     LIMIT FINAL OUTPUT (UX OPTIMIZATION)
  ========================================================= */

  suggestions = suggestions.slice(0, 10);

  /* -------------------- RESPONSE -------------------- */

  return res.status(200).json(
    new ApiResponse(200, { suggestions }, "Autocomplete results fetched")
  );
});