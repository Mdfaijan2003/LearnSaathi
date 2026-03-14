import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },

    text: {
      type: String,
      required: true
    },

    isCorrect: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

optionSchema.index({ question: 1 });

const QuestionOption = mongoose.model("QuestionOption", optionSchema);

export default QuestionOption;