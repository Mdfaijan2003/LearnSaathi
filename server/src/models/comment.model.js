import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    text: {
      type: String,
      required: true,
      trim: true
    },

    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    },

    likesCount: {
      type: Number,
      default: 0
    },

    isPinned: {
      type: Boolean,
      default: false
    },

    isTeacher: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

commentSchema.index({ video: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;