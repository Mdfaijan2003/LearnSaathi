import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },

  description: {
    type: String
  },

  // 🔥 REQUIRED ROOT LEVEL
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
    index: true
  },

  // 🔥 FLEXIBLE HIERARCHY (OPTIONAL)
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Program",
    index: true
  },

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    index: true
  },

  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
    index: true
  },

  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    index: true
  },

  // 🎥 VIDEO TYPE
  videoType: {
    type: String,
    enum: ["internal", "youtube"],
    required: true
  },

  videoUrl: {
    type: String,
    required: true
  },

  // 📺 YOUTUBE SUPPORT
  youtubeVideoId: {
    type: String
  },

  thumbnail: {
    type: String
  },

  duration: {
    type: Number,
    default: 0
  },

  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },

  isFree: {
    type: Boolean,
    default: true
  },

  // 📊 ANALYTICS
  views: {
    type: Number,
    default: 0
  },

  ratingAverage: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  ratingCount: {
    type: Number,
    default: 0
  }

},
{ timestamps: true }
);


// 🔍 FULL TEXT SEARCH
videoSchema.index({ title: "text", description: "text" });


// ⚡ MAIN FILTER INDEX (VERY IMPORTANT)
videoSchema.index({
  title: 1,
  category: 1,
  program: 1,
  subject: 1,
  chapter: 1,
  topic: 1
});


// 📊 SORTING INDEXES
videoSchema.index({ views: -1 });
videoSchema.index({ ratingAverage: -1 });
videoSchema.index({ createdAt: -1 });


// 👨‍🏫 TEACHER DASHBOARD OPTIMIZATION
videoSchema.index({ uploadedBy: 1, createdAt: -1 });


// 🎯 YOUTUBE OPTIMIZED INDEX (ADVANCED)
videoSchema.index(
  { youtubeVideoId: 1 },
  { partialFilterExpression: { videoType: "youtube" } }
);


const Video = mongoose.model("Video", videoSchema);

export default Video;