import mongoose from "mongoose";
import fs from "fs/promises";
import Fuse from "fuse.js";

import asyncHandler from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { redisClient } from "../utils/redis.js";

import OfficialNote from "../models/officialNote.model.js";

import Category from "../models/category.model.js";
import Program from "../models/program.model.js";
import Subject from "../models/subject.model.js";
import Chapter from "../models/chapter.model.js";
import Topic from "../models/topic.model.js";

import {
  uploadDocumentCloudinary,
  deleteFromCloudinary
} from "../utils/cloudinary.js";


/* =====================================================
   COMMON
===================================================== */

const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);


/* =====================================================
   CLEAR CACHE
===================================================== */

const clearOfficialNotesCache = async () => {

  if (!redisClient.isOpen) return;

  const keys = await redisClient.keys(
    "official-notes:*"
  );

  if (keys.length > 0) {
    await redisClient.del(...keys);
  }

};


/* =====================================================
   UPLOAD OFFICIAL NOTE
===================================================== */

export const uploadOfficialNote = asyncHandler(async (req, res) => {

  /* ---------------- AUTH ---------------- */

  if (
    req.user.role !== "admin" &&
    !(
      req.user.role === "teacher" &&
      req.user.teacherStatus === "approved"
    )
  ) {

    throw new ApiError(
      403,
      "Only approved teachers or admins can upload notes"
    );

  }

  /* ---------------- BODY ---------------- */

  let {

    title,
    description,
    category,
    program,
    subject,
    chapter,
    topic,
    noteType,
    accessLevel

  } = req.body;

  /* ---------------- FILE ---------------- */

  const noteFile = req.file?.path;

  if (!noteFile) {
    throw new ApiError(400, "Note file is required");
  }

  /* ---------------- FILE SIZE ---------------- */

  if (req.file.size > 100 * 1024 * 1024) {

    throw new ApiError(
      400,
      "File size exceeds 100MB"
    );

  }

  if (!title?.trim()) {
    throw new ApiError(400, "Title is required");
  }

  if (!category || !isValidId(category)) {
    throw new ApiError(400, "Valid category is required");
  }

  const categoryDoc = await Category.findById(category);

  if (!categoryDoc) {
    throw new ApiError(404, "Category not found");
  }

  /* =====================================================
     HIERARCHY AUTO RESOLUTION
  ===================================================== */

  if (topic) {

    if (!isValidId(topic)) {
      throw new ApiError(400, "Invalid topic ID");
    }

    const topicDoc = await Topic.findById(topic)
      .populate({
        path: "chapter",
        populate: {
          path: "subject",
          populate: {
            path: "program"
          }
        }
      });

    if (!topicDoc) {
      throw new ApiError(404, "Topic not found");
    }

    chapter = topicDoc.chapter._id;
    subject = topicDoc.chapter.subject._id;
    program = topicDoc.chapter.subject.program._id;
    category = topicDoc.chapter.subject.program.category;
  }

  else if (chapter) {

    if (!isValidId(chapter)) {
      throw new ApiError(400, "Invalid chapter ID");
    }

    const chapterDoc = await Chapter.findById(chapter)
      .populate({
        path: "subject",
        populate: {
          path: "program"
        }
      });

    if (!chapterDoc) {
      throw new ApiError(404, "Chapter not found");
    }

    subject = chapterDoc.subject._id;
    program = chapterDoc.subject.program._id;
    category = chapterDoc.subject.program.category;
  }

  else if (subject) {

    if (!isValidId(subject)) {
      throw new ApiError(400, "Invalid subject ID");
    }

    const subjectDoc = await Subject.findById(subject)
      .populate("program");

    if (!subjectDoc) {
      throw new ApiError(404, "Subject not found");
    }

    program = subjectDoc.program._id;
    category = subjectDoc.program.category;
  }

  else if (program) {

    if (!isValidId(program)) {
      throw new ApiError(400, "Invalid program ID");
    }

    const programDoc = await Program.findById(program);

    if (!programDoc) {
      throw new ApiError(404, "Program not found");
    }

    category = programDoc.category;
  }

  /* ---------------- FILE TYPE ---------------- */

  const mimeType = req.file.mimetype;

  const mimeMap = {

    "application/pdf": "pdf",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "docx",

    "application/vnd.openxmlformats-officedocument.presentationml.presentation":
      "pptx",

    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "xlsx",

    "application/zip": "zip",

    "application/x-zip-compressed": "zip",

    "audio/mpeg": "mp3",

    "audio/wav": "wav"

  };

  const fileType = mimeMap[mimeType];

  if (!fileType) {
    await fs.unlink(noteFile).catch(() => {});
    throw new ApiError(
      400,
      "Unsupported file type"
    );

  }

  /* ---------------- CLOUDINARY ---------------- */

  // const uploaded = await uploadCloudinary(noteFile);

  // if (!uploaded?.url) {
  //   throw new ApiError(
  //     500,
  //     "Cloudinary upload failed"
  //   );
  // }


  const uploaded = await uploadDocumentCloudinary(noteFile);
  
  if (!uploaded?.secure_url) {
    throw new ApiError(
      500,
      "Cloudinary upload failed"
    );
  }
  /* ---------------- CREATE ---------------- */

  let note;

  try {
    note = await OfficialNote.create({
      title: title.trim(),
      description,
      fileUrl: uploaded.secure_url,
      filePublicId: uploaded.public_id,
      fileType,
      fileSize:
        uploaded.bytes || req.file.size || 0,
      category,
      program,
      subject,
      chapter,
      topic,
      noteType: noteType || "notes",
      accessLevel: accessLevel || "free",
      uploadedBy: req.user._id
    });
  } catch (error) {
    if (uploaded?.public_id) {

      await deleteFromCloudinary(
        uploaded.public_id,
        fileType === "pdf"
        ? "image"
        : "raw"
      ).catch(() => {});

    }
    if (error.code === 11000) {
      throw new ApiError(
        409,
        "Duplicate note already exists"
      );
    }
    throw error;
  }

  /* ---------------- CACHE INVALIDATION ---------------- */

  try {
    await clearOfficialNotesCache();
  } catch (err) {
    console.log("Redis invalidation failed");
  }

  /* ---------------- RESPONSE ---------------- */

  return res.status(201).json(
    new ApiResponse(
      201,
      note,
      "Official note uploaded successfully"
    )
  );
});


