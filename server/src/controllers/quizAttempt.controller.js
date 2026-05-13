import mongoose from "mongoose";

import Quiz from "../models/quiz.model.js";
import Question from "../models/question.model.js";
import QuizAttempt from "../models/quizAttempt.model.js";

import asyncHandler from "../utils/asyncHandler.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id);


/* =====================================================
   🔥 START QUIZ ATTEMPT
===================================================== */

export const startQuizAttempt = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  if (!isValidId(quizId)) {
    throw new ApiError(
      400,
      "Invalid quiz ID"
    );
  }

  /* ---------------- FIND QUIZ ---------------- */

  const quiz = await Quiz.findOne({
    _id: quizId,
    isPublished: true,
    isActive: true
  })
    .populate({
      path: "questions",
      match: {
        isActive: true
      },
      select: `
        questionText
        questionImage
        options
        type
        difficulty
        marks
      `
    });

  if (!quiz) {
    throw new ApiError(
      404,
      "Quiz not found"
    );
  }

  /* ---------------- ATTEMPT LIMIT ---------------- */

  if (!quiz.allowRetake) {
    const exists =
      await QuizAttempt.findOne({
        student: req.user._id,
        quiz: quizId,
        status: {
          $in: [
            "submitted",
            "evaluated"
          ]
        }
      });

    if (exists) {
      throw new ApiError(
        400,
        "Retake not allowed"
      );
    }
  }

  if (quiz.maxAttempts > 0) {
    const attempts =
      await QuizAttempt.countDocuments({
        student: req.user._id,
        quiz: quizId
      });

    if ( attempts >= quiz.maxAttempts ) {
      throw new ApiError(
        400,
        "Maximum attempts reached"
      );
    }
  }

  /* ---------------- SHUFFLE QUESTIONS ---------------- */

  if (quiz.shuffleQuestions) {
    quiz.questions.sort(
      () => Math.random() - 0.5
    );
  }

  /* ---------------- SHUFFLE OPTIONS ---------------- */

  if (quiz.shuffleOptions) {
    quiz.questions.forEach((q) => {
      q.options.sort(
        () => Math.random() - 0.5
      );
    });
  }

  /* ---------------- CREATE ATTEMPT ---------------- */

  const attempt =
    await QuizAttempt.create({
      student: req.user._id,
      quiz: quiz._id,
      ipAddress: req.ip,
      userAgent:
        req.headers["user-agent"]
    });

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        attemptId: attempt._id,
        quiz
      },
      "Quiz started successfully"
    )
  );
});


/* =====================================================
   🔥 SUBMIT QUIZ ATTEMPT
===================================================== */

