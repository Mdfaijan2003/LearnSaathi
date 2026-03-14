import mongoose from "mongoose";

const courseModuleSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    order: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

courseModuleSchema.index({ course: 1 });

const CourseModule = mongoose.model("CourseModule", courseModuleSchema);

export default CourseModule;