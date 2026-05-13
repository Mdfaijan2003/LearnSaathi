import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
{
  /* =====================================================
     🔥 BASIC
  ===================================================== */

  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200,
    index: true
  },

  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },

  instructions: {
    type: String,
    trim: true,
    maxlength: 5000
  },

  slug: {
    type: String,
    unique: true,
    index: true
  },

  /* =====================================================
     🔥 QUIZ TYPE
  ===================================================== */

  quizType: {
    type: String,
    enum: [
      "practice",
      "mock",
      "exam",
      "daily"
    ],
    default: "practice",
    index: true
  },

  difficulty: {
    type: String,
    enum: [
      "easy",
      "medium",
      "hard",
      "mixed"
    ],
    default: "mixed",
    index: true
  },

  /* =====================================================
     🔥 QUESTIONS
  ===================================================== */

  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    }
  ],

  totalQuestions: {
    type: Number,
    default: 0
  },

  totalMarks: {
    type: Number,
    default: 0
  },

  negativeMarkingEnabled: {
    type: Boolean,
    default: false
  },

  passingMarks: {
    type: Number,
    default: 0,
    min: 0
  },

  /* =====================================================
     🔥 TIMING
  ===================================================== */

  durationMinutes: {
    type: Number,
    required: true,
    min: 1
  },

  startTime: {
    type: Date,
    default: null
  },

  endTime: {
    type: Date,
    default: null
  },

  /* =====================================================
     🔥 SETTINGS
  ===================================================== */

  shuffleQuestions: {
    type: Boolean,
    default: false
  },

  shuffleOptions: {
    type: Boolean,
    default: false
  },

  showResultImmediately: {
    type: Boolean,
    default: true
  },

  allowRetake: {
    type: Boolean,
    default: true
  },

  maxAttempts: {
    type: Number,
    default: 0 // 0 = unlimited
  },

  /* =====================================================
     🔥 HIERARCHY
  ===================================================== */

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
    index: true
  },

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

  /* =====================================================
     🔥 ACCESS
  ===================================================== */

  accessLevel: {
    type: String,
    enum: ["free", "premium"],
    default: "free",
    index: true
  },

  isPublished: {
    type: Boolean,
    default: false,
    index: true
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  /* =====================================================
     🔥 OWNER
  ===================================================== */

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  /* =====================================================
     🔥 ANALYTICS
  ===================================================== */

  totalAttempts: {
    type: Number,
    default: 0
  },

  averageScore: {
    type: Number,
    default: 0
  }

},
{
  timestamps: true
}
);


/* =====================================================
   🔥 INDEXES
===================================================== */

quizSchema.index({
  title: "text",
  description: "text"
});

quizSchema.index({
  subject: 1,
  difficulty: 1,
  isPublished: 1,
  isActive: 1
});

quizSchema.index({
  createdBy: 1,
  createdAt: -1
});


/* =====================================================
   🔥 SLUG
===================================================== */

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};


quizSchema.pre("save", async function () {
  if (!this.isModified("title")) return;
  const baseSlug = generateSlug(this.title);
  let slug = baseSlug;
  let count = 1;
  while (
    await mongoose.models.Quiz.findOne({
      slug,
      _id: { $ne: this._id }
    })
  ) {
    slug = `${baseSlug}-${count++}`;
  }
  this.slug = slug;
});


/* =====================================================
   🔥 AUTO CALCULATE TOTALS
===================================================== */

quizSchema.pre("save", async function () {
  if (!this.isModified("questions")) return;
  const Question =
    mongoose.models.Question;
  const questions =
    await Question.find({
      _id: {
        $in: this.questions
      }
    }).select("marks");

  this.totalQuestions = questions.length;

  this.totalMarks = questions.reduce( (acc, q) => acc + q.marks, 0);
});

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;