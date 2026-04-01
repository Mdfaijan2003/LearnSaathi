import mongoose from "mongoose";

const teacherNoteSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150,
    index: true
  },

  description: {
    type: String,
    maxlength: 500
  },

  fileUrl: {
    type: String,
    required: true
  },

  fileType: {
    type: String,
    enum: ["pdf"],
    default: "pdf"
  },

  fileSize: {
    type: Number
  },

  // 🔥 HIERARCHY (same as video → consistency)
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
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

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  isFree: {
    type: Boolean,
    default: true
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  views: {
    type: Number,
    default: 0
  },

  downloads: {
    type: Number,
    default: 0
  }

},
{ timestamps: true }
);

/* 🔥 SEARCH */
teacherNoteSchema.index({ title: "text", description: "text" });

/* 🔥 FILTER INDEX */
teacherNoteSchema.index({
  category: 1,
  program: 1,
  subject: 1,
  chapter: 1,
  topic: 1,
  isActive: 1
});

/* 🔥 TEACHER DASHBOARD */
teacherNoteSchema.index({ uploadedBy: 1, createdAt: -1 });

const TeacherNote = mongoose.model("TeacherNote", teacherNoteSchema);

export default TeacherNote;