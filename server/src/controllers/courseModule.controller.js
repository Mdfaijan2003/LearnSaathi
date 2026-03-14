import CourseModule from "../models/courseModule.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const createModule = asyncHandler(async (req, res) => {

  const { courseId, title, order } = req.body;

  const module = await CourseModule.create({
    course: courseId,
    title,
    order
  });

  return res.status(201).json(
    new ApiResponse(201, module, "Module created")
  );
});

export const getModulesByCourse = asyncHandler(async (req, res) => {

  const { courseId } = req.params;

  const modules = await CourseModule.find({ course: courseId })
    .sort({ order: 1 });

  return res.status(200).json(
    new ApiResponse(200, modules, "Modules fetched")
  );
});