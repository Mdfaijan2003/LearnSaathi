import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 150,
      validate: {
        validator: v => v.trim().length > 0,
        message: "Title cannot be empty"
      }
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
      min: 0,
      default: 0
    },

    estimatedMaxTime: {
      type: Number,
      min: 0,
      default: 0
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
  { unique: true, collation: { locale: "en", strength: 2 } }
);

// 🔥 fast queries
chapterSchema.index({ subject: 1, isActive: 1, order: 1 });

chapterSchema.index(
  { slug: 1, subject: 1 },
  { unique: true, sparse: true }
);

chapterSchema.pre("validate", function () {
  if (
    this.estimatedMinTime != null &&
    this.estimatedMaxTime != null &&
    this.estimatedMinTime > this.estimatedMaxTime
  ) {
    throw new Error("Min time cannot be greater than max time");
  }
});

/* -------------------- SLUG -------------------- */

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};


/* -------------------- PRE SAVE -------------------- */

chapterSchema.pre("save", async function () {
  if (!this.isModified("title")) return;

  let baseSlug = generateSlug(this.title);
  let slug = baseSlug;

  let count = 1;

  for (let i = 0; i < 5; i++) {
    const exists = await mongoose.models.Chapter.findOne({
      slug,
      subject: this.subject,
      _id: { $ne: this._id } // 🔥 important
    });

    if (!exists) break;

    slug = `${baseSlug}-${count++}`;
  }

  this.slug = slug;
});

const Chapter = mongoose.model("Chapter", chapterSchema);

export default Chapter;