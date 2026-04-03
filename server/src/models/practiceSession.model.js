import mongoose from "mongoose";

/* ================= ANSWER ================= */
const answerSchema = new mongoose.Schema(
{
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true
  },

  selectedOption: Number,
  answerText: String,

  status: {
    type: String,
    enum: ["correct", "wrong", "skipped"],
    required: true,
    index: true
  },

  marksAwarded: {
    type: Number,
    default: 0
  }
},
{ _id: false }
);

/* ================= SESSION ================= */
const practiceSessionSchema = new mongoose.Schema(
{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question"
  }],

  answers: [answerSchema],

  totalQuestions: {
    type: Number,
    required: true
  },

  attempted: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  score: { type: Number, default: 0 },

  duration: {
    type: Number,
    default: 10,
    min: 1
  },

  expiresAt: {
    type: Date,
    index: true
  },

  status: {
    type: String,
    enum: ["started", "submitted", "expired"],
    default: "started",
    index: true
  },

  startedAt: {
    type: Date,
    default: Date.now
  },

  submittedAt: Date

},
{ timestamps: true });

/* ================= INDEXES ================= */
practiceSessionSchema.index({ user: 1, createdAt: -1 });
practiceSessionSchema.index({ status: 1, score: -1 });

/* ================= HOOKS ================= */
practiceSessionSchema.pre("save", function (next) {

  if (this.isNew) {
    const start = this.startedAt || new Date();
    const duration = this.duration || 10;

    this.expiresAt = new Date(
      start.getTime() + duration * 60 * 1000
    );
  }

  if (this.answers) {

    this.attempted = this.answers.filter(
      a => a.status !== "skipped"
    ).length;

    this.correct = this.answers.filter(
      a => a.status === "correct"
    ).length;

    this.score = this.answers.reduce(
      (sum, a) => sum + (a.marksAwarded || 0),
      0
    );
  }

//   next();
});

/* ================= VALIDATION ================= */
practiceSessionSchema.pre("validate", function (next) {

  if (this.answers && this.questions) {

    const questionSet = new Set(
      this.questions.map(q => q.toString())
    );

    for (const ans of this.answers) {
      if (!questionSet.has(ans.question.toString())) {
        return next(new Error("Invalid question in answers"));
      }
    }
  }

  // next();
});

/* ================= VIRTUAL ================= */
practiceSessionSchema.virtual("accuracy").get(function () {
  if (!this.totalQuestions) return 0;
  return Math.round((this.correct / this.totalQuestions) * 100);
});

/* ================= MODEL ================= */
const PracticeSession = mongoose.model(
  "PracticeSession",
  practiceSessionSchema
);

export default PracticeSession;