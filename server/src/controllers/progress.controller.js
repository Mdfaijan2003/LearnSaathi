import Progress from "../models/progress.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const markTopicComplete = asyncHandler(async (req, res) => {

  const { topicId } = req.body;

  let progress = await Progress.findOne({
    user: req.user._id,
    topic: topicId
  });

  if (!progress) {
    progress = await Progress.create({
      user: req.user._id,
      topic: topicId,
      completed: true,
      completedAt: new Date()
    });
  } else {
    progress.completed = true;
    progress.completedAt = new Date();
    await progress.save();
  }

  return res.status(200).json(
    new ApiResponse(200, progress, "Topic marked completed")
  );

});

export const getTopicProgress = asyncHandler(async (req, res) => {

  const { topicId } = req.params;

  const progress = await Progress.findOne({
    user: req.user._id,
    topic: topicId
  });

  return res.status(200).json(
    new ApiResponse(200, progress || {}, "Topic progress fetched")
  );

});

export const getUserProgress = asyncHandler(async (req, res) => {

  const progress = await Progress.find({
    user: req.user._id
  }).populate("topic", "title");

  return res.status(200).json(
    new ApiResponse(200, progress, "User progress fetched")
  );

});