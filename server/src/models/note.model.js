import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String
    },

    content: {
      type: String   // rich text / markdown / HTML
    },

    fileUrl: {
      type: String   // optional PDF
    },

    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },

    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter"
    },

    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic"
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    isFree: {
      type: Boolean,
      default: true
    },

    downloads: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

//
// indexes for faster search
//
noteSchema.index({ program: 1, subject: 1 });
noteSchema.index({ chapter: 1 });
noteSchema.index({ topic: 1 });
noteSchema.index({ title: "text", description: "text", content: "text" });

const Note = mongoose.model("Note", noteSchema);

export default Note;