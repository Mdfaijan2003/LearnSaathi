import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
{
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true
  },

  selectedOption: {
    type: Number,
    default: null
  },

  answerText: {
    type: String,
    trim: true
  },

  isCorrect: {
    type: Boolean,
    default: false
  },

  obtainedMarks: {
    type: Number,
    default: 0
  },

  timeSpentSeconds: {
    type: Number,
    default: 0,
    min: 0
  }

},
{ _id: false }
);


const quizAttemptSchema = new mongoose.Schema(
{
  /* =====================================================
     🔥 USER + QUIZ
  ===================================================== */

  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
    index: true
  },

  /* =====================================================
     🔥 ANSWERS
  ===================================================== */

  answers: {
    type: [answerSchema],
    default: []
  },

  /* =====================================================
     🔥 RESULT
  ===================================================== */

  score: {
    type: Number,
    default: 0
  },

  percentage: {
    type: Number,
    default: 0
  },

  correctAnswers: {
    type: Number,
    default: 0
  },

  wrongAnswers: {
    type: Number,
    default: 0
  },

  unanswered: {
    type: Number,
    default: 0
  },

  passed: {
    type: Boolean,
    default: false
  },

  rank: {
    type: Number,
    default: null
  },

  /* =====================================================
     🔥 TIMING
  ===================================================== */

  startedAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  submittedAt: {
    type: Date,
    default: null
  },

  totalTimeSpentSeconds: {
    type: Number,
    default: 0
  },

  /* =====================================================
     🔥 STATUS
  ===================================================== */

  status: {
    type: String,
    enum: [
      "in_progress",
      "submitted",
      "evaluated",
      "expired"
    ],
    default: "in_progress",
    index: true
  },

  /* =====================================================
     🔥 SECURITY
  ===================================================== */

  ipAddress: {
    type: String
  },

  userAgent: {
    type: String
  }

},
{
  timestamps: true
}
);


/* =====================================================
   🔥 INDEXES
===================================================== */

quizAttemptSchema.index({
  student: 1,
  quiz: 1,
  createdAt: -1
});

quizAttemptSchema.index({
  quiz: 1,
  score: -1
});

quizAttemptSchema.index({
  student: 1,
  status: 1
});


/* =====================================================
   🔥 AUTO CALCULATE
===================================================== */

quizAttemptSchema.pre("save", async function () {
  if (!this.isModified("answers")) return;
  let score = 0;
  let correct = 0;
  let wrong = 0;
  let unanswered = 0;
  for (const ans of this.answers) {
    score += ans.obtainedMarks;
    if (ans.isCorrect) {
      correct++;
    }
    else if (
      ans.selectedOption !== null ||
      ans.answerText
    ) {
      wrong++;
    }
    else {
      unanswered++;
    }
  }
  this.score = score;
  this.correctAnswers = correct;
  this.wrongAnswers = wrong;
  this.unanswered = unanswered;
});


const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

export default QuizAttempt;