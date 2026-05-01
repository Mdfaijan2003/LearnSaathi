import mongoose from "mongoose";
import Video from "../models/video.model.js";
import Topic from "../models/topic.model.js";
import Chapter from "../models/chapter.model.js";
import Subject from "../models/subject.model.js";
import Program from "../models/program.model.js";
import Category from "../models/category.model.js";
import fs from "fs/promises";
import Fuse from "fuse.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
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

const safeUnlink = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.access(filePath); // check if exists
    await fs.unlink(filePath);
  } catch (err) {
    if (err.code !== "ENOENT") {
      console.error("Cleanup failed:", err.message);
    }
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
  let videoUrl = "";
  let youtubeVideoId = null;
  let thumbnail = null;

  // 🔥 IMPORTANT FIX
  let uploadedVideo = null;
  let uploadedThumb = null;

  /* -------------------- VALIDATION -------------------- */

  // if (!videoType || !category || !title || !title.trim()) {
  //   throw new ApiError(400, "Title, category and videoType are required");
  // }

  if (!videoType || !category) {
    throw new ApiError(400, "Category and videoType are required");
  }

  // 🔥 title required ONLY for internal
  if (videoType === "internal" && (!title || !title.trim())) {
    throw new ApiError(400, "Title is required for internal videos");
  }

  if (!mongoose.Types.ObjectId.isValid(category)) {
    throw new ApiError(400, "Invalid category ID");
  }

  isFree = isFree === "true" || isFree === true;

  /* -------------------- CATEGORY -------------------- */

  const categoryDoc = await Category.findById(category);
  if (!categoryDoc) throw new ApiError(404, "Category not found");

  /* -------------------- HIERARCHY -------------------- */

  if (topic) {
    if (!mongoose.Types.ObjectId.isValid(topic)) {
      throw new ApiError(400, "Invalid topic ID");
    }

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

  else if (chapter) {
    if (!mongoose.Types.ObjectId.isValid(chapter)) {
      throw new ApiError(400, "Invalid chapter ID");
    }

    const chapterDoc = await Chapter.findById(chapter).populate({
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

  /* -------------------- VIDEO TYPE -------------------- */

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
      duration = parseDuration(ytData.duration);
      // optional override
      if (!title || !title.trim()) title = ytData.title;
      thumbnail = ytData.thumbnail;
    } catch {
      thumbnail = `https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`;

          // 🔥 fallback title (important)
      if (!title || !title.trim()) {
        title = "Untitled Video";
      }
    }
  }

  else if (videoType === "internal") {

    const videoFile = req.files?.video?.[0];
    const thumbnailFile = req.files?.thumbnail?.[0];

    if (!videoFile) throw new ApiError(400, "Video file is required");
    if (!thumbnailFile) throw new ApiError(400, "Thumbnail image is required");

    try {
      uploadedVideo = await uploadCloudinary(videoFile.path, { resource_type: "video" });
      uploadedThumb = await uploadCloudinary(thumbnailFile.path, { resource_type: "image" });

      if (!uploadedVideo?.url || !uploadedThumb?.url) {
        throw new Error("Upload failed");
      }

    } catch (err) {

      if (uploadedVideo?.public_id) {
        await deleteFromCloudinary(uploadedVideo.public_id, "video");
      }

      throw new ApiError(500, err.message);
    }

    // await fs.unlink(videoFile.path);
    // await fs.unlink(thumbnailFile.path);


    await safeUnlink(videoFile?.path);
    await safeUnlink(thumbnailFile?.path);
   

    videoUrl = uploadedVideo.url;
    duration = uploadedVideo.duration || 0;
    thumbnail = uploadedThumb.url;
  }

  else {
    throw new ApiError(400, "Invalid videoType");
  }

  /* -------------------- SAVE -------------------- */
  let video;
  try {
    video = await Video.create({
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
      uploadedBy: req.user._id,
      videoPublicId: uploadedVideo?.public_id,
      thumbnailPublicId: uploadedThumb?.public_id
    });
  } catch (err) {
    // rollback uploads
    if (uploadedVideo?.public_id) {
      await deleteFromCloudinary(uploadedVideo.public_id, "video");
    }

    if (uploadedThumb?.public_id) {
      await deleteFromCloudinary(uploadedThumb.public_id, "image");
    }

    throw err;
  }

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

  /* -------------------- PAGINATION SAFE -------------------- */

  page = Number(page) || 1;
  page = page < 1 ? 1 : page;

  limit = Math.min(Number(limit) || 10, 50); // cap at 50

  /* -------------------- VALIDATION -------------------- */

  const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

  const toObjectId = (id) => new mongoose.Types.ObjectId(id);

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

  const filter = {
    isActive: true // 🔥 VERY IMPORTANT
  };

  // 👉 deepest-level filtering (optimized)
  if (topic) filter.topic = toObjectId(topic);
  else if (chapter) filter.chapter = toObjectId(chapter);
  else if (subject) filter.subject = toObjectId(subject);
  else if (program) filter.program = toObjectId(program);
  else if (category) filter.category = toObjectId(category);

  /* -------------------- SORT LOGIC -------------------- */

  const sortOptions = {
    latest: { createdAt: -1 },
    popular: { views: -1 },
    rating: { ratingAverage: -1 }
  };

  if (!sortOptions[sort]) {
    throw new ApiError(400, "Invalid sort option");
  }

  const sortQuery = sortOptions[sort];

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

    // 🔥 optimize count (optional but good)
    page === 1 ? Video.countDocuments(filter) : Promise.resolve(0)

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
          totalPages: total ? Math.ceil(total / limit) : null
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

  const video = await Video.findOneAndUpdate(
    { _id: id, isActive: true }, // 🔥 IMPORTANT FIX
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate("uploadedBy", "username fullName avatar")
    .populate("category", "name")
    .populate("program", "name")
    .populate("subject", "name")
    .populate("chapter", "title")
    .populate("topic", "title")
    .select("-__v") // 🔥 cleaner response
    .lean();

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  /* -------------------- RELATED VIDEOS -------------------- */

  const relatedFilter = {
    _id: { $ne: video._id },
    isActive: true // 🔥 IMPORTANT FIX
  };

  // 🔥 hierarchy-based relevance
  if (video.topic?._id) {
    relatedFilter.topic = video.topic._id;
  } 
  else if (video.chapter?._id) {
    relatedFilter.chapter = video.chapter._id;
  } 
  else if (video.subject?._id) {
    relatedFilter.subject = video.subject._id;
  } 
  else if (video.program?._id) {
    relatedFilter.program = video.program._id;
  } 
  else if (video.category?._id) {
    relatedFilter.category = video.category._id;
  }

  const relatedVideos = await Video.find(relatedFilter)
    .sort({ views: -1 })
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

  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Number(limit) || 10, 50);

  const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
  const toObjectId = (id) => new mongoose.Types.ObjectId(id);

  if (category && !isValidId(category)) throw new ApiError(400, "Invalid category ID");
  if (program && !isValidId(program)) throw new ApiError(400, "Invalid program ID");
  if (subject && !isValidId(subject)) throw new ApiError(400, "Invalid subject ID");

  /* -------------------- FILTER -------------------- */

  const filter = { isActive: true };

  if (category) filter.category = toObjectId(category);
  if (program) filter.program = toObjectId(program);
  if (subject) filter.subject = toObjectId(subject);

  /* -------------------- SEARCH PREP -------------------- */

  const normalized = q.trim();

  const escapeRegex = (text) =>
    text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const safeSearch = escapeRegex(normalized);

  const skip = (page - 1) * limit;

  /* =========================================================
     🔥 ADVANCED PIPELINE
  ========================================================= */

  const pipeline = [

    // 🔥 TEXT SEARCH (real relevance)
    {
      // $match: {
      //   ...filter,
      //   $text: { $search: normalized }
      // }
      $match: filter
    },

    {
      $addFields: {

        // 🎯 TEXT SCORE (MongoDB relevance)
        // textScore: { $meta: "textScore" },
        // ⚠️ TEXT SCORE SAFE
        // textScore: {
        //   $cond: [
        //     { $gt: [{ $meta: "textScore" }, 0] },
        //     { $meta: "textScore" },
        //     0
        //   ]
        // },

        // 🎯 PREFIX MATCH (very strong)
        prefixScore: {
          $cond: [
            { $regexMatch: { input: "$title", regex: `^${safeSearch}`, options: "i" } },
            10,
            0
          ]
        },

        // 🎯 TITLE CONTAINS
        titleMatchScore: {
          $cond: [
            { $regexMatch: { input: "$title", regex: safeSearch, options: "i" } },
            5,
            0
          ]
        },

        // 🎯 DESCRIPTION MATCH
        descriptionScore: {
          $cond: [
            { $regexMatch: { input: "$description", regex: safeSearch, options: "i" } },
            2,
            0
          ]
        },

        // 🎯 POPULARITY (log scale)
        popularityScore: {
          $log10: { $add: ["$views", 1] }
        },

        // 🎯 RECENCY (new videos boost)
        recencyScore: {
          $divide: [
            { $subtract: [new Date(), "$createdAt"] },
            1000 * 60 * 60 * 24
          ]
        }
      }
    },

    {
      $addFields: {
        finalScore: {
          $add: [
            { $multiply: ["$textScore", 5] },   // 🔥 main relevance
            "$prefixScore",
            "$titleMatchScore",
            "$descriptionScore",
            "$popularityScore",
            { $multiply: ["$recencyScore", -0.005] } // decay over time
          ]
        }
      }
    },
    // 🔥 IMPORTANT: only keep relevant results
    {
      $match: {
         $or: [
          { prefixScore: { $gt: 0 } },
          { titleMatchScore: { $gt: 0 } },
          { descriptionScore: { $gt: 0 } }
        ]
      }
    },

    { $sort: { finalScore: -1 } },

    {
      $project: {
        title: 1,
        thumbnail: 1,
        views: 1,
        duration: 1,
        videoType: 1,
        youtubeVideoId: 1,
        videoUrl: 1
      }
    },

    { $skip: skip },
    { $limit: limit }
  ];

  // const videos = await Video.aggregate(pipeline);

  let videos = await Video.aggregate(pipeline);

  /* ================= Fallback Fuzzy Search ================= */

  if (videos.length === 0) {

    const allVideos = await Video.find(filter)
      .select("title thumbnail views duration videoType youtubeVideoId videoUrl description")
      .lean();

    const fuse = new Fuse(allVideos, {
      keys: ["title", "description"],
      threshold: 0.4, // 🔥 typo tolerance (lower = strict)
      ignoreLocation: true,
      minMatchCharLength: 2
    });

    const fuzzyResults = fuse.search(normalized);

    videos = fuzzyResults.slice(0, limit).map(r => r.item);
  }

  /* -------------------- COUNT -------------------- */

  const total = page === 1
    ? await Video.countDocuments({
        ...filter,
        $or: [
          { title: { $regex: safeSearch, $options: "i" } },
          { description: { $regex: safeSearch, $options: "i" } }
        ]
      })
    : 0;

  /* -------------------- RESPONSE -------------------- */

  return res.status(200).json(
    new ApiResponse(200, {
      videos,
      pagination: {
        total,
        page,
        limit,
        totalPages: total ? Math.ceil(total / limit) : null
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

  if (!video || !video.isActive) {
    throw new ApiError(404, "Video not found");
  }

  /* -------------------- AUTHORIZATION -------------------- */

  if (
    req.user.role !== "admin" &&
    video.uploadedBy.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized to delete this video");
  }

  /* -------------------- CLOUDINARY DELETE -------------------- */

  if (video.videoType === "internal" && video.videoUrl) {
    try {
      // 🔥 safer public_id extraction
      const urlParts = video.videoUrl.split("/");
      const fileWithExt = urlParts[urlParts.length - 1];
      const publicId = fileWithExt.substring(0, fileWithExt.lastIndexOf("."));

      // 👉 implement this util properly
      // await deleteCloudinary(publicId);

    } catch (err) {
      console.log("Cloudinary delete failed:", err.message);
    }
  }

  /* -------------------- SOFT DELETE -------------------- */

  video.isActive = false;
  await video.save({ validateBeforeSave: false });

  /* -------------------- RESPONSE -------------------- */

  return res.status(200).json(
    new ApiResponse(200, {}, "Video deleted successfully")
  );
});
