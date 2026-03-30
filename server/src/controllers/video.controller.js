import mongoose from "mongoose";
import Video from "../models/video.model.js";
import Topic from "../models/topic.model.js";
import Chapter from "../models/chapter.model.js";
import Subject from "../models/subject.model.js";
import Program from "../models/program.model.js";
import Category from "../models/category.model.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { getYouTubeVideoDetails, parseDuration } from "../utils/youtube.js";


/* -------------------- UTILITY: Extract YouTube ID -------------------- */

const extractYouTubeId = (url) => {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/watch")) {
        return parsed.searchParams.get("v");
      }

      if (parsed.pathname.startsWith("/embed/") || parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/")[2];
      }
    }

    return null;
  } catch {
    return null;
  }
};


/* -------------------- UPLOAD VIDEO -------------------- */

export const uploadVideo = asyncHandler(async (req, res) => {

  /* 🔐 ROLE CHECK */
  if (
    req.user.role !== "admin" &&
    !(req.user.role === "teacher" && req.user.teacherStatus === "approved")
  ) {
    throw new ApiError(403, "Only approved teachers or admins can upload videos");
  }

  let {
    title,
    description,
    category,
    program,
    subject,
    chapter,
    topic,
    videoType,
    youtubeUrl,
    isFree
  } = req.body;
  let duration = 0;
  /* -------------------- BASIC VALIDATION -------------------- */

  if ( !category || !videoType) {
    throw new ApiError(400, "Title, category and videoType are required");
  }

  if (!mongoose.Types.ObjectId.isValid(category)) {
    throw new ApiError(400, "Invalid category ID");
  }

  /* -------------------- CATEGORY VALIDATION -------------------- */

  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) throw new ApiError(404, "Category not found");


  /* -------------------- HIERARCHY VALIDATION -------------------- */

  if (topic) {
    if (!mongoose.Types.ObjectId.isValid(topic)) {
      throw new ApiError(400, "Invalid topic ID");
    }

    const topicDoc = await Topic.findById(topic)
      .populate({
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

  else if (chapter) {
    if (!mongoose.Types.ObjectId.isValid(chapter)) {
      throw new ApiError(400, "Invalid chapter ID");
    }

    const chapterDoc = await Chapter.findById(chapter)
      .populate({
        path: "subject",
        populate: { path: "program" }
      });

    if (!chapterDoc) throw new ApiError(404, "Chapter not found");

    subject = chapterDoc.subject._id;
    program = chapterDoc.subject.program._id;
    category = chapterDoc.subject.program.category;
  }

  else if (subject) {
    if (!mongoose.Types.ObjectId.isValid(subject)) {
      throw new ApiError(400, "Invalid subject ID");
    }

    const subjectDoc = await Subject.findById(subject).populate("program");

    if (!subjectDoc) throw new ApiError(404, "Subject not found");

    program = subjectDoc.program._id;
    category = subjectDoc.program.category;
  }

  else if (program) {
    if (!mongoose.Types.ObjectId.isValid(program)) {
      throw new ApiError(400, "Invalid program ID");
    }

    const programDoc = await Program.findById(program);

    if (!programDoc) throw new ApiError(404, "Program not found");

    category = programDoc.category;
  }

  /* -------------------- VIDEO HANDLING -------------------- */

  let videoUrl = "";
  let youtubeVideoId = null;
  let thumbnail = null;

  // 📺 YOUTUBE
  // 📺 YOUTUBE
  if (videoType === "youtube") {

    if (!youtubeUrl) {
      throw new ApiError(400, "youtubeUrl is required");
    }

    youtubeVideoId = extractYouTubeId(youtubeUrl);

    if (!youtubeVideoId || youtubeVideoId.length !== 11) {
      throw new ApiError(400, "Invalid YouTube URL");
    }

    videoUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;

    try {
      const ytData = await getYouTubeVideoDetails(youtubeVideoId);

      // 🔥 AUTO DATA (FETCH ONCE)
      duration = parseDuration(ytData.duration);

      // optional override
      if (!title) title = ytData.title;
      thumbnail = ytData.thumbnail;

    } catch (err) {
      console.log("YouTube fetch failed:", err.message);

      duration = 0;
      thumbnail = `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;
    }
  }

  // 🎥 INTERNAL
  else if (videoType === "internal") {

    const videoFile = req.file?.path;

    if (!videoFile) {
      throw new ApiError(400, "Video file is required");
    }

    const uploaded = await uploadCloudinary(videoFile);

    if (!uploaded?.url) {
      throw new ApiError(500, "Cloudinary upload failed");
    }

    videoUrl = uploaded.url;
    duration = uploaded.duration || 0;
    thumbnail = uploaded.thumbnail || null;
    
  }

  else {
    throw new ApiError(400, "Invalid videoType");
  }


  /* -------------------- SAVE -------------------- */

  const video = await Video.create({
    title,
    description,
    category,
    program,
    subject,
    chapter,
    topic,
    videoType,
    videoUrl,
    youtubeVideoId,
    thumbnail,
    duration,
    isFree,
    uploadedBy: req.user._id
  });

  return res.status(201).json(
    new ApiResponse(201, video, "Video uploaded successfully")
  );

});



export const getVideos = asyncHandler(async (req, res) => {

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

  /* -------------------- VALIDATION -------------------- */

  page = parseInt(page);
  limit = parseInt(limit);

  if (page < 1 || limit < 1) {
    throw new ApiError(400, "Invalid pagination values");
  }

  const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

  if (category && !isValidId(category)) {
    throw new ApiError(400, "Invalid category ID");
  }

  if (program && !isValidId(program)) {
    throw new ApiError(400, "Invalid program ID");
  }

  if (subject && !isValidId(subject)) {
    throw new ApiError(400, "Invalid subject ID");
  }

  if (chapter && !isValidId(chapter)) {
    throw new ApiError(400, "Invalid chapter ID");
  }

  if (topic && !isValidId(topic)) {
    throw new ApiError(400, "Invalid topic ID");
  }

  /* -------------------- FILTER LOGIC -------------------- */

  const filter = {};

  // 👉 deepest-level filtering (important)
  if (topic) filter.topic = topic;
  else if (chapter) filter.chapter = chapter;
  else if (subject) filter.subject = subject;
  else if (program) filter.program = program;
  else if (category) filter.category = category;

  /* -------------------- SORT LOGIC -------------------- */

  const sortOptions = {
    latest: { createdAt: -1 },
    popular: { views: -1 },
    rating: { ratingAverage: -1 }
  };

  const sortQuery = sortOptions[sort] || sortOptions.latest;

  /* -------------------- PAGINATION -------------------- */

  const skip = (page - 1) * limit;

  /* -------------------- QUERY EXECUTION -------------------- */

  const [videos, total] = await Promise.all([

    Video.find(filter)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .select("-__v")
      .populate("uploadedBy", "username fullName avatar")
      .lean(),

    Video.countDocuments(filter)

  ]);

  /* -------------------- RESPONSE -------------------- */

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      "Videos fetched successfully"
    )
  );

});




export const getVideoById = asyncHandler(async (req, res) => {

  const { id } = req.params;

  /* -------------------- VALIDATION -------------------- */

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid video ID");
  }

  /* -------------------- FETCH + INCREMENT VIEW -------------------- */

  const video = await Video.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },   // 🔥 atomic increment
    { new: true }
  )
    .populate("uploadedBy", "username fullName avatar")
    .populate("category", "name")
    .populate("program", "name")
    .populate("subject", "name")
    .populate("chapter", "title")
    .populate("topic", "title")
    .lean();

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  /* -------------------- RELATED VIDEOS -------------------- */

  const relatedFilter = {
    _id: { $ne: video._id }
  };

  // 🔥 hierarchy-based relevance (priority)
  if (video.topic) {
    relatedFilter.topic = video.topic._id;
  } 
  else if (video.chapter) {
    relatedFilter.chapter = video.chapter._id;
  } 
  else if (video.subject) {
    relatedFilter.subject = video.subject._id;
  } 
  else if (video.program) {
    relatedFilter.program = video.program._id;
  } 
  else {
    relatedFilter.category = video.category._id;
  }

  const relatedVideos = await Video.find(relatedFilter)
    .sort({ views: -1 })        // popular first
    .limit(10)
    .select("title thumbnail views duration videoType youtubeVideoId videoUrl")
    .lean();

  /* -------------------- RESPONSE -------------------- */

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        video,
        relatedVideos
      },
      "Video fetched successfully"
    )
  );

});



export const searchVideos = asyncHandler(async (req, res) => {

  let {
    q,
    category,
    program,
    subject,
    page = 1,
    limit = 10
  } = req.query;

  /* -------------------- VALIDATION -------------------- */

  if (!q || typeof q !== "string" || q.trim().length < 2) {
    throw new ApiError(400, "Search query must be at least 2 characters");
  }

  page = parseInt(page);
  limit = parseInt(limit);

  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
    throw new ApiError(400, "Invalid pagination values");
  }

  const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

  if (category && !isValidId(category)) {
    throw new ApiError(400, "Invalid category ID");
  }

  if (program && !isValidId(program)) {
    throw new ApiError(400, "Invalid program ID");
  }

  if (subject && !isValidId(subject)) {
    throw new ApiError(400, "Invalid subject ID");
  }

  /* -------------------- FILTER -------------------- */

  const filter = {};

  if (category) filter.category = category;
  if (program) filter.program = program;
  if (subject) filter.subject = subject;

  /* -------------------- NORMALIZE SEARCH -------------------- */

  const normalized = q.trim().toLowerCase();

  // 🔒 escape regex (VERY IMPORTANT security)
  const escapeRegex = (text) =>
    text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const safeSearch = escapeRegex(normalized);

  const skip = (page - 1) * limit;

  let videos = [];
  let total = 0;

  /* =========================================================
     STEP 1: PREFIX SEARCH (FAST - INDEX USED)
  ========================================================= */

  const prefixQuery = {
    ...filter,
    title: { $regex: `^${safeSearch}`, $options: "i" }
  };

  videos = await Video.find(prefixQuery)
    .sort({ views: -1 })
    .skip(skip)
    .limit(limit)
    .select("title thumbnail views duration videoType youtubeVideoId videoUrl")
    .lean();

  total = await Video.countDocuments(prefixQuery);

  /* =========================================================
     STEP 2: TEXT SEARCH (RELEVANCE)
  ========================================================= */

  if (videos.length === 0) {

    const textQuery = {
      ...filter,
      $text: { $search: normalized }
    };

    const textResults = await Video.find(textQuery, {
      score: { $meta: "textScore" }
    })
      .sort({ score: { $meta: "textScore" } })
      .skip(skip)
      .limit(limit)
      .select("title thumbnail views duration videoType youtubeVideoId videoUrl score")
      .lean();

    if (textResults.length > 0) {
      videos = textResults;
      total = await Video.countDocuments(textQuery);
    }
  }

  /* =========================================================
     STEP 3: FALLBACK REGEX (FLEXIBLE)
  ========================================================= */

  if (videos.length === 0) {

    const regexQuery = {
      ...filter,
      title: { $regex: safeSearch, $options: "i" }
    };

    videos = await Video.find(regexQuery)
      .sort({ views: -1 })
      .skip(skip)
      .limit(limit)
      .select("title thumbnail views duration videoType youtubeVideoId videoUrl")
      .lean();

    total = await Video.countDocuments(regexQuery);
  }

  /* -------------------- RESPONSE -------------------- */

  return res.status(200).json(
    new ApiResponse(200, {
      videos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }, "Search results fetched successfully")
  );
});


export const deleteVideo = asyncHandler(async (req, res) => {

  const { id } = req.params;

  /* -------------------- VALIDATION -------------------- */

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid video ID");
  }

  /* -------------------- FIND VIDEO -------------------- */

  const video = await Video.findById(id);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  /* -------------------- AUTHORIZATION -------------------- */

  // Admin → can delete anything
  // Teacher → only own videos
  if (
    req.user.role !== "admin" &&
    video.uploadedBy.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized to delete this video");
  }

  /* -------------------- DELETE FROM CLOUDINARY -------------------- */

  // Only for internal videos
  if (video.videoType === "internal" && video.videoUrl) {

    try {
      // extract public_id from URL
      const parts = video.videoUrl.split("/");
      const fileName = parts[parts.length - 1];
      const publicId = fileName.split(".")[0];

      // TODO: implement deleteCloudinary(publicId)
      // await deleteCloudinary(publicId);

    } catch (err) {
      console.log("Cloudinary delete failed (safe to ignore)");
    }
  }

  /* -------------------- DELETE DB -------------------- */

  await Video.findByIdAndDelete(id);

  /* -------------------- OPTIONAL: CLEAN REFERENCES -------------------- */

  // If you later store videoIds in topics/chapters → remove here

  /* -------------------- RESPONSE -------------------- */

  return res.status(200).json(
    new ApiResponse(200, {}, "Video deleted successfully")
  );
});