/* =====================================================
   GET OFFICIAL NOTES
===================================================== */

export const getOfficialNotes = asyncHandler(async (req, res) => {

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

  page = Math.max(Number(page) || 1, 1);

  limit = Math.min(Number(limit) || 10, 50);

  const cacheKey =
    `official-notes:${page}:${limit}:${category || ""}:${program || ""}:${subject || ""}:${chapter || ""}:${topic || ""}:${sort}`;

  /* ---------------- CACHE ---------------- */

  try {

    if (redisClient.isOpen) {

      const cached =
        await redisClient.get(cacheKey);

      if (cached) {

        return res.status(200).json(
          new ApiResponse(
            200,
            JSON.parse(cached),
            "Official notes fetched from cache"
          )
        );

      }

    }

  } catch (err) {

    console.log("Redis read failed");

  }

  /* ---------------- FILTER ---------------- */

  const filter = {
    isActive: true
  };

  if (topic && isValidId(topic)) {
    filter.topic = topic;
  }

  else if (chapter && isValidId(chapter)) {
    filter.chapter = chapter;
  }

  else if (subject && isValidId(subject)) {
    filter.subject = subject;
  }

  else if (program && isValidId(program)) {
    filter.program = program;
  }

  else if (category && isValidId(category)) {
    filter.category = category;
  }

  /* ---------------- SORT ---------------- */

  const sortOptions = {

    latest: { createdAt: -1 },

    popular: { downloads: -1 },

    views: { views: -1 }

  };

  const skip = (page - 1) * limit;

  /* ---------------- QUERY ---------------- */

  const [notes, total] = await Promise.all([

    OfficialNote.find(filter)

      .sort(sortOptions[sort] || sortOptions.latest)

      .skip(skip)

      .limit(limit)

      .populate("uploadedBy", "username fullName")

      .select("-__v")

      .lean(),

    OfficialNote.countDocuments(filter)

  ]);

  const data = {

    notes,

    pagination: {

      total,
      page,
      limit,

      totalPages:
        Math.ceil(total / limit)

    }

  };

  /* ---------------- CACHE SAVE ---------------- */

  try {

    if (redisClient.isOpen) {

      await redisClient.setEx(
        cacheKey,
        300,
        JSON.stringify(data)
      );

    }

  } catch (err) {

    console.log("Redis write failed");

  }

  /* ---------------- RESPONSE ---------------- */

  return res.status(200).json(
    new ApiResponse(
      200,
      data,
      "Official notes fetched successfully"
    )
  );

});


