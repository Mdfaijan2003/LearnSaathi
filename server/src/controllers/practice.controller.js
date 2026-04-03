import mongoose from "mongoose";
import PracticeSession from "../models/practiceSession.model.js";
import Question from "../models/question.model.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

/* =====================================================
   🔥 START SESSION
===================================================== */
export const startSession = asyncHandler(async (req, res) => {

  const { limit = 10, topic, subject, difficulty, duration = 10 } = req.body;

  if (!topic && !subject) {
    throw new ApiError(400, "Topic or Subject is required");
  }

  const filter = { isActive: true };

  if (topic) filter.topic = topic;
  else if (subject) filter.subject = subject;

  if (difficulty) filter.difficulty = difficulty;

  /* 🔥 FETCH */
  let questions = await Question.find(filter).lean();

  console.log("FILTER:", filter);
  console.log("FOUND:", questions.length);

  if (!questions.length) {
    throw new ApiError(404, "No questions found");
  }

  /* 🔥 RANDOMIZE */
  questions = questions.sort(() => 0.5 - Math.random());

  questions = questions.slice(0, limit);

  /* 🔥 CREATE SESSION */
  const session = await PracticeSession.create({
    user: req.user._id,
    questions: questions.map(q => q._id),
    totalQuestions: questions.length,
    duration
  });

  const safeQuestions = questions.map(q => ({
    _id: q._id,
    questionText: q.questionText,
    options: q.options?.map(o => ({ text: o.text })) || [],
    type: q.type,
    marks: q.marks
  }));

  return res.status(201).json(
    new ApiResponse(201, {
      sessionId: session._id,
      expiresAt: session.expiresAt,
      questions: safeQuestions
    }, "Session started")
  );
});


/* =====================================================
   🔥 RESUME SESSION
===================================================== */
export const resumeSession = asyncHandler(async (req, res) => {

  const session = await PracticeSession.findOne({
    user: req.user._id,
    status: "started"
  })
    .sort({ createdAt: -1 })
    .populate("questions");

  if (!session) {
    return res.json(new ApiResponse(200, null, "No active session"));
  }

  if (!session.expiresAt || session.expiresAt < new Date()) {
    session.status = "expired";
    await session.save();

    return res.json(new ApiResponse(200, null, "Session expired"));
  }

  const safeQuestions = session.questions.map(q => ({
    _id: q._id,
    questionText: q.questionText,
    options: q.options?.map(o => ({ text: o.text })) || [],
    type: q.type,
    marks: q.marks
  }));

  return res.json(
    new ApiResponse(200, {
      sessionId: session._id,
      expiresAt: session.expiresAt,
      questions: safeQuestions
    }, "Session resumed")
  );
});


/* =====================================================
   🔥 SUBMIT SESSION
===================================================== */
export const submitSession = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const { answers } = req.body;

  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid session ID");
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    throw new ApiError(400, "Answers required");
  }

  const session = await PracticeSession.findOne({
    _id: id,
    user: req.user._id
  });

  if (!session || session.status !== "started") {
    throw new ApiError(404, "Session not found or already submitted");
  }

  if (!session.expiresAt || session.expiresAt < new Date()) {
    session.status = "expired";
    await session.save();
    throw new ApiError(400, "Session expired");
  }

  const questions = await Question.find({
    _id: { $in: session.questions }
  });

  const questionMap = new Map();
  questions.forEach(q => questionMap.set(q._id.toString(), q));

  const answeredSet = new Set();
  const resultAnswers = [];

  for (const ans of answers) {

    if (!ans.question || !isValidId(ans.question)) continue;
    if (answeredSet.has(ans.question)) continue;

    answeredSet.add(ans.question);

    const question = questionMap.get(ans.question);
    if (!question) continue;

    let status = "skipped";
    let marksAwarded = 0;

    /* MCQ / TRUE-FALSE */
    if (["mcq", "true_false"].includes(question.type)) {

      if (
        ans.selectedOption !== undefined &&
        ans.selectedOption >= 0 &&
        ans.selectedOption < question.options.length
      ) {
        const correctIndex = question.options.findIndex(o => o.isCorrect);

        if (ans.selectedOption === correctIndex) {
          status = "correct";
          marksAwarded = question.marks;
        } else {
          status = "wrong";
          marksAwarded = -question.negativeMarks;
        }
      } else {
        status = "wrong";
      }
    }

    /* SAQ */
    else if (question.type === "saq") {

      if (ans.answerText) {

        if (
          ans.answerText.trim().toLowerCase() ===
          String(question.correctAnswer).toLowerCase()
        ) {
          status = "correct";
          marksAwarded = question.marks;
        } else {
          status = "wrong";
        }
      }
    }

    /* LONG */
    else {
      status = "skipped";
    }

    resultAnswers.push({
      question: question._id,
      selectedOption: ans.selectedOption,
      answerText: ans.answerText,
      status,
      marksAwarded
    });

    /* ANALYTICS */
    question.attemptCount += 1;
    if (status === "correct") question.correctCount += 1;

    await question.save();
  }

  session.answers = resultAnswers;
  session.status = "submitted";
  session.submittedAt = new Date();

  await session.save();

  return res.json(
    new ApiResponse(200, {
      score: session.score,
      correct: session.correct,
      attempted: session.attempted,
      total: session.totalQuestions,
      accuracy: session.accuracy
    }, "Session submitted")
  );
});


/* =====================================================
   🔥 GET SESSION RESULT
===================================================== */
export const getSession = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!isValidId(id)) {
    throw new ApiError(400, "Invalid ID");
  }

  const session = await PracticeSession.findOne({
    _id: id,
    user: req.user._id
  })
    .populate("answers.question", "questionText")
    .lean();

  if (!session) {
    throw new ApiError(404, "Session not found");
  }

  return res.json(
    new ApiResponse(200, session, "Session fetched")
  );
});