import Category from "../models/category.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// Create Category
export const createCategory = asyncHandler(async (req, res) => {

  const { name, description } = req.body;

  if (!name) {
    throw new ApiError(400, "Category name is required");
  }

  const existingCategory = await Category.findOne({ name });

  if (existingCategory) {
    throw new ApiError(409, "Category already exists");
  }

  const category = await Category.create({
    name,
    description,
    createdBy: req.user?._id
  });

  return res.status(201).json(
    new ApiResponse(201, category, "Category created successfully")
  );
});


// Get All Categories
export const getCategories = asyncHandler(async (req, res) => {

  const categories = await Category.find();

  return res.status(200).json(
    new ApiResponse(200, categories, "Categories fetched successfully")
  );
});