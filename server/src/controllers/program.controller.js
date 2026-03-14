import Program from "../models/program.model.js";
import Category from "../models/category.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// Create Program
export const createProgram = asyncHandler(async (req, res) => {

  const { name, categoryId, description } = req.body;

  if (!name || !categoryId) {
    throw new ApiError(400, "Name and category are required");
  }

  const categoryExists = await Category.findById(categoryId);

  if (!categoryExists) {
    throw new ApiError(404, "Category not found");
  }

  const program = await Program.create({
    name,
    category: categoryId,
    description
  });

  return res.status(201).json(
    new ApiResponse(201, program, "Program created successfully")
  );
});


// Get Programs by Category
export const getPrograms = asyncHandler(async (req, res) => {

  const { categoryId } = req.query;

  const filter = categoryId ? { category: categoryId } : {};

  const programs = await Program.find(filter).populate("category", "name");

  return res.status(200).json(
    new ApiResponse(200, programs, "Programs fetched successfully")
  );
});