import mongoose from "mongoose";

const programSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    description: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

// prevent duplicate programs inside same category
programSchema.index({ category: 1, name: 1 }, { unique: true });

const Program = mongoose.model("Program", programSchema);

export default Program;