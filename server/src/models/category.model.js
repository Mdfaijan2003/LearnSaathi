import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 50
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
      unique: true
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
categorySchema.index({ name: "text" });

/* -------------------- PRE SAVE -------------------- */

// Generate slug automatically
categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name.replace(/\s+/g, "-");
  }
  // next();
});

const Category = mongoose.model("Category", categorySchema);

export default Category;