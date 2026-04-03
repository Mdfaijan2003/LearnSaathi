import mongoose from "mongoose";
import Question from "../models/question.model.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* =====================================================
   🔥 CREATE QUESTION
===================================================== */
export const createQuestion = asyncHandler(async (req, res) => {

  const {
    type,
    questionText,
    options,
    correctAnswer,
    sampleAnswer,
    difficulty,
    explanation,
    marks,
    negativeMarks,
    tags,
    program,
    subject,
    chapter,
    topic
  } = req.body;

  /* 🔥 VALIDATION */
  if (!type || !questionText) {
    throw new ApiError(400, "Type and question text required");
  }

  if (!program || !isValidId(program)) {
    throw new ApiError(400, "Invalid program ID");
  }

  if (!subject || !isValidId(subject)) {
    throw new ApiError(400, "Invalid subject ID");
  }

  if (chapter && !isValidId(chapter)) {
    throw new ApiError(400, "Invalid chapter ID");
  }

  if (topic && !isValidId(topic)) {
    throw new ApiError(400, "Invalid topic ID");
  }

  try {
    const question = await Question.create({
      type,
      questionText,
      options,
      correctAnswer,
      sampleAnswer,
      difficulty,
      explanation,
      marks,
      negativeMarks,
      tags,
      program,
      subject,
      chapter,
      topic,
      createdBy: req.user._id,
      createdByType:
        req.user.role === "admin" ? "admin" : "teacher"
    });

    return res.status(201).json(
      new ApiResponse(201, question, "Question created")
    );

  } catch (err) {
    throw new ApiError(500, err.message);
  }
});


/* =====================================================
   🔥 GET QUESTIONS
===================================================== */
export const getQuestions = asyncHandler(async (req, res) => {

  let {
    page = 1,
    limit = 10,
    type,
    difficulty,
    program,
    subject,
    chapter,
    topic,
    search
  } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  const filter = { isActive: true };

  if (type) filter.type = type;
  if (difficulty) filter.difficulty = difficulty;

  if (program && isValidId(program)) filter.program = program;
  if (subject && isValidId(subject)) filter.subject = subject;
  if (chapter && isValidId(chapter)) filter.chapter = chapter;
  if (topic && isValidId(topic)) filter.topic = topic;

  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (page - 1) * limit;

  try {

    const projection = search
      ? { score: { $meta: "textScore" } }
      : {};

    const sortStage = search
      ? { score: { $meta: "textScore" } }
      : { order: 1, createdAt: -1 };

    const [questions, total] = await Promise.all([
      Question.find(filter, projection)
        .sort(sortStage)
        .skip(skip)
        .limit(limit)
        .select("-options.isCorrect -correctAnswer -sampleAnswer")
        .lean(),

      Question.countDocuments(filter)
    ]);

    return res.status(200).json(
      new ApiResponse(200, {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        questions
      }, "Questions fetched")
    );

  } catch (err) {
    throw new ApiError(500, err.message);
  }
});


/* =====================================================
   🔥 GET SINGLE QUESTION
===================================================== */
export const getQuestionById = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid ID");
  }

  const question = await Question.findOne({
    _id: id,
    isActive: true
  }).select("-options.isCorrect -correctAnswer -sampleAnswer");

  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  return res.status(200).json(
    new ApiResponse(200, question, "Question fetched")
  );
});


/* =====================================================
   🔥 UPDATE QUESTION
===================================================== */
export const updateQuestion = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid ID");
  }

  const question = await Question.findOne({
    _id: id,
    isActive: true
  });

  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  /* 🔥 AUTH CHECK */
  if (
    req.user.role !== "admin" &&
    question.createdBy.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized");
  }

  Object.assign(question, req.body);

  await question.save();

  return res.status(200).json(
    new ApiResponse(200, question, "Question updated")
  );
});


/* =====================================================
   🔥 DELETE QUESTION (SOFT)
===================================================== */
export const deleteQuestion = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid ID");
  }

  const question = await Question.findOne({
    _id: id,
    isActive: true
  });

  if (!question) {
    throw new ApiError(404, "Question not found or already deleted");
  }

  /* 🔥 AUTH CHECK */
  if (
    req.user.role !== "admin" &&
    question.createdBy.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized");
  }

  question.isActive = false;
  await question.save();

  return res.status(200).json(
    new ApiResponse(200, {}, "Question deleted")
  );
});


/* =====================================================
   🔥 CHECK ANSWER
===================================================== */
export const checkAnswer = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const { selectedOption, answer } = req.body;

  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid ID");
  }

  const question = await Question.findOne({
    _id: id,
    isActive: true
  });

  if (!question) {
    throw new ApiError(404, "Question not found");
  }

  let isCorrect = false;

  /* 🔥 MCQ / TRUE FALSE */
  if (question.type === "mcq" || question.type === "true_false") {

    if (
      selectedOption === undefined ||
      selectedOption < 0 ||
      selectedOption >= question.options.length
    ) {
      throw new ApiError(400, "Invalid selected option");
    }

    const correctIndex = question.options.findIndex(o => o.isCorrect);
    isCorrect = selectedOption === correctIndex;
  }

  /* 🔥 SAQ */
  else if (question.type === "saq") {

    if (!answer) {
      throw new ApiError(400, "Answer required");
    }

    isCorrect =
      String(answer).trim().toLowerCase() ===
      String(question.correctAnswer).toLowerCase();
  }

  /* 🔥 LONG */
  else {
    return res.status(200).json(
      new ApiResponse(200, {
        isCorrect: null,
        message: "Manual evaluation required",
        sampleAnswer: question.sampleAnswer
      })
    );
  }

  /* 🔥 ANALYTICS */
  question.attemptCount += 1;
  if (isCorrect) question.correctCount += 1;

  await question.save();

  const score = isCorrect
    ? question.marks
    : -question.negativeMarks;

  return res.status(200).json(
    new ApiResponse(200, {
      isCorrect,
      score,
      explanation: question.explanation || null
    }, "Answer checked")
  );
});