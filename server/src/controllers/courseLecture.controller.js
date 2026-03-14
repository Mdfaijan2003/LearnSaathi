import CourseLecture from "../models/courseLecture.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const createLecture = asyncHandler(async (req, res) => {

  const { moduleId, title, videoType, videoUrl, duration, order, isPreview } = req.body;

  const lecture = await CourseLecture.create({
    module: moduleId,
    title,
    videoType,
    videoUrl,
    duration,
    order,
    isPreview
  });

  return res.status(201).json(
    new ApiResponse(201, lecture, "Lecture created")
  );
});

export const getLecturesByModule = asyncHandler(async (req, res) => {

  const { moduleId } = req.params;

  const lectures = await CourseLecture.find({ module: moduleId })
    .sort({ order: 1 });

  return res.status(200).json(
    new ApiResponse(200, lectures, "Lectures fetched")
  );
});