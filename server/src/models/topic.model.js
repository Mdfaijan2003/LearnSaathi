import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 200,
      validate: {
        validator: v => v.trim().length > 0,
        message: "Title cannot be empty"
      }
    },

    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
      required: true,
      index: true
    },

    order: {
      type: Number,
      required: true,
      min: 0,
      index: true
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

// 🔥 unique topic name per chapter (case-insensitive)
topicSchema.index(
  { title: 1, chapter: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

// 🔥 unique order per chapter
topicSchema.index(
  { chapter: 1, order: 1 },
  { unique: true }
);

// 🔥 fast queries
topicSchema.index({ chapter: 1, isActive: 1, order: 1 });

// 🔥 slug uniqueness
topicSchema.index(
  { slug: 1, chapter: 1 },
  { unique: true, sparse: true }
);


/* -------------------- SLUG UTILS -------------------- */

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};


/* -------------------- PRE SAVE -------------------- */

topicSchema.pre("save", async function () {
  if (!this.isModified("title")) return;

  let baseSlug = generateSlug(this.title);
  let slug = baseSlug;

  let count = 1;
  let attempts = 0;

  while (attempts < 5) {
    const exists = await mongoose.models.Topic.findOne({
      slug,
      chapter: this.chapter,
      _id: { $ne: this._id } // 🔥 critical
    });

    if (!exists) break;

    slug = `${baseSlug}-${count++}`;
    attempts++;
  }

  this.slug = slug;
});


const Topic = mongoose.model("Topic", topicSchema);

export default Topic;