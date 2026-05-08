import mongoose from "mongoose";

const studentNoteSchema = new mongoose.Schema(

  {

    /* =========================================
       OWNER
    ========================================= */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    /* =========================================
       BASIC
    ========================================= */

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      index: true
    },

    content: {
      type: String,
      default: "",
      maxlength: 50000
    },

    /* =========================================
       HIERARCHY
    ========================================= */

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      index: true
    },

    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      index: true
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
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

    /* =========================================
       VIDEO TIMESTAMP NOTE
    ========================================= */

    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      index: true
    },

    timestamp: {
      type: Number,
      default: 0,
      min: 0
    },

    /* =========================================
       ORGANIZATION
    ========================================= */

    tags: {

      type: [String],

      default: [],

      validate: {

        validator: function (v) {
          return v.length <= 20;
        },

        message: "Too many tags"

      }

    },

    color: {
      type: String,
      default: "#ffffff"
    },

    isPinned: {
      type: Boolean,
      default: false,
      index: true
    },

    isArchived: {
      type: Boolean,
      default: false,
      index: true
    },

    /* =========================================
       PRIVACY + SOFT DELETE
    ========================================= */

    visibility: {
      type: String,
      enum: ["private"],
      default: "private",
      index: true
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },

    deletedAt: {
      type: Date,
      default: null
    },

    /* =========================================
       EDITOR
    ========================================= */

    editorType: {
      type: String,
      enum: ["plain", "markdown"],
      default: "markdown"
    },

    isAutoSaved: {
      type: Boolean,
      default: false
    },

    /* =========================================
       ANALYTICS
    ========================================= */

    wordCount: {
      type: Number,
      default: 0
    },

    lastEditedAt: {
      type: Date,
      default: Date.now,
      index: true
    }

  },

  {
    timestamps: true
  }

);

/* =========================================
   TEXT SEARCH
========================================= */

studentNoteSchema.index({
  title: "text",
  content: "text",
  tags: "text"
});

/* =========================================
   USER DASHBOARD
========================================= */

studentNoteSchema.index({
  user: 1,
  isDeleted: 1,
  updatedAt: -1
});

/* =========================================
   PINNED NOTES
========================================= */

studentNoteSchema.index({
  user: 1,
  isPinned: 1,
  updatedAt: -1
});

/* =========================================
   ARCHIVED NOTES
========================================= */

studentNoteSchema.index({
  user: 1,
  isArchived: 1,
  updatedAt: -1
});

/* =========================================
   TOPIC NOTES
========================================= */

studentNoteSchema.index({
  user: 1,
  topic: 1
});

/* =========================================
   VIDEO TIMESTAMP NOTES
========================================= */

studentNoteSchema.index({
  user: 1,
  video: 1,
  timestamp: 1
});

/* =========================================
   TITLE OPTIMIZATION
========================================= */

studentNoteSchema.index({
  user: 1,
  title: 1
});

/* =========================================
   AUTO WORD COUNT
========================================= */

studentNoteSchema.pre("save", function () {

  if (this.isModified("content")) {

    const cleanText = this.content
      ?.replace(/<[^>]*>/g, " ")
      ?.trim();

    this.wordCount = cleanText
      ? cleanText.split(/\s+/).length
      : 0;

    this.lastEditedAt = new Date();

  }

  // next();

});

const StudentNote = mongoose.model(
  "StudentNote",
  studentNoteSchema
);

export default StudentNote;