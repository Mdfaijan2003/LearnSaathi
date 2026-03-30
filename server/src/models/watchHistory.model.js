import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true,
    index: true
  },

  watchedSeconds: {
    type: Number,
    default: 0
  },

  completed: {
    type: Boolean,
    default: false
  },

  lastWatchedAt: {
    type: Date,
    default: Date.now,
    index: true
  }

}, { timestamps: true });

/* 🔥 ONE RECORD PER USER + VIDEO */
watchHistorySchema.index(
  { user: 1, video: 1 },
  { unique: true }
);

const WatchHistory = mongoose.model("WatchHistory", watchHistorySchema);

export default WatchHistory;