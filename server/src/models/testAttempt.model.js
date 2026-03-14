import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },

    selectedOption: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionOption"
    },

    timeTaken: {
      type: Number // seconds
    }
  },
  { _id: false }
);

const testAttemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true
    },

    shuffledQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
      }
    ],

    answers: [answerSchema],

    score: {
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

    totalQuestions: {
      type: Number
    },

    startedAt: {
      type: Date,
      default: Date.now
    },

    completedAt: {
      type: Date
    },

    status: {
      type: String,
      enum: ["inProgress", "submitted"],
      default: "inProgress"
    }
  },
  { timestamps: true }
);

testAttemptSchema.index({ user: 1, test: 1 });

const TestAttempt = mongoose.model("TestAttempt", testAttemptSchema);

export default TestAttempt;