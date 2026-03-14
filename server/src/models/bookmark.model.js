import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    contentType: {
      type: String,
      enum: ["video", "note", "question"],
      required: true
    },

    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  },
  { timestamps: true }
);

bookmarkSchema.index(
  { user: 1, contentType: 1, contentId: 1 },
  { unique: true }
);

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

export default Bookmark;