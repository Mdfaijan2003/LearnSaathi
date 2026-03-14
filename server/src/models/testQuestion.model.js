import mongoose from "mongoose";

const testQuestionSchema = new mongoose.Schema(
  {
    test: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true
    },

    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },

    order: {
      type: Number
    }
  },
  { timestamps: true }
);

testQuestionSchema.index({ test: 1 });
testQuestionSchema.index({ question: 1 });

const TestQuestion = mongoose.model("TestQuestion", testQuestionSchema);

export default TestQuestion;