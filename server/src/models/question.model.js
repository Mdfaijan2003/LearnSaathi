import mongoose from "mongoose";

/* =====================================================
   🔥 OPTION SCHEMA
===================================================== */
const optionSchema = new mongoose.Schema(
{
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },

  isCorrect: {
    type: Boolean,
    default: false
  }
},
{ _id: false }
);

/* =====================================================
   🔥 QUESTION SCHEMA
===================================================== */
const questionSchema = new mongoose.Schema(
{
  /* 🔥 CORE */
  type: {
    type: String,
    enum: ["mcq", "true_false", "saq", "long"],
    required: true,
    index: true
  },

  questionText: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },

  questionImage: {
    type: String,
    trim: true
  },

  /* 🔥 OPTIONS */
  options: {
    type: [optionSchema],
    default: []
  },

  /* 🔥 ANSWERS */
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed
  },

  sampleAnswer: {
    type: String,
    trim: true
  },

  /* 🔥 META */
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
    index: true
  },

  explanation: String,

  marks: {
    type: Number,
    default: 1,
    min: 0
  },

  negativeMarks: {
    type: Number,
    default: 0,
    min: 0
  },

  tags: {
    type: [String],
    default: [],
    set: (tags) =>
      Array.isArray(tags)
        ? [...new Set(tags.map(t => String(t).toLowerCase()))]
        : []
  },

  order: {
    type: Number,
    default: 0,
    index: true
  },

  /* 🔥 ANALYTICS */
  attemptCount: {
    type: Number,
    default: 0
  },

  correctCount: {
    type: Number,
    default: 0
  },

  /* 🔥 HIERARCHY */
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Program",
    required: true,
    index: true
  },

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true,
    index: true
  },

  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
    index: true
  },

  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    index: true
  },

  /* 🔥 CONTROL */
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  createdByType: {
    type: String,
    enum: ["teacher", "admin", "ai"],
    required: true
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  }

},
{ timestamps: true }
);

/* =====================================================
   🔥 INDEXES
===================================================== */
questionSchema.index({ topic: 1, difficulty: 1, isActive: 1, order: 1 });
questionSchema.index({ subject: 1 });
questionSchema.index({ questionText: "text" });
questionSchema.index({ _id: 1, isActive: 1 });
// Optional (enable later if needed)
// questionSchema.index({ questionText: 1, topic: 1 }, { unique: true });

/* =====================================================
   🔥 VALIDATION + NORMALIZATION
===================================================== */
questionSchema.pre("validate", function (next) {

  /* 🔥 TYPE CLEANUP */

  if (this.type === "mcq") {
    this.correctAnswer = undefined;
    this.sampleAnswer = undefined;
  }

  if (this.type === "true_false") {
    this.sampleAnswer = undefined;
  }

  if (this.type === "saq") {
    this.options = [];
    this.sampleAnswer = undefined;
  }

  if (this.type === "long") {
    this.options = [];
    this.correctAnswer = undefined;
  }

  /* 🔥 TRUE/FALSE */

  if (this.type === "true_false") {

    if (this.correctAnswer !== true && this.correctAnswer !== false) {
      return next(new Error("Correct answer must be true or false"));
    }

    this.options = [
      { text: "True", isCorrect: this.correctAnswer === true },
      { text: "False", isCorrect: this.correctAnswer === false }
    ];
  }

  /* 🔥 MCQ */

  if (this.type === "mcq") {

    if (!this.options || this.options.length < 2) {
      return next(new Error("At least 2 options required"));
    }

    let correct = 0;

    for (const opt of this.options) {
      if (!opt.text || opt.text.trim() === "") {
        return next(new Error("Option text required"));
      }
      if (opt.isCorrect) correct++;
    }

    if (correct !== 1) {
      return next(new Error("Exactly one correct option required"));
    }
  }

  /* 🔥 SAQ */

  if (this.type === "saq") {

    if (
      this.correctAnswer === undefined ||
      String(this.correctAnswer).trim() === ""
    ) {
      return next(new Error("Correct answer required for SAQ"));
    }

    this.correctAnswer = String(this.correctAnswer).trim();
  }

  /* 🔥 LONG */

  if (this.type === "long") {

    if (!this.sampleAnswer || this.sampleAnswer.trim() === "") {
      return next(new Error("Sample answer required for long question"));
    }
  }

  /* 🔥 MARKS VALIDATION */

  if (this.negativeMarks > this.marks) {
    return next(new Error("Negative marks cannot exceed marks"));
  }

  if (this.marks === 0 && this.negativeMarks > 0) {
    return next(new Error("Invalid negative marks configuration"));
  }

  // next();
});

const Question = mongoose.model("Question", questionSchema);

export default Question;