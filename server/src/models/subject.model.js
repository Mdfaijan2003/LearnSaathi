import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true
    },

    icon: {
      type: String
    },

    description: {
      type: String
    }
  },
  { timestamps: true }
);

// prevent duplicate subjects inside same program
subjectSchema.index({ program: 1, name: 1 }, { unique: true });

const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;