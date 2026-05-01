import mongoose from "mongoose";
import Subject from "../models/subject.model.js";
import Program from "../models/program.model.js";
import Chapter from "../models/chapter.model.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


/* -------------------- CREATE SUBJECT -------------------- */

export const createSubject = asyncHandler(async (req, res) => {

  const { name, program, icon, order } = req.body;

  if (!name?.trim() || !program) {
    throw new ApiError(400, "Name and program are required");
  }

  if (!mongoose.Types.ObjectId.isValid(program)) {
    throw new ApiError(400, "Invalid program ID");
  }

  const programDoc = await Program.findOne({
    _id: program,
    isActive: true
  });

  if (!programDoc) {
    throw new ApiError(404, "Program not found or inactive");
  }

  const normalizedName = name.trim().toLowerCase();

  let subject;
  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized");
  }
  try {
    subject = await Subject.create({
      name: normalizedName,
      program,
      icon,
      order,
      createdBy: req.user._id
    });

  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Subject already exists in this program");
    }
    throw error;
  }

  return res.status(201).json(
    new ApiResponse(201, subject, "Subject created")
  );
});


/* -------------------- GET ALL SUBJECTS -------------------- */

export const getAllSubjects = asyncHandler(async (req, res) => {

  let { page = 1, limit = 10, search, program } = req.query;

  page = parseInt(page);
//   limit = parseInt(limit);
  limit = Math.min(parseInt(limit) || 10, 50); // 🔥 ADD HERE

  if (page < 1 || limit < 1) {
    throw new ApiError(400, "Invalid pagination values");
  }

  const matchStage = {};

  // 🔥 user → only active
  if (!req.user || req.user.role !== "admin") {
    matchStage.isActive = true;
  }

  /* -------------------- PROGRAM FILTER -------------------- */

  if (program) {
    if (!mongoose.Types.ObjectId.isValid(program)) {
      throw new ApiError(400, "Invalid program ID");
    }
    matchStage.program = new mongoose.Types.ObjectId(program);
  }

  /* -------------------- SEARCH (FIXED) -------------------- */

  if (search) {
    const normalizedSearch = search.trim().toLowerCase();

    const escapeRegex = (text) =>
        text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const safeSearch = escapeRegex(normalizedSearch);

    matchStage.name = {
        $regex: `^${safeSearch}`,
        $options: "i"
    };
  }

  const skip = (page - 1) * limit;

  /* -------------------- PIPELINE -------------------- */

  const pipeline = [

    { $match: matchStage },

    // 🔥 join program (optimized)
    {
      $lookup: {
        from: "programs",
        localField: "program",
        foreignField: "_id",
        pipeline: [
          { $project: { name: 1 } }
        ],
        as: "program"
      }
    },
    { $unwind: "$program" },

    // 🔥 chapter count (optimized)
    {
        $lookup: {
            from: "chapters",
            let: { subjectId: "$_id" },
            pipeline: [
            {
                $match: {
                $expr: { $eq: ["$subject", "$$subjectId"] }
                }
            },
            { $count: "count" }
            ],
            as: "chapterStats"
        }
    },
    {
        $addFields: {
            chapterCount: {
            $ifNull: [{ $arrayElemAt: ["$chapterStats.count", 0] }, 0]
            }
        }
    },

    {
      $project: {
        name: 1,
        icon: 1,
        slug: 1,
        order: 1,
        createdAt: 1,
        chapterCount: 1,
        program: {
          _id: "$program._id",
          name: "$program.name"
        }
      }
    },

    // 🔥 smart sorting
    {
      $sort: search
        ? { name: 1 }   // search → alphabetical
        : { order: 1 }  // normal → structured order
    },

    { $skip: skip },
    { $limit: limit }
  ];

  const [subjects, total] = await Promise.all([
    Subject.aggregate(pipeline),
    Subject.countDocuments(matchStage)
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      subjects
    }, "Subjects fetched")
  );
});


/* -------------------- GET SINGLE -------------------- */

export const getSubjectById = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid subject ID");
  }

  const query = { _id: id, isActive: true };

  if (req.user?.role === "admin") {
    delete query.isActive;
  }

  const subject = await Subject.findOne(query)
    .populate("program", "name")
    .lean();

  if (!subject) {
    throw new ApiError(404, "Subject not found");
  }

  return res.status(200).json(
    new ApiResponse(200, subject, "Subject fetched")
  );
});


/* -------------------- UPDATE -------------------- */

export const updateSubject = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const { name, icon, order } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid subject ID");
  }

  const updateData = {};

  if (name) {
    const normalizedName = name.trim().toLowerCase();

    const current = await Subject.findById(id);

    if (!current) {
        throw new ApiError(404, "Subject not found");
    }

    const exists = await Subject.findOne({
        name: normalizedName,
        program: current.program,
        _id: { $ne: id }
    });

    if (exists) {
      throw new ApiError(409, "Subject already exists");
    }

    updateData.name = normalizedName;
    // updateData.slug = normalizedName.replace(/\s+/g, "-");
  }

  if (icon !== undefined) updateData.icon = icon;
  if (order !== undefined) updateData.order = order;

  const updated = await Subject.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    throw new ApiError(404, "Subject not found");
  }

  return res.status(200).json(
    new ApiResponse(200, updated, "Subject updated")
  );
});


/* -------------------- DELETE -------------------- */

export const deleteSubject = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid subject ID");
  }

  const hasChapters = await Chapter.exists({ subject: id });

  if (hasChapters) {
    throw new ApiError(400, "Cannot delete subject with chapters");
  }

  const deleted = await Subject.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!deleted) {
    throw new ApiError(404, "Subject not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Subject deleted")
  );
});