export const submitQuizAttempt = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body;
  if (!isValidId(quizId)) {
    throw new ApiError(
      400,
      "Invalid quiz ID"
    );
  }

  if (!answers || !Array.isArray(answers) ) {
    throw new ApiError(
      400,
      "Answers required"
    );
  }

  /* ---------------- FIND QUIZ ---------------- */

  const quiz = await Quiz.findOne({
    _id: quizId,
    isPublished: true,
    isActive: true
  }).populate("questions");
  if (!quiz) {
    throw new ApiError(
      404,
      "Quiz not found"
    );
  }

  /* ---------------- FIND ATTEMPT ---------------- */

  const attempt =
    await QuizAttempt.findOne({
      student: req.user._id,
      quiz: quizId,
      status: "in_progress"
    });

  if (!attempt) {
    throw new ApiError(
      404,
      "Quiz attempt not found"
    );
  }

  /* ---------------- EVALUATION ---------------- */

  const evaluatedAnswers = [];

  let totalScore = 0;
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  for (const q of quiz.questions) {
    const submitted =
      answers.find(
        a =>
          a.question.toString() ===
          q._id.toString()
      );
    let isCorrect = false;
    let obtainedMarks = 0;

    /* =====================================================
       MCQ
    ===================================================== */

    if ( q.type === "mcq" ) {
      if (!submitted) {
        unanswered++;
      } else {
        const correctIndex =
          q.options.findIndex(
            o => o.isCorrect
          );
        isCorrect =
          submitted.selectedOption ===
          correctIndex;

        if (isCorrect) {
          obtainedMarks = q.marks;
          correct++;
        } else {
          wrong++;
          if (
            quiz.negativeMarkingEnabled
          ) {
            obtainedMarks = -q.negativeMarks;
          }
        }
      }
    }

    /* =====================================================
       TRUE FALSE
    ===================================================== */

    else if ( q.type === "true_false" ) {
      if (!submitted) {
        unanswered++;
      } else {
        isCorrect =
          submitted.answer ===
          q.correctAnswer;
        if (isCorrect) {
          obtainedMarks = q.marks;
          correct++;
        } else {
          wrong++;
        }
      }
    }

    /* =====================================================
       SAQ
    ===================================================== */

    else if (
      q.type === "saq"
    ) {
      if (!submitted) {
        unanswered++;
      } else {
        const studentAns =
          String(
            submitted.answerText || ""
          )
            .trim()
            .toLowerCase();

        const correctAns =
          String(
            q.correctAnswer || ""
          )
            .trim()
            .toLowerCase();

        isCorrect =
          studentAns === correctAns;

        if (isCorrect) {
          obtainedMarks = q.marks;
          correct++;
        } else {
          wrong++;
        }
      }
    }

    /* =====================================================
       LONG ANSWER
    ===================================================== */

    else {
      unanswered++;
    }
    totalScore += obtainedMarks;
    evaluatedAnswers.push({
      question: q._id,
      selectedOption: submitted?.selectedOption,
      answerText: submitted?.answerText,
      isCorrect,
      obtainedMarks,
      timeSpentSeconds: submitted?.timeSpentSeconds || 0
    });
  }

  /* ---------------- FINAL RESULT ---------------- */

  const percentage =
    quiz.totalMarks > 0
      ? Number(
          (
            (totalScore /
              quiz.totalMarks) *
            100
          ).toFixed(2)
        )
      : 0;

  attempt.answers = evaluatedAnswers;

  attempt.score = totalScore;

  attempt.percentage = percentage;

  attempt.correctAnswers = correct;

  attempt.wrongAnswers = wrong;

  attempt.unanswered = unanswered;

  attempt.passed = totalScore >= quiz.passingMarks;

  attempt.status = "submitted";

  attempt.submittedAt = new Date();

  attempt.totalTimeSpentSeconds =
    evaluatedAnswers.reduce(
      (acc, ans) =>
        acc + ans.timeSpentSeconds,
      0
    );

  await attempt.save();

  /* ---------------- QUIZ ANALYTICS ---------------- */

  quiz.totalAttempts += 1;
  quiz.averageScore =
    (
      (
        (quiz.averageScore *
          (quiz.totalAttempts - 1)) +
        totalScore
      ) /
      quiz.totalAttempts
    );

  await quiz.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        attemptId: attempt._id,
        score: attempt.score,
        percentage: attempt.percentage,
        correctAnswers: attempt.correctAnswers,
        wrongAnswers: attempt.wrongAnswers,
        unanswered: attempt.unanswered,
        passed: attempt.passed
      },
      "Quiz submitted successfully"
    )
  );
});


/* =====================================================
   🔥 GET QUIZ RESULT
===================================================== */

export const getQuizResult = asyncHandler(async (req, res) => {

  const { attemptId } = req.params;

  if (!isValidId(attemptId)) {

    throw new ApiError(
      400,
      "Invalid attempt ID"
    );

  }

  const attempt =
    await QuizAttempt.findOne({

      _id: attemptId,

      student: req.user._id

    })

      .populate({

        path: "quiz",

        select: `
          title
          totalMarks
          passingMarks
        `

      })

      .populate({

        path: "answers.question",

        select: `
          questionText
          options
          explanation
          correctAnswer
          sampleAnswer
        `

      });

  if (!attempt) {

    throw new ApiError(
      404,
      "Result not found"
    );

  }

  return res.status(200).json(

    new ApiResponse(

      200,

      attempt,

      "Quiz result fetched successfully"

    )

  );

});


/* =====================================================
   🔥 GET MY ATTEMPTS
===================================================== */

export const getMyAttempts = asyncHandler(async (req, res) => {

  let {

    page = 1,
    limit = 10

  } = req.query;

  page = Math.max(
    parseInt(page) || 1,
    1
  );

  limit = Math.min(
    Math.max(parseInt(limit) || 10, 1),
    50
  );

  const skip = (page - 1) * limit;

  const filter = {

    student: req.user._id

  };

  const [attempts, total] =
    await Promise.all([

      QuizAttempt.find(filter)

        .populate({

          path: "quiz",

          select: `
            title
            quizType
            difficulty
          `

        })

        .sort({
          createdAt: -1
        })

        .skip(skip)

        .limit(limit)

        .lean(),

      QuizAttempt.countDocuments(filter)

    ]);

  return res.status(200).json(

    new ApiResponse(

      200,

      {

        attempts,

        pagination: {

          total,
          page,
          limit,

          totalPages:
            Math.ceil(total / limit)

        }

      },

      "Quiz attempts fetched successfully"

    )

  );

});