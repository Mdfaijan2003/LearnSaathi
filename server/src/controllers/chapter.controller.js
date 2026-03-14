import Chapter from "../models/chapter.model.js";
import Subject from "../models/subject.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// Create chapter
export const createChapter = asyncHandler(async (req, res) => {

  const { title, subjectId, estimatedMinTime, estimatedMaxTime, order } = req.body;

  if (!title || !subjectId) {
    throw new ApiError(400, "Title and subject are required");
  }

  const subjectExists = await Subject.findById(subjectId);

  if (!subjectExists) {
    throw new ApiError(404, "Subject not found");
  }

  const chapter = await Chapter.create({
    title,
    subject: subjectId,
    estimatedMinTime,
    estimatedMaxTime,
    order
  });

  return res.status(201).json(
    new ApiResponse(201, chapter, "Chapter created successfully")
  );
});


// Get chapters
export const getChapters = asyncHandler(async (req, res) => {

  const { subjectId } = req.query;

  const filter = subjectId ? { subject: subjectId } : {};

  const chapters = await Chapter.find(filter)
    .populate("subject", "name");

  return res.status(200).json(
    new ApiResponse(200, chapters, "Chapters fetched successfully")
  );
});