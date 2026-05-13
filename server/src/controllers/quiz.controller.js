import mongoose from "mongoose";

import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";

import asyncHandler from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);


/* =====================================================
   🔥 CREATE QUIZ
===================================================== */

export const createQuiz = asyncHandler(async (req, res) => {

  const {
    title,
    description,
    instructions,
    quizType,
    difficulty,
    questions,
    durationMinutes,
    passingMarks,
    negativeMarkingEnabled,
    shuffleQuestions,
    shuffleOptions,
    showResultImmediately,
    allowRetake,
    maxAttempts,
    category,
    program,
    subject,
    chapter,
    topic,
    accessLevel
  } = req.body;

  /* ---------------- VALIDATION ---------------- */

  if (!title || title.trim().length < 3) {
    throw new ApiError(400,"Quiz title required");
  }

  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(400,"At least one question required");
  }

  if (!durationMinutes || durationMinutes < 1) {
    throw new ApiError(400,"Invalid duration");
  }

  /* ---------------- OBJECT ID VALIDATION ---------------- */

  // const ids = [
  //   category,
  //   program,
  //   subject,
  //   chapter,
  //   topic
  // ];

  // for (const id of ids) {
  //   if (
  //     id !== undefined &&
  //     id !== null &&
  //     id !== "" &&
  //     !isValidId(id)
  //   ) {
  //     throw new ApiError(
  //       400,
  //       "Invalid hierarchy ID"
  //     );
  //   }
  // }
  /* ---------------- OBJECT ID VALIDATION ---------------- */

  const hierarchyFields = {
    category,
    program,
    subject,
    chapter,
    topic
  };

  for (const [key, value] of Object.entries(hierarchyFields)) {
    // skip optional empty values
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      continue;
    }
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new ApiError(
        400,
        `Invalid ${key} ID`
      );
    }
  }

  /* ---------------- QUESTION VALIDATION ---------------- */

  for (const qid of questions) {
    if (!isValidId(qid)) {
      throw new ApiError(400,"Invalid question ID");
    }
  }

  const existingQuestions = await Question.find({
        _id: {
        $in: questions
        },
        isActive: true
    }).select("_id");

  if (existingQuestions.length !== questions.length) {
    throw new ApiError( 400,"Some questions not found");
  }

  /* ---------------- CREATE ---------------- */

  const quiz = await Quiz.create({
    title: title.trim(),
    description,
    instructions,
    quizType,
    difficulty,
    questions,
    durationMinutes,
    passingMarks: passingMarks || 0,
    negativeMarkingEnabled: negativeMarkingEnabled || false,
    shuffleQuestions: shuffleQuestions || false,
    shuffleOptions: shuffleOptions || false,
    showResultImmediately: showResultImmediately ?? true,
    allowRetake: allowRetake ?? true,
    maxAttempts: maxAttempts || 0,
    category,
    program,
    subject,
    chapter,
    topic,
    accessLevel: accessLevel || "free",
    createdBy: req.user._id
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      quiz,
      "Quiz created successfully"
    )
  );
});


/* =====================================================
   🔥 GET QUIZZES
===================================================== */

export const getQuizzes = asyncHandler(async (req, res) => {
  let {
    page = 1,
    limit = 10,
    difficulty,
    quizType,
    category,
    subject,
    topic,
    search
  } = req.query;

  page = Math.max(parseInt(page) || 1,1);

  limit = Math.min(Math.max(parseInt(limit) || 10, 1), 50);

  const skip = (page - 1) * limit;

  /* ---------------- FILTER ---------------- */

  const filter = {
    isActive: true,
    isPublished: true
  };

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  if (quizType) {
    filter.quizType = quizType;
  }

  if (category && isValidId(category)) {
    filter.category = category;
  }

  if (subject && isValidId(subject)) {
    filter.subject = subject;
  }

  if (topic && isValidId(topic)) {
    filter.topic = topic;
  }

  if (search) {
    filter.$text = {
      $search: search
    };
  }

  /* ---------------- QUERY ---------------- */

  const projection = search ? { score: { $meta: "textScore" } } : {};

  const sortStage = search ? { score: { $meta: "textScore" } } : { createdAt: -1 };

  const [quizzes, total] =
    await Promise.all([
      Quiz.find(filter, projection)
        .populate(
          "subject",
          "name"
        )
        .populate(
          "topic",
          "title"
        )
        .sort(sortStage)
        .skip(skip)
        .limit(limit)
        .select(`
          -questions
          -__v
        `)
        .lean(),
      Quiz.countDocuments(filter)
    ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        quizzes,
        pagination: {
          total,
          page,
          limit,
          totalPages:
            Math.ceil(total / limit)
        }
      },
      "Quizzes fetched successfully"
    )
  );
});


