import mongoose from "mongoose";
import StudentNote from "../models/studentNote.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Fuse from "fuse.js";


/* =====================================================
   CREATE STUDENT NOTE
===================================================== */

export const createStudentNote = asyncHandler(async (req, res) => {
  const {
    title,
    content,
    category,
    program,
    subject,
    chapter,
    topic,
    video,
    timestamp,
    tags,
    color,
    editorType
  } = req.body;

  /* ---------------- VALIDATION ---------------- */

  if (!title || title.trim().length < 2) {
    throw new ApiError( 400, "Title is required" );

  }

  /* ---------------- DUPLICATE CHECK ---------------- */

  const existingNote = await StudentNote.findOne({
    user: req.user._id,
    title: title.trim().toLowerCase(),
    video: video || null,
    timestamp: timestamp || 0,
    isDeleted: false
  });

  if (existingNote) {
    throw new ApiError( 409,"Similar note already exists" );
  }

  /* ---------------- CREATE ---------------- */

  const note = await StudentNote.create({
    user: req.user._id,
    title: title.trim().toLowerCase(),
    content: content?.trim() || "",
    category: category || null,
    program: program || null,
    subject: subject || null,
    chapter: chapter || null,
    topic: topic || null,
    video: video || null,
    timestamp: timestamp || 0,
    tags: Array.isArray(tags)? tags: [],
    color: color || "#ffffff",
    editorType: editorType || "markdown"
  });

  return res.status(201).json(
    new ApiResponse(201, note,
     "Student note created successfully"
    )
  );
});


/* =====================================================
   GET STUDENT NOTES
===================================================== */

export const getStudentNotes = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    isPinned,
    isArchived,
    topic
  } = req.query;

  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Number(limit) || 10, 50);

  const skip = (page - 1) * limit;

  /* ---------------- FILTER ---------------- */

  const filter = {
    isDeleted: false
  };

  // admin access
  if (req.user.role !== "admin") {
    filter.user = req.user._id;
  }

  if (isPinned !== undefined) {
    filter.isPinned = isPinned === "true";
  }

  if (isArchived !== undefined) {
    filter.isArchived = isArchived === "true";
  }

  if ( topic && mongoose.Types.ObjectId.isValid(topic) ) {
    filter.topic = topic;
  }

  /* ---------------- QUERY ---------------- */

  const notes = await StudentNote.find(filter)
    .populate( "subject", "name")
    .populate( "topic", "title")
    .populate( "video", "title")
    .sort({ isPinned: -1, updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("-__v")
    .lean();

  const total = await StudentNote.countDocuments( filter );

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
            Math.ceil(total / limit)
        }
      },
      "Student notes fetched successfully"
    )
  );
});


/* =====================================================
   GET STUDENT NOTE BY ID
===================================================== */

export const getStudentNoteById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if ( !mongoose.Types.ObjectId.isValid(id) ) {
    throw new ApiError(400, "Invalid note ID");
  }

  /* ---------------- FILTER ---------------- */

  const filter = {
    _id: id,
    isDeleted: false
  };

  if (req.user.role !== "admin") {
    filter.user = req.user._id;
  }

  /* ---------------- QUERY ---------------- */

  const note = await StudentNote.findOne(filter)
    .populate("subject", "name")
    .populate("topic", "title")
    .populate("video", "title duration")
    .select("-__v");

  if (!note) {
    throw new ApiError( 404, "Student note not found" );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      note,
      "Student note fetched successfully"
    )
  );
});


/* =====================================================
   UPDATE STUDENT NOTE
===================================================== */

export const updateStudentNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id) ) {
    throw new ApiError( 400,"Invalid note ID" );
  }

  /* ---------------- FILTER ---------------- */

  const filter = {
    _id: id,
    isDeleted: false
  };

  if (req.user.role !== "admin") {
    filter.user = req.user._id;
  }

  /* ---------------- SAFE UPDATES ---------------- */

  const allowedUpdates = {
    title: req.body.title?.trim().toLowerCase(),
    content: req.body.content,
    category: req.body.category,
    program: req.body.program,
    subject: req.body.subject,
    chapter: req.body.chapter,
    topic: req.body.topic,
    video: req.body.video,
    timestamp: req.body.timestamp,
    tags: req.body.tags,
    color: req.body.color,
    editorType: req.body.editorType,
    isArchived: req.body.isArchived
  };

  // remove undefined
  Object.keys(allowedUpdates)
    .forEach((key) => {
      if ( allowedUpdates[key] === undefined ) {
        delete allowedUpdates[key];
      }
    });

  if (allowedUpdates.content) {
    allowedUpdates.content = allowedUpdates.content.trim();
  }

  /* ---------------- UPDATE ---------------- */

  const note = await StudentNote.findOneAndUpdate(
      filter,
      {
        $set: {
          ...allowedUpdates,
          lastEditedAt: new Date()
        }
      },
      {
        new: true,
        runValidators: true
      }
    );

  if (!note) {
    throw new ApiError(404,"Student note not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      note,
      "Student note updated successfully"
    )
  );
});


/* =====================================================
   DELETE STUDENT NOTE
===================================================== */

export const deleteStudentNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if ( !mongoose.Types.ObjectId.isValid(id) ) {
    throw new ApiError(400, "Invalid note ID");
  }

  /* ---------------- FILTER ---------------- */

  const filter = {
    _id: id,
    isDeleted: false
  };

  if (req.user.role !== "admin") {
    filter.user = req.user._id;
  }

  /* ---------------- SOFT DELETE ---------------- */

  const note =
    await StudentNote.findOneAndUpdate(
      filter,
      {
        $set: {
          isDeleted: true,
          deletedAt: new Date()
        }
      },
      { new: true }
    );

  if (!note) {
    throw new ApiError( 404,"Student note not found" );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Student note deleted successfully"
    )
  );
});


/* =====================================================
   TOGGLE PIN NOTE
===================================================== */

export const togglePinNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if ( !mongoose.Types.ObjectId.isValid(id) ) {
    throw new ApiError( 400, "Invalid note ID" );
  }

  const note = await StudentNote.findOne({
    _id: id,
    user: req.user._id,
    isDeleted: false
  });

  if (!note) {
    throw new ApiError( 404, "Student note not found");
  }

  note.isPinned = !note.isPinned;

  await note.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      note,
      note.isPinned
        ? "Note pinned"
        : "Note unpinned"
    )
  );
});


/* =====================================================
   ARCHIVE STUDENT NOTE
===================================================== */

export const archiveStudentNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if ( !mongoose.Types.ObjectId.isValid(id) ) {
    throw new ApiError( 400, "Invalid note ID" );
  }

  const note = await StudentNote.findOne({
    _id: id,
    user: req.user._id,
    isDeleted: false
  });

  if (!note) {
    throw new ApiError( 404, "Student note not found" );
  }

  note.isArchived = !note.isArchived;

  await note.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      note,
      note.isArchived
        ? "Note archived"
        : "Note unarchived"
    )
  );
});


/* =====================================================
   SEARCH STUDENT NOTES
===================================================== */

export const searchStudentNotes = asyncHandler(async (req, res) => {
  let {
    q,
    topic,
    video,
    isPinned,
    isArchived,
    page = 1,
    limit = 10
  } = req.query;

  /* ---------------- VALIDATION ---------------- */

  if (!q || typeof q !== "string" || q.trim().length < 2 ) {
    throw new ApiError( 400, "Search query must be at least 2 characters" );
  }

  page = Math.max(Number(page) || 1, 1);
  limit = Math.min(Number(limit) || 10, 50);

  const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

  const toObjectId = (id) => new mongoose.Types.ObjectId(id);

  if (topic && !isValidId(topic)) {
    throw new ApiError( 400, "Invalid topic ID" );
  }

  if (video && !isValidId(video)) {
    throw new ApiError( 400, "Invalid video ID" );
  }

  /* ---------------- FILTER ---------------- */

  const filter = {
    user: req.user._id,
    isDeleted: false
  };

  if (topic) {
    filter.topic = toObjectId(topic);
  }

  if (video) {
    filter.video = toObjectId(video);
  }

  if (isPinned !== undefined) {
    filter.isPinned = isPinned === "true";
  }

  if (isArchived !== undefined) {
    filter.isArchived = isArchived === "true";
  }

  /* ---------------- SEARCH PREP ---------------- */

  const normalized = q.trim();

  const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const safeSearch = escapeRegex(normalized);

  const skip = (page - 1) * limit;

  /* =====================================================
     ADVANCED SEARCH PIPELINE
  ===================================================== */

  const pipeline = [
    {
      $match: filter
    },
    {
      $addFields: {
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
        /* 🔥 CONTENT MATCH */
        contentScore: {
          $cond: [
            {
              $regexMatch: {
                input: "$content",
                regex: safeSearch,
                options: "i"
              }
            },
            3,
            0
          ]
        },
        /* 🔥 TAG MATCH */
        tagScore: {
          $cond: [
            {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: "$tags",
                      as: "tag",
                      cond: {
                        $regexMatch: {
                          input: "$$tag",
                          regex: safeSearch,
                          options: "i"
                        }
                      }
                    }
                  }
                },
                0
              ]
            },
            4,
            0
          ]
        },
        /* 🔥 PIN BOOST */
        pinScore: {
          $cond: [
            "$isPinned",
            2,
            0
          ]
        },
        /* 🔥 RECENCY */
        recencyScore: {
          $divide: [
            {
              $subtract: [
                new Date(),
                "$updatedAt"
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
            "$contentScore",
            "$tagScore",
            "$pinScore",
            {
              $multiply: [
                "$recencyScore",
                -0.01
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
          {
            prefixScore: {
              $gt: 0
            }
          },
          {
            titleMatchScore: {
              $gt: 0
            }
          },
          {
            contentScore: {
              $gt: 0
            }
          },
          {
            tagScore: {
              $gt: 0
            }
          }
        ]
      }
    },
    {
      $sort: {
        finalScore: -1,
        updatedAt: -1
      }
    },
    {
      $project: {
        title: 1,
        content: 1,
        tags: 1,
        color: 1,
        isPinned: 1,
        isArchived: 1,
        timestamp: 1,
        updatedAt: 1,
        wordCount: 1
      }
    },
    { $skip: skip },
    { $limit: limit }
  ];

  let notes = await StudentNote.aggregate( pipeline );

  /* =====================================================
     FUZZY FALLBACK
  ===================================================== */

  if (notes.length === 0) {
    const allNotes =
      await StudentNote.find(filter)
        .select(`
          title
          content
          tags
          color
          isPinned
          isArchived
          updatedAt
        `)
        .lean();

    const fuse = new Fuse(allNotes, {
      keys: [
        "title",
        "content",
        "tags"
      ],
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2
    });

    const fuzzyResults = fuse.search(normalized);

    notes = fuzzyResults
      .slice(0, limit)
      .map(r => r.item);
  }

  /* ---------------- COUNT ---------------- */

  const total = page === 1
    ? await StudentNote.countDocuments({
        ...filter,
        $or: [
          {
            title: {
              $regex: safeSearch,
              $options: "i"
            }
          },
          {
            content: {
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
   VIDEO TIMESTAMP NOTES
===================================================== */

export const getVideoTimestampNotes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if ( !mongoose.Types.ObjectId.isValid(videoId) ) {
    throw new ApiError( 400, "Invalid video ID" );
  }

  const notes = await StudentNote.find({
    user: req.user._id,
    video: videoId,
    isDeleted: false
  })
  .sort({ timestamp: 1 })
  .select(`
    title
    timestamp
    color
    isPinned
  `)
  .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      notes,
      "Video timestamp notes fetched successfully"
    )
  );
});