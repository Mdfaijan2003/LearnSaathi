import Test from "../models/test.model.js";
import TestQuestion from "../models/testQuestion.model.js";
import TestAttempt from "../models/testAttempt.model.js";
import QuestionOption from "../models/questionOption.model.js";

import shuffleArray from "../utils/shuffleArray.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// START TEST
export const startTest = asyncHandler(async (req, res) => {

  const { testId } = req.body;

  const test = await Test.findById(testId);

  if (!test) {
    throw new ApiError(404, "Test not found");
  }

  // Block multiple attempts for exam
  if (test.testType === "exam") {

    const existingAttempt = await TestAttempt.findOne({
      user: req.user._id,
      test: testId,
      status: "submitted"
    });

    if (existingAttempt) {
      throw new ApiError(400, "You have already attempted this exam");
    }
  }

  const testQuestions = await TestQuestion.find({ test: testId })
    .populate({
      path: "question",
      populate: {
        path: "options",
        select: "text"
      }
    });

  if (!testQuestions.length) {
    throw new ApiError(400, "No questions found for this test");
  }

  let questions = testQuestions.map(q => q.question);

  // Shuffle questions
  questions = shuffleArray(questions);

  // Shuffle options
  questions = questions.map(q => {
    q.options = shuffleArray(q.options);
    return q;
  });

  const attempt = await TestAttempt.create({
    user: req.user._id,
    test: testId,
    shuffledQuestions: questions.map(q => q._id),
    totalQuestions: questions.length
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        attemptId: attempt._id,
        questions
      },
      "Test started successfully"
    )
  );

});


// SAVE ANSWER (AUTO SAVE)
export const saveAnswer = asyncHandler(async (req, res) => {

  const { attemptId, questionId, selectedOptionId, timeTaken } = req.body;

  const attempt = await TestAttempt.findById(attemptId);

  if (!attempt) {
    throw new ApiError(404, "Attempt not found");
  }

  if (attempt.status !== "inProgress") {
    throw new ApiError(400, "Test already submitted");
  }

  const existingAnswer = attempt.answers.find(
    ans => ans.question.toString() === questionId
  );

  if (existingAnswer) {

    existingAnswer.selectedOption = selectedOptionId;
    existingAnswer.timeTaken = timeTaken;

  } else {

    attempt.answers.push({
      question: questionId,
      selectedOption: selectedOptionId,
      timeTaken
    });

  }

  await attempt.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Answer saved successfully")
  );

});


// SUBMIT TEST
export const submitTest = asyncHandler(async (req, res) => {

  const { attemptId } = req.body;

  const attempt = await TestAttempt.findById(attemptId)
    .populate("answers.question")
    .populate("answers.selectedOption")
    .populate("test");

  if (!attempt) {
    throw new ApiError(404, "Attempt not found");
  }

  if (attempt.status === "submitted") {
    throw new ApiError(400, "Test already submitted");
  }

  const test = attempt.test;

  let correct = 0;
  let wrong = 0;
  let score = 0;

  for (const ans of attempt.answers) {

    const correctOption = await QuestionOption.findOne({
      question: ans.question._id,
      isCorrect: true
    });

    if (!correctOption) continue;

    if (
      ans.selectedOption &&
      ans.selectedOption._id.toString() === correctOption._id.toString()
    ) {

      correct++;
      score += test.marksPerQuestion;

    } else {

      wrong++;

      if (test.negativeMarking) {
        score -= test.negativeMarks;
      }

    }
  }

  attempt.score = score;
  attempt.correctAnswers = correct;
  attempt.wrongAnswers = wrong;
  attempt.completedAt = new Date();
  attempt.status = "submitted";

  await attempt.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        score,
        correct,
        wrong,
        totalQuestions: attempt.totalQuestions
      },
      "Test submitted successfully"
    )
  );

});


// GET ATTEMPT
export const getAttempt = asyncHandler(async (req, res) => {

  const attempt = await TestAttempt.findById(req.params.id)
    .populate("test");

  if (!attempt) {
    throw new ApiError(404, "Attempt not found");
  }

  return res.status(200).json(
    new ApiResponse(200, attempt, "Attempt fetched successfully")
  );

});


// GET MY ATTEMPTS
export const getMyAttempts = asyncHandler(async (req, res) => {

  const attempts = await TestAttempt.find({
    user: req.user._id
  })
    .populate("test")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, attempts, "Attempts fetched successfully")
  );

});