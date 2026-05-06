import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema(

  {
    /* ================= USER ================= */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    /* ================= VIDEO ================= */

    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
      index: true
    },

    /* ================= WATCH PROGRESS ================= */

    watchedSeconds: {
      type: Number,
      default: 0,
      min: 0
    },

    progressPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    completed: {
      type: Boolean,
      default: false,
      index: true
    },

    /* ================= WATCH TIMESTAMPS ================= */

    firstWatchedAt: {
      type: Date,
      default: Date.now
    },

    lastWatchedAt: {
      type: Date,
      default: Date.now,
      index: true
    }

  },

  { timestamps: true }

);


/* =========================================================
   🔥 ONE RECORD PER USER + VIDEO
========================================================= */

watchHistorySchema.index(
  { user: 1, video: 1 },
  { unique: true }
);


/* =========================================================
   🔥 CONTINUE WATCHING
========================================================= */

watchHistorySchema.index({
  user: 1,
  completed: 1,
  lastWatchedAt: -1
});


/* =========================================================
   🔥 USER WATCH HISTORY
========================================================= */

watchHistorySchema.index({
  user: 1,
  lastWatchedAt: -1
});


/* =========================================================
   🔥 ANALYTICS / RECOMMENDATIONS
========================================================= */

watchHistorySchema.index({
  video: 1,
  completed: 1
});


/* =========================================================
   🔥 AUTO VALIDATION
========================================================= */

watchHistorySchema.pre("save", function () {

  // prevent negative values
  if (this.watchedSeconds < 0) {
    this.watchedSeconds = 0;
  }

  // prevent invalid percentage
  if (this.progressPercent < 0) {
    this.progressPercent = 0;
  }

  if (this.progressPercent > 100) {
    this.progressPercent = 100;
  }

  // auto complete
  this.completed = this.progressPercent >= 90;

  // update timestamp
  this.lastWatchedAt = new Date();

});


const WatchHistory = mongoose.model(
  "WatchHistory",
  watchHistorySchema
);

export default WatchHistory;