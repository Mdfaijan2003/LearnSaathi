import mongoose from "mongoose";

const userNoteSchema = new mongoose.Schema(
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

    title: {
      type: String,
      required: true,
      trim: true
    },

    content: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

//
// indexes
//

userNoteSchema.index({ user: 1 });
userNoteSchema.index({ topic: 1 });

const UserNote = mongoose.model("UserNote", userNoteSchema);

export default UserNote;