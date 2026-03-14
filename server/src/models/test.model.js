import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String
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

    duration: {
      type: Number, // minutes
      required: true
    },

    marksPerQuestion: {
      type: Number,
      default: 1
    },

    negativeMarking: {
      type: Boolean,
      default: false
    },

    negativeMarks: {
      type: Number,
      default: 0
    },

    totalQuestions: {
      type: Number,
      required: true
    },

    testType: {
      type: String,
      enum: ["practice", "exam"],
      default: "practice"
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    isPublished: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

testSchema.index({ program: 1, subject: 1 });

const Test = mongoose.model("Test", testSchema);

export default Test;