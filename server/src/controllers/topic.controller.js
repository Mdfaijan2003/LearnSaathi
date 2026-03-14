import Topic from "../models/topic.model.js";
import Chapter from "../models/chapter.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// create topic
export const createTopic = asyncHandler(async (req, res) => {

  const { title, chapterId, order, description } = req.body;

  if (!title || !chapterId) {
    throw new ApiError(400, "Title and chapter are required");
  }

  const chapterExists = await Chapter.findById(chapterId);

  if (!chapterExists) {
    throw new ApiError(404, "Chapter not found");
  }

  const topic = await Topic.create({
    title,
    chapter: chapterId,
    order,
    description
  });

  return res.status(201).json(
    new ApiResponse(201, topic, "Topic created successfully")
  );
});


// get topics
export const getTopics = asyncHandler(async (req, res) => {

  const { chapterId } = req.query;

  const filter = chapterId ? { chapter: chapterId } : {};

  const topics = await Topic.find(filter)
    .populate("chapter", "title");

  return res.status(200).json(
    new ApiResponse(200, topics, "Topics fetched successfully")
  );
});