import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 100
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true
    },

    icon: {
      type: String
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

// 🔥 UNIQUE within category
programSchema.index(
  { name: 1, category: 1 },
  { unique: true }
);

// 🔥 search
programSchema.index({ name: "text" });

// 🔥 performance
programSchema.index({ category: 1, isActive: 1 });


/* -------------------- UTILS -------------------- */

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};


/* -------------------- PRE SAVE -------------------- */

programSchema.pre("save", async function (next) {

  if (!this.isModified("name")) return next();

  let baseSlug = generateSlug(this.name);
  let slug = baseSlug;

  let count = 0;

  // 🔥 unique slug per category
  while (
    await mongoose.models.Program.findOne({
      slug,
      category: this.category
    })
  ) {
    count++;
    slug = `${baseSlug}-${count}`;
  }

  this.slug = slug;

  // next();
});


const Program = mongoose.model("Program", programSchema);

export default Program;