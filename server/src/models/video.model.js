import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
{
  /* ================= BASIC ================= */

  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },

  description: {
    type: String,
    trim: true,
    default: ""
  },

  /* ================= HIERARCHY ================= */

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
    index: true
  },

  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Program",
    default: null,
    index: true
  },

  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    default: null,
    index: true
  },

  chapter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
    default: null,
    index: true
  },

  topic: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    default: null,
    index: true
  },

  /* ================= VIDEO ================= */

  videoType: {
    type: String,
    enum: ["internal", "youtube"],
    required: true
  },

  videoUrl: {
    type: String,
    required: true,
    validate: {
      validator: v => /^https?:\/\/.+/i.test(v),
      message: "Invalid video URL"
    }
  },

  youtubeVideoId: {
    type: String,
    required: function () {
      return this.videoType === "youtube";
    },
    index: true
  },

  /* ================= CLOUDINARY ================= */

  videoPublicId: {
    type: String,
    required: function () {
      return this.videoType === "internal";
    },
    index: true
  },

  thumbnailPublicId: {
    type: String,
    required: function () {
      return this.videoType === "internal";
    },
    index: true
  },

  thumbnail: {
    type: String,
    required: true, // still required, but controller MUST guarantee it
    default: ""
  },

  duration: {
    type: Number,
    default: 0,
    min: 0
  },

  /* ================= OWNER ================= */

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

  /* ================= ANALYTICS ================= */

  views: {
    type: Number,
    default: 0,
    min: 0
  },

  ratingAverage: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    set: v => Math.round(v * 10) / 10
  },

  ratingCount: {
    type: Number,
    default: 0
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  /* ================= SLUG ================= */

  slug: {
    type: String,
    unique: true,
    index: true
  }

},
{ timestamps: true }
);


/* ================= INDEXES ================= */

videoSchema.index({ title: "text", description: "text" });

videoSchema.index({ isActive: 1, createdAt: -1 });

videoSchema.index({
  category: 1,
  program: 1,
  subject: 1,
  chapter: 1,
  topic: 1
});

videoSchema.index({ views: -1 });
videoSchema.index({ ratingAverage: -1 });
videoSchema.index({ createdAt: -1 });

videoSchema.index({ uploadedBy: 1, createdAt: -1 });

videoSchema.index(
  { youtubeVideoId: 1 },
  { partialFilterExpression: { videoType: "youtube" } }
);


/* ================= SLUG GENERATION (FIXED) ================= */

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

videoSchema.pre("save", async function () {

  if (!this.isModified("title")) return;

  const baseSlug = generateSlug(this.title);
  let slug = baseSlug;
  let count = 1;

  while (
    await mongoose.models.Video.findOne({
      slug,
      _id: { $ne: this._id }
    })
  ) {
    slug = `${baseSlug}-${count++}`;
  }

  this.slug = slug;
});


const Video = mongoose.model("Video", videoSchema);
export default Video;