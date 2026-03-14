import Attempt from "../models/attempt.model.js";
import Question from "../models/question.model.js";
import QuestionOption from "../models/questionOption.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// submit answer
export const submitAttempt = asyncHandler(async (req, res) => {

  const { questionId, selectedOptionId, timeTaken } = req.body;

  if (!questionId || !selectedOptionId) {
    throw new ApiError(400, "Question and option required");
  }

  const question = await Question.findById(questionId);

  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  const option = await QuestionOption.findById(selectedOptionId);

  if (!option) {
    throw new ApiError(404, "Option not found");
  }

  const isCorrect = option.isCorrect;

  const attempt = await Attempt.create({
    user: req.user._id,
    question: questionId,
    selectedOption: selectedOptionId,
    isCorrect,
    timeTaken
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        attempt,
        correctAnswer: isCorrect
      },
      "Attempt recorded"
    )
  );
});


// get my attempts
export const getMyAttempts = asyncHandler(async (req, res) => {

  const attempts = await Attempt.find({
    user: req.user._id
  })
    .populate("question")
    .populate("selectedOption")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, attempts, "Attempts fetched")
  );
});


// user stats
export const getAttemptStats = asyncHandler(async (req, res) => {

  const userId = req.user._id;

  const total = await Attempt.countDocuments({ user: userId });

  const correct = await Attempt.countDocuments({
    user: userId,
    isCorrect: true
  });

  const accuracy = total === 0 ? 0 : (correct / total) * 100;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalAttempts: total,
        correctAttempts: correct,
        accuracy
      },
      "Stats fetched"
    )
  );
});