import mongoose from "mongoose";
import Category from "../models/category.model.js";
import Program from "../models/program.model.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


/* -------------------- CREATE CATEGORY -------------------- */

export const createCategory = asyncHandler(async (req, res) => {

  const { name, description, icon } = req.body;

  if (!name || typeof name !== "string") {
    throw new ApiError(400, "Valid category name is required");
  }

  const normalizedName = name.trim().toLowerCase();

  let category;

  try {
    category = await Category.create({
      name: normalizedName,
      description,
      icon,
      createdBy: req.user._id
    });

  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(409, "Category already exists");
    }
    throw error;
  }

  return res.status(201).json(
    new ApiResponse(201, category, "Category created")
  );
});


/* -------------------- GET ALL (USER + ADMIN) -------------------- */

export const getAllCategories = asyncHandler(async (req, res) => {

  let { page = 1, limit = 10, search } = req.query;

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

  /* -------------------- SEARCH -------------------- */

  if (search) {
    const normalizedSearch = search.trim().toLowerCase();

    matchStage.$or = [
      // ⚡ FAST PREFIX SEARCH (INDEX USED)
      {
        name: {
          $regex: `^${normalizedSearch}`,
          $options: "i"
        }
      },

      // 🔍 FLEXIBLE SEARCH (fallback)
      {
        name: {
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

    // 🔥 video count (optimized)
    {
      $lookup: {
        from: "videos",
        localField: "_id",
        foreignField: "category",
        pipeline: [
          { $project: { _id: 1 } } // ⚡ reduce memory
        ],
        as: "videos"
      }
    },

    {
      $addFields: {
        videoCount: { $size: "$videos" }
      }
    },

    {
      $project: {
        name: 1,
        description: 1,
        icon: 1,
        slug: 1,
        createdAt: 1,
        videoCount: 1
      }
    },

    { $sort: { name: 1 } }, // better UX for search

    { $skip: skip },
    { $limit: limit }
  ];

  const [categories, total] = await Promise.all([
    Category.aggregate(pipeline),
    Category.countDocuments(matchStage)
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      categories
    }, "Categories fetched")
  );
});


/* -------------------- GET SINGLE -------------------- */

export const getCategoryById = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID");
  }

  const query = { _id: id, isActive: true };

  // admin override
  if (req.user?.role === "admin") {
    delete query.isActive;
  }

  const category = await Category.findOne(query).lean();

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return res.status(200).json(
    new ApiResponse(200, category, "Category fetched")
  );
});


/* -------------------- UPDATE -------------------- */

export const updateCategory = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const { name, description, icon } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID");
  }

  const updateData = {};

  if (name) {
    const normalizedName = name.trim().toLowerCase();

    const exists = await Category.findOne({
      name: normalizedName,
      _id: { $ne: id }
    });

    if (exists) {
      throw new ApiError(409, "Category name already in use");
    }

    updateData.name = normalizedName;
    updateData.slug = normalizedName.replace(/\s+/g, "-");
  }

  if (description !== undefined) updateData.description = description;
  if (icon !== undefined) updateData.icon = icon;

  const updated = await Category.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    throw new ApiError(404, "Category not found");
  }

  return res.status(200).json(
    new ApiResponse(200, updated, "Category updated")
  );
});


/* -------------------- DELETE -------------------- */

export const deleteCategory = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID");
  }

  const hasPrograms = await Program.exists({ category: id });

  if (hasPrograms) {
    throw new ApiError(400, "Cannot delete category with programs");
  }

  const deleted = await Category.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!deleted) {
    throw new ApiError(404, "Category not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Category deleted")
  );
});