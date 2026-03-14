import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String
    },

    thumbnail: {
      type: String
    },

    price: {
      type: Number,
      default: 0
    },

    isFree: {
      type: Boolean,
      default: true
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    ratingAverage: {
      type: Number,
      default: 0
    },

    ratingCount: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);

export default Course;