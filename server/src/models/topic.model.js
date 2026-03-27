import mongoose from "mongoose";

const topicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 200
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

// 🔥 unique topic name per chapter
topicSchema.index(
  { title: 1, chapter: 1 },
  { unique: true }
);

// 🔥 unique order per chapter
topicSchema.index(
  { chapter: 1, order: 1 },
  { unique: true }
);

// 🔥 fast queries
topicSchema.index({ chapter: 1, isActive: 1, order: 1 });

// 🔥 search
topicSchema.index({ title: "text" });


/* -------------------- SLUG UTILS -------------------- */

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};


/* -------------------- PRE SAVE -------------------- */

topicSchema.pre("save", async function (next) {

  if (!this.isModified("title")) return next();

  let baseSlug = generateSlug(this.title);
  let slug = baseSlug;

  let count = 0;

  while (
    await mongoose.models.Topic.findOne({
      slug,
      chapter: this.chapter
    })
  ) {
    count++;
    slug = `${baseSlug}-${count}`;
  }

  this.slug = slug;

  // next();
});

const Topic = mongoose.model("Topic", topicSchema);

export default Topic;