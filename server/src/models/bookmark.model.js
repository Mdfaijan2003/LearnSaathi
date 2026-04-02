import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema({
  
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  type: {
    type: String,
    enum: ["note", "video", "topic"],
    required: true,
    index: true
  },

  item: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  }

}, { timestamps: true });

/* 🔥 UNIQUE (user + type + item) */
bookmarkSchema.index(
  { user: 1, type: 1, item: 1 },
  { unique: true }
);

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);

export default Bookmark;