import Enrollment from "../models/enrollment.model.js";
import Course from "../models/course.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const enrollCourse = asyncHandler(async (req, res) => {

  const { courseId } = req.body;

  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const enrollment = await Enrollment.create({
    user: req.user._id,
    course: courseId
  });

  return res.status(201).json(
    new ApiResponse(201, enrollment, "Enrolled successfully")
  );
});

export const getMyCourses = asyncHandler(async (req, res) => {

  const courses = await Enrollment.find({ user: req.user._id })
    .populate("course");

  return res.status(200).json(
    new ApiResponse(200, courses, "My courses fetched")
  );
});