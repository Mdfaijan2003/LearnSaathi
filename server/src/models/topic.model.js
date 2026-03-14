import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true
    },

    order: {
      type: Number,
      default: 0
    },

    description: {
      type: String
    }
  },
  { timestamps: true }
);

// prevent duplicate topics in same chapter
topicSchema.index({ chapter: 1, title: 1 }, { unique: true });

const Topic = mongoose.model("Topic", topicSchema);

export default Topic;