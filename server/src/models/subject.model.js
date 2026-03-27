import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 100
    },

    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      required: true,
      index: true
    },

    icon: {
      type: String
    },

    order: {
      type: Number,
      default: 0,
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

// 🔥 unique within program
subjectSchema.index(
  { name: 1, program: 1 },
  { unique: true }
);

// 🔥 search
subjectSchema.index({ name: "text" });

// 🔥 fast queries
subjectSchema.index({ program: 1, isActive: 1, order: 1 });


/* -------------------- SLUG UTILS -------------------- */

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};


/* -------------------- PRE SAVE -------------------- */

subjectSchema.pre("save", async function (next) {

  if (!this.isModified("name")) return next();

  let baseSlug = generateSlug(this.name);
  let slug = baseSlug;

  let count = 0;

  while (
    await mongoose.models.Subject.findOne({
      slug,
      program: this.program
    })
  ) {
    count++;
    slug = `${baseSlug}-${count}`;
  }

  this.slug = slug;

  // next();
});


const Subject = mongoose.model("Subject", subjectSchema);

export default Subject;