/* =====================================================
   🔥 GET QUIZ BY ID
===================================================== */

export const getQuizById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    throw new ApiError(400,"Invalid quiz ID");
  }

  const quiz = await Quiz.findOne({
    _id: id,
    isActive: true,
    isPublished: true
  })
    .populate({
      path: "questions",
      match: { isActive: true },
      select: `
        questionText
        questionImage
        options
        type
        difficulty
        marks
      `
    })
    .populate("subject", "name")
    .populate("topic", "title")
    .select(`
      -__v
    `);

  if (!quiz) {
    throw new ApiError( 404, "Quiz not found");
  }

  /* ---------------- SHUFFLE QUESTIONS ---------------- */

  if (quiz.shuffleQuestions) {
    quiz.questions.sort(() => Math.random() - 0.5);
  }

  /* ---------------- SHUFFLE OPTIONS ---------------- */

  if (quiz.shuffleOptions) {
    quiz.questions.forEach((q) => {
      q.options.sort(() => Math.random() - 0.5);
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      quiz,
      "Quiz fetched successfully"
    )
  );
});


/* =====================================================
   🔥 UPDATE QUIZ
===================================================== */

export const updateQuiz = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!isValidId(id)) {
    throw new ApiError(
      400,
      "Invalid quiz ID"
    );
  }

  const quiz = await Quiz.findOne({
    _id: id,
    isActive: true
  });

  if (!quiz) {
    throw new ApiError(
      404,
      "Quiz not found"
    );
  }

  /* ---------------- AUTHORIZATION ---------------- */

  if ( req.user.role !== "admin" && quiz.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "Not authorized"
    );
  }

  /* ---------------- SAFE UPDATE ---------------- */

  const allowedUpdates = {
    title: req.body.title,
    description: req.body.description,
    instructions: req.body.instructions,
    quizType: req.body.quizType,
    difficulty: req.body.difficulty,
    durationMinutes: req.body.durationMinutes,
    passingMarks: req.body.passingMarks,
    negativeMarkingEnabled: req.body.negativeMarkingEnabled,
    shuffleQuestions: req.body.shuffleQuestions,
    shuffleOptions: req.body.shuffleOptions,
    showResultImmediately: req.body.showResultImmediately,
    allowRetake: req.body.allowRetake,
    maxAttempts: req.body.maxAttempts,
    accessLevel: req.body.accessLevel,
    chapter: req.body.chapter,
    topic: req.body.topic
  };

  Object.keys(allowedUpdates)
    .forEach((key) => {
      if ( allowedUpdates[key] === undefined ) {
        delete allowedUpdates[key];
      }
    });
  Object.assign(
    quiz,
    allowedUpdates
  );

  await quiz.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      quiz,
      "Quiz updated successfully"
    )
  );
});


/* =====================================================
   🔥 DELETE QUIZ
===================================================== */

export const deleteQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    throw new ApiError(
      400,
      "Invalid quiz ID"
    );
  }

  const quiz = await Quiz.findOne({
    _id: id,
    isActive: true
  });

  if (!quiz) {
    throw new ApiError(
      404,
      "Quiz not found"
    );
  }

  /* ---------------- AUTHORIZATION ---------------- */

  if ( req.user.role !== "admin" && quiz.createdBy.toString() !== req.user._id.toString() ) {
    throw new ApiError(
      403,
      "Not authorized"
    );
  }

  quiz.isActive = false;

  await quiz.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Quiz deleted successfully"
    )
  );
});


/* =====================================================
   🔥 PUBLISH QUIZ
===================================================== */

export const publishQuiz = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) {
    throw new ApiError(
      400,
      "Invalid quiz ID"
    );
  }

  const quiz = await Quiz.findOne({
    _id: id,
    isActive: true
  });

  if (!quiz) {
    throw new ApiError(
      404,
      "Quiz not found"
    );
  }

  /* ---------------- AUTHORIZATION ---------------- */

  if ( req.user.role !== "admin" && quiz.createdBy.toString() !== req.user._id.toString() ) {
    throw new ApiError(
      403,
      "Not authorized"
    );
  }

  if ( !quiz.questions || quiz.questions.length === 0 ) {
    throw new ApiError(
      400,
      "Quiz must contain questions"
    );
  }

  quiz.isPublished = !quiz.isPublished;

  await quiz.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isPublished: quiz.isPublished
      },
      quiz.isPublished? "Quiz published" : "Quiz unpublished"
    )
  );
});