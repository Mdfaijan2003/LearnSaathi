import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 100,
      validate: {
        validator: function (v) {
            return v.trim().length > 0;
        },
        message: "Name cannot be empty"
      }
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
      index: true,
      trim: true
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
  { unique: true, collation: { locale: "en", strength: 2 } },
);

// 🔥 search
// programSchema.index({ name: "text" });

// 🔥 performance
programSchema.index({ category: 1, isActive: 1 });


/* -------------------- UTILS -------------------- */

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};


/* -------------------- PRE SAVE -------------------- */

programSchema.pre("save", async function () {

  if (!this.isModified("name")) return;

  let baseSlug = generateSlug(this.name);
  let slug = baseSlug;

  let count = 1;

  while (
    await mongoose.models.Program.findOne({
      slug,
      category: this.category,
      _id: { $ne: this._id }
    })
  ) {
    slug = `${baseSlug}-${count++}`;
  }

  this.slug = slug;
});


const Program = mongoose.model("Program", programSchema);

export default Program;