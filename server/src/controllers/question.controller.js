import Question from "../models/question.model.js";
import QuestionOption from "../models/questionOption.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// create question
export const createQuestion = asyncHandler(async (req, res) => {

  const {
    text,
    type,
    difficulty,
    program,
    subject,
    chapter,
    topic,
    explanation,
    options
  } = req.body;

  if (!text || !type || !program || !subject) {
    throw new ApiError(400, "Required fields missing");
  }

  const question = await Question.create({
    text,
    type,
    difficulty,
    program,
    subject,
    chapter,
    topic,
    explanation,
    createdBy: req.user._id,
    createdByType: req.user.role
  });

  // create options if MCQ
  if (type === "mcq" && options?.length) {

    const optionDocs = options.map(opt => ({
      question: question._id,
      text: opt.text,
      isCorrect: opt.isCorrect
    }));

    await QuestionOption.insertMany(optionDocs);
  }

  return res.status(201).json(
    new ApiResponse(201, question, "Question created")
  );

});


// get questions by topic
export const getQuestionsByTopic = asyncHandler(async (req, res) => {

  const questions = await Question.find({
    topic: req.params.topicId
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, questions, "Questions fetched")
  );

});


// get single question with options
export const getQuestionById = asyncHandler(async (req, res) => {

  const question = await Question.findById(req.params.questionId);

  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  const options = await QuestionOption.find({
    question: question._id
  });

  return res.status(200).json(
    new ApiResponse(200, { question, options }, "Question fetched")
  );

});