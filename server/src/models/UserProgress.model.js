import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema(
{
  /* 👤 USER */
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  /* 🎥 VIDEO (CORE UNIT) */
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Video",
    required: true,
    index: true
  },

  /* 📚 HIERARCHY (SET FROM BACKEND ONLY) */
  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    index: true
  },

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    index: true
  },

  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Program",
    index: true
  },

  /* 🎯 PROGRESS CORE */
  watchedSeconds: {
    type: Number,
    default: 0,
    min: 0
  },

  duration: {
    type: Number,
    default: 0,
    min: 0
  },

  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
    select: false // 🔥 protect from client misuse
  },

  completed: {
    type: Boolean,
    default: false,
    index: true
  },

  /* 🕒 TRACKING */
  lastWatchedAt: {
    type: Date,
    default: Date.now
  }

},
{ timestamps: true }
);



/* =====================================================
   🔥 UNIQUE CONSTRAINT (CRITICAL)
===================================================== */
userProgressSchema.index(
  { user: 1, video: 1 },
  { unique: true }
);



/* =====================================================
   🔥 ESSENTIAL INDEXES (OPTIMIZED)
===================================================== */

// topic-level progress queries
userProgressSchema.index({ user: 1, topic: 1, completed: 1 });

// fast completed lookup
userProgressSchema.index({ user: 1, completed: 1 });



/* =====================================================
   🔥 PRE-SAVE (FOR .save())
===================================================== */
userProgressSchema.pre("save", function (next) {

  this.watchedSeconds = Math.max(this.watchedSeconds, 0);

  if (this.duration <= 0) {
    this.progress = 0;
    this.completed = false;
  } else {

    this.watchedSeconds = Math.min(this.watchedSeconds, this.duration);

    this.progress = Math.min(
      Math.round((this.watchedSeconds / this.duration) * 100),
      100
    );

    this.completed = this.progress >= 90;
  }

  this.lastWatchedAt = new Date();

  // next();
});


/* =====================================================
   🔥 PRE-UPDATE (CRITICAL FOR findOneAndUpdate)
===================================================== */
userProgressSchema.pre("findOneAndUpdate", function (next) {

  const update = this.getUpdate();
  if (!update) return next();

  let watched = update.watchedSeconds;
  let duration = update.duration;

  if (watched !== undefined) {

    watched = Math.max(watched, 0);

    if (duration > 0) {
      watched = Math.min(watched, duration);

      const progress = Math.min(
        Math.round((watched / duration) * 100),
        100
      );

      update.progress = progress;
      update.completed = progress >= 90;
    } else {
      update.progress = 0;
      update.completed = false;
    }

    update.watchedSeconds = watched;
    update.lastWatchedAt = new Date();
  }

  // next();
});


const UserProgress = mongoose.model("UserProgress", userProgressSchema);

export default UserProgress;