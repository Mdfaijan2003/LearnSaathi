import mongoose from "mongoose";
import Program from "../models/program.model.js";
import Category from "../models/category.model.js";
import Subject from "../models/subject.model.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


/* -------------------- CREATE PROGRAM -------------------- */

export const createProgram = asyncHandler(async (req, res) => {

  const { name, description, category, icon } = req.body;

  if (!name?.trim() || !category) {
    throw new ApiError(400, "Name and category are required");
  }

  if (!mongoose.Types.ObjectId.isValid(category)) {
    throw new ApiError(400, "Invalid category ID");
  }

  

  // ✅ check category exists + active
  const categoryDoc = await Category.findOne({
    _id: category,
    isActive: true
  });

  if (!categoryDoc) {
    throw new ApiError(404, "Category not found or inactive");
  }

  const normalizedName = name.trim().toLowerCase();

  let program;

  try {
    program = await Program.create({
      name: normalizedName,
      description,
      category,
      icon,
      createdBy: req.user._id
    });

  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Program already exists in this category");
    }
    throw error;
  }

  return res.status(201).json(
    new ApiResponse(201, program, "Program created")
  );
});


/* -------------------- GET ALL PROGRAMS -------------------- */

export const getAllPrograms = asyncHandler(async (req, res) => {

  let { page = 1, limit = 10, search, category } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  if (page < 1 || limit < 1) {
    throw new ApiError(400, "Invalid pagination values");
  }

  const matchStage = {};

  // 🔥 USER → only active
  if (!req.user || req.user.role !== "admin") {
    matchStage.isActive = true;
  }

  /* -------------------- CATEGORY FILTER -------------------- */

  if (category) {
    if (!mongoose.Types.ObjectId.isValid(category)) {
      throw new ApiError(400, "Invalid category ID");
    }
    matchStage.category = new mongoose.Types.ObjectId(category);
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

    // 🔥 join category (optimized)
    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        pipeline: [
          { $project: { name: 1 } } // ⚡ reduce data
        ],
        as: "category"
      }
    },
    { $unwind: "$category" },

    // 🔥 subject count (optimized)
    {
        $lookup: {
            from: "subjects",
            let: { programId: "$_id" },
            pipeline: [
            {
                $match: {
                $expr: { $eq: ["$program", "$$programId"] }
                }
            },
            { $count: "count" }
            ],
            as: "subjectStats"
        }
    },
    {
        $addFields: {
            subjectCount: {
            $ifNull: [{ $arrayElemAt: ["$subjectStats.count", 0] }, 0]
            }
        }
    },

    {
      $project: {
        name: 1,
        description: 1,
        icon: 1,
        slug: 1,
        createdAt: 1,
        subjectCount: 1,
        category: {
          _id: "$category._id",
          name: "$category.name"
        }
      }
    },

    // 🔥 better UX sorting
    {
      $sort: search
        ? { name: 1 }
        : { createdAt: -1 }
    },

    { $skip: skip },
    { $limit: limit }
  ];

  const [programs, total] = await Promise.all([
    Program.aggregate(pipeline),
    Program.countDocuments(matchStage)
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      programs
    }, "Programs fetched")
  );
});


/* -------------------- GET SINGLE -------------------- */

export const getProgramById = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid program ID");
  }

  const query = { _id: id, isActive: true };

  if (req.user?.role === "admin") {
    delete query.isActive;
  }

  const program = await Program.findOne(query)
    .populate("category", "name")
    .lean();

  if (!program) {
    throw new ApiError(404, "Program not found");
  }

  return res.status(200).json(
    new ApiResponse(200, program, "Program fetched")
  );
});


/* -------------------- UPDATE -------------------- */

export const updateProgram = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const { name, description, icon } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid program ID");
  }

  if (!req.user?._id) {
    throw new ApiError(401, "Unauthorized");
  }

  const updateData = {};

  if (name) {
    const normalizedName = name.trim().toLowerCase();

    const currentProgram = await Program.findById(id);
    if (!currentProgram) {
        throw new ApiError(404, "Program not found");
    }

    const existing = await Program.findOne({
      name: normalizedName,
      category: currentProgram.category,
      _id: { $ne: id }
    });

    if (existing) {
      throw new ApiError(409, "Program name already exists");
    }

    updateData.name = normalizedName;
    // updateData.slug = normalizedName.replace(/\s+/g, "-");
  }

  if (description !== undefined) updateData.description = description;
  if (icon !== undefined) updateData.icon = icon;

  const updated = await Program.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    throw new ApiError(404, "Program not found");
  }

  return res.status(200).json(
    new ApiResponse(200, updated, "Program updated")
  );
});


/* -------------------- DELETE -------------------- */

export const deleteProgram = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid program ID");
  }

  // ❗ prevent delete if subjects exist
  const hasSubjects = await Subject.exists({ program: id });

  if (hasSubjects) {
    throw new ApiError(400, "Cannot delete program with subjects");
  }

  const deleted = await Program.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!deleted) {
    throw new ApiError(404, "Program not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Program deleted")
  );
});