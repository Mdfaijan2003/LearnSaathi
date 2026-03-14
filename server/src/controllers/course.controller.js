import Course from "../models/course.model.js";
import CourseModule from "../models/courseModule.model.js";
import CourseLecture from "../models/courseLecture.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const getFullCourse = asyncHandler(async (req, res) => {

  const { courseId } = req.params;

  const course = await Course.findById(courseId)
    .populate("instructor", "username avatar");

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  const modules = await CourseModule.find({ course: courseId })
    .sort({ order: 1 });

  const moduleIds = modules.map(m => m._id);

  const lectures = await CourseLecture.find({
    module: { $in: moduleIds }
  }).sort({ order: 1 });

  const moduleMap = {};

  modules.forEach(module => {
    moduleMap[module._id] = {
      ...module.toObject(),
      lectures: []
    };
  });

  lectures.forEach(lecture => {
    moduleMap[lecture.module].lectures.push(lecture);
  });

  const result = modules.map(module => moduleMap[module._id]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        course,
        modules: result
      },
      "Course structure fetched"
    )
  );

});

export const createCourse = asyncHandler(async (req, res) => {

  if (req.user.role !== "teacher") {
    throw new ApiError(403, "Only teachers can create courses");
  }

  const { title, description, category, program, price, isFree } = req.body;

  const course = await Course.create({
    title,
    description,
    category,
    program,
    price,
    isFree,
    instructor: req.user._id
  });

  return res.status(201).json(
    new ApiResponse(201, course, "Course created successfully")
  );
});

export const getCourses = asyncHandler(async (req, res) => {

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const courses = await Course.find()
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, courses, "Courses fetched")
  );
});

export const getCourseById = asyncHandler(async (req, res) => {

  const { courseId } = req.params;

  const course = await Course.findById(courseId).populate(
    "instructor",
    "username avatar"
  );

  if (!course) {
    throw new ApiError(404, "Course not found");
  }

  return res.status(200).json(
    new ApiResponse(200, course, "Course fetched")
  );
});