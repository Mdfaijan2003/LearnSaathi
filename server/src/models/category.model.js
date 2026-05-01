import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 50,
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
      maxlength: 300
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
      unique: true,
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

// ✅ Prevent duplicate category names
categorySchema.index(
  { name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);
// categorySchema.index({ name: "text" });

/* -------------------- PRE SAVE -------------------- */

// Generate slug automatically
categorySchema.pre("save", async function () {
  if (this.isModified("name")) {
    let baseSlug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    let slug = baseSlug;
    let count = 1;

    // 🔥 ensure uniqueness
    while (await mongoose.models.Category.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    this.slug = slug;
  }
});

const Category = mongoose.model("Category", categorySchema);

export default Category;