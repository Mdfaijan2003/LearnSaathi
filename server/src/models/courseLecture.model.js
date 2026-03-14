import mongoose from "mongoose";

const courseLectureSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseModule",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    videoType: {
      type: String,
      enum: ["internal", "youtube"],
      required: true
    },

    videoUrl: {
      type: String,
      required: true
    },

    duration: {
      type: Number
    },

    order: {
      type: Number,
      required: true
    },

    isPreview: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

courseLectureSchema.index({ module: 1 });

const CourseLecture = mongoose.model("CourseLecture", courseLectureSchema);

export default CourseLecture;