import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true
    },

    completed: {
      type: Boolean,
      default: false
    },

    completedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, topic: 1 }, { unique: true });

const Progress = mongoose.model("Progress", progressSchema);

export default Progress;