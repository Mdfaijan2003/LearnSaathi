import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true
    },

    order: {
      type: Number,
      default: 0
    },

    estimatedMinTime: {
      type: Number   // minutes
    },

    estimatedMaxTime: {
      type: Number   // minutes
    }
  },
  { timestamps: true }
);

// prevent duplicate chapters inside same subject
chapterSchema.index({ subject: 1, title: 1 }, { unique: true });

const Chapter = mongoose.model("Chapter", chapterSchema);

export default Chapter;