/* =====================================================
   GET NOTE BY ID
===================================================== */

export const getOfficialNoteById = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid note ID");
  }

  const cacheKey = `official-note:${id}`;

  /* ---------------- CACHE ---------------- */

  try {
    if (redisClient.isOpen) {
      const cached =
        await redisClient.get(cacheKey);
      if (cached) {
        await OfficialNote.findOneAndUpdate(
          {
            _id: id,
            isActive: true
          },

          {
            $inc: {
              views: 1
            }
          },

          {
            new: true
          }

        );

        return res.status(200).json(
          new ApiResponse(
            200,
            JSON.parse(cached),
            "Official note fetched from cache"
          )
        );

      }

    }

  } catch (err) {

    console.log("Redis read failed");

  }

  /* ---------------- DB ---------------- */

  const note =
    await OfficialNote.findByIdAndUpdate(
    {
      _id: id,
      isActive: true
    },

    {
      $inc: {
        views: 1
      }
    },

    {
      new: true
    }

  )
    .populate("uploadedBy", "username fullName")
    .populate("category", "name")
    .populate("program", "name")
    .populate("subject", "name")
    .populate("chapter", "title")
    .populate("topic", "title")
    .lean();

  if (!note || !note.isActive) {
    throw new ApiError(404, "Note not found");
  }

  /* ---------------- CACHE SAVE ---------------- */

  try {

    if (redisClient.isOpen) {

      await redisClient.setEx(
        cacheKey,
        300,
        JSON.stringify(note)
      );

    }

  } catch (err) {

    console.log("Redis write failed");

  }

  /* ---------------- RESPONSE ---------------- */

  return res.status(200).json(
    new ApiResponse(
      200,
      note,
      "Official note fetched successfully"
    )
  );

});


/* =====================================================
   SEARCH OFFICIAL NOTES
===================================================== */


export const searchOfficialNotes = asyncHandler(async (req, res) => {

  let {
    q,
    category,
    program,
    subject,
    page = 1,
    limit = 10
  } = req.query;

  /* ---------------- VALIDATION ---------------- */

  if (!q || typeof q !== "string" || q.trim().length < 2) {

    throw new ApiError(
      400,
      "Search query must be at least 2 characters"
    );

  }

  page = Math.max(Number(page) || 1, 1);

  limit = Math.min(Number(limit) || 10, 50);

  const isValidId = (id) =>
    mongoose.Types.ObjectId.isValid(id);

  const toObjectId = (id) =>
    new mongoose.Types.ObjectId(id);

  if (category && !isValidId(category)) {
    throw new ApiError(400, "Invalid category ID");
  }

  if (program && !isValidId(program)) {
    throw new ApiError(400, "Invalid program ID");
  }

  if (subject && !isValidId(subject)) {
    throw new ApiError(400, "Invalid subject ID");
  }

  /* ---------------- FILTER ---------------- */

  const filter = {
    isActive: true
  };

  if (category) {
    filter.category = toObjectId(category);
  }

  if (program) {
    filter.program = toObjectId(program);
  }

  if (subject) {
    filter.subject = toObjectId(subject);
  }

  /* ---------------- SEARCH PREP ---------------- */

  const normalized = q.trim();

  const escapeRegex = (text) =>
    text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const safeSearch = escapeRegex(normalized);

  const skip = (page - 1) * limit;

  /* =====================================================
     ADVANCED PIPELINE
  ===================================================== */

  const pipeline = [
    {
      $match: filter
    },

    {
      $addFields: {

        /* 🔥 PREFIX MATCH */

        prefixScore: {
          $cond: [
            {
              $regexMatch: {
                input: "$title",
                regex: `^${safeSearch}`,
                options: "i"
              }
            },
            10,
            0
          ]
        },

        /* 🔥 TITLE MATCH */

        titleMatchScore: {
          $cond: [
            {
              $regexMatch: {
                input: "$title",
                regex: safeSearch,
                options: "i"
              }
            },
            5,
            0
          ]
        },

        /* 🔥 DESCRIPTION MATCH */

        descriptionScore: {
          $cond: [
            {
              $regexMatch: {
                input: "$description",
                regex: safeSearch,
                options: "i"
              }
            },
            2,
            0
          ]
        },

        /* 🔥 POPULARITY */

        popularityScore: {
          $log10: {
            $add: ["$downloads", 1]
          }
        },

        /* 🔥 RECENCY */

        recencyScore: {
          $divide: [
            {
              $subtract: [
                new Date(),
                "$createdAt"
              ]
            },
            1000 * 60 * 60 * 24
          ]
        }

      }
    },

    {
      $addFields: {

        finalScore: {

          $add: [
            "$prefixScore",
            "$titleMatchScore",
            "$descriptionScore",
            "$popularityScore",
            {
              $multiply: [
                "$recencyScore",
                -0.005
              ]
            }
          ]
        }
      }
    },

    /* 🔥 IMPORTANT */

    {
      $match: {
        $or: [
          { prefixScore: { $gt: 0 } },
          { titleMatchScore: { $gt: 0 } },
          { descriptionScore: { $gt: 0 } }
        ]
      }
    },

    {
      $sort: {
        finalScore: -1
      }
    },

    {
      $project: {
        title: 1,
        description: 1,
        fileType: 1,
        fileUrl: 1,
        downloads: 1,
        views: 1,
        createdAt: 1
      }
    },
    { $skip: skip },
    { $limit: limit }
  ];

  let notes =
    await OfficialNote.aggregate(pipeline);

  /* =====================================================
     FUZZY FALLBACK
  ===================================================== */

  if (notes.length === 0) {
    const allNotes =
      await OfficialNote.find(filter)
        .select(`
          title
          description
          fileType
          fileUrl
          downloads
          views
        `)
        .lean();

    const fuse = new Fuse(allNotes, {

      keys: [
        "title",
        "description"
      ],

      threshold: 0.4,

      ignoreLocation: true,

      minMatchCharLength: 2

    });

    const fuzzyResults =
      fuse.search(normalized);

    notes = fuzzyResults
      .slice(0, limit)
      .map(r => r.item);
  }

  /* ---------------- COUNT ---------------- */

  const total = page === 1
    ? await OfficialNote.countDocuments({
        ...filter,
        $or: [
          {
            title: {
              $regex: safeSearch,
              $options: "i"
            }
          },

          {
            description: {
              $regex: safeSearch,
              $options: "i"
            }
          }
        ]
      })
    : 0;

  /* ---------------- RESPONSE ---------------- */

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notes,
        pagination: {
          total,
          page,
          limit,
          totalPages:
            total
              ? Math.ceil(total / limit)
              : null
        }
      },
      "Search results fetched successfully"
    )
  );
});


/* =====================================================
   DOWNLOAD OFFICIAL NOTE
===================================================== */

export const downloadOfficialNote = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid note ID");
  }

  const note =
    await OfficialNote.findOneAndUpdate(
      {
        _id: id,
        isActive: true
      },

      {
        $inc: {
          downloads: 1
        }
      },

      {
        new: true
      }

    );

  if (!note || !note.isActive) {
    throw new ApiError(404, "Note not found");
  }

  return res.redirect(note.fileUrl);

});


/* =====================================================
   DELETE OFFICIAL NOTE
===================================================== */

export const deleteOfficialNote = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid note ID");
  }

  const note = await OfficialNote.findById(id);

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  /* ---------------- AUTHORIZATION ---------------- */

  if (

    req.user.role !== "admin" &&

    note.uploadedBy.toString() !==
    req.user._id.toString()

  ) {

    throw new ApiError(
      403,
      "Not authorized to delete this note"
    );

  }

  /* ---------------- CLOUDINARY DELETE ---------------- */

  try {

    if (note.filePublicId) {

      await deleteFromCloudinary(
        note.filePublicId,
        "raw"
      );

    }

  } catch (err) {

    console.log("Cloudinary delete failed");

  }

  /* ---------------- SOFT DELETE ---------------- */

  note.isActive = false;

  await note.save();

  /* ---------------- CACHE INVALIDATION ---------------- */

  try {

    await Promise.all([

      redisClient.del(
        `official-note:${id}`
      ),

      clearOfficialNotesCache()

    ]);

  } catch (err) {

    console.log("Redis invalidation failed");

  }

  /* ---------------- RESPONSE ---------------- */

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Official note deleted successfully"
    )
  );

});