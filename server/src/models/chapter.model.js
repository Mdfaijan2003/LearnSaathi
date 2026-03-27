import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 150
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true
    },

    order: {
      type: Number,
      required: true,
      min: 0,
      index: true
    },

    estimatedMinTime: {
      type: Number,
      min: 0
    },

    estimatedMaxTime: {
      type: Number,
      min: 0
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    slug: {
      type: String,
      index: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    }
  },
  { timestamps: true }
);

/* -------------------- INDEXES -------------------- */

// 🔥 unique order inside subject
chapterSchema.index(
  { subject: 1, order: 1 },
  { unique: true }
);

// 🔥 unique title inside subject
chapterSchema.index(
  { title: 1, subject: 1 },
  { unique: true }
);

// 🔥 fast queries
chapterSchema.index({ subject: 1, isActive: 1, order: 1 });


/* -------------------- SLUG -------------------- */

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};


/* -------------------- PRE SAVE -------------------- */

chapterSchema.pre("save", async function (next) {

  if (!this.isModified("title")) return next();

  let baseSlug = generateSlug(this.title);
  let slug = baseSlug;

  let count = 0;

  while (
    await mongoose.models.Chapter.findOne({
      slug,
      subject: this.subject
    })
  ) {
    count++;
    slug = `${baseSlug}-${count}`;
  }

  this.slug = slug;

  // next();
});

const Chapter = mongoose.model("Chapter", chapterSchema);

export default Chapter;