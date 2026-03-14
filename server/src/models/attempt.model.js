import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true
    },

    selectedOption: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionOption",
      required: true
    },

    isCorrect: {
      type: Boolean,
      required: true
    },

    timeTaken: {
      type: Number, // seconds
      default: 0
    }
  },
  { timestamps: true }
);

//
// indexes for analytics
//

attemptSchema.index({ user: 1 });
attemptSchema.index({ question: 1 });
attemptSchema.index({ createdAt: -1 });

const Attempt = mongoose.model("Attempt", attemptSchema);

export default Attempt;