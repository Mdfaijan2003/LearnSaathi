import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true
    },

    questionImage: {
      type: String
    },

    type: {
      type: String,
      enum: ["mcq", "saq", "long"],
      required: true
    },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy"
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

    explanation: {
      type: String
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    createdByType: {
      type: String,
      enum: ["teacher", "admin", "ai"],
      required: true
    }
  },
  { timestamps: true }
);

questionSchema.index({ topic: 1 });
questionSchema.index({ subject: 1 });
questionSchema.index({ difficulty: 1 });

const Question = mongoose.model("Question", questionSchema);

export default Question;