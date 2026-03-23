import mongoose from "mongoose";
import Course from "../models/course.model.js";
import Video from "../models/video.model.js";
import Enrollment from "../models/enrollment.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getTeacherDashboard = asyncHandler(async (req, res) => {

  // ✅ 1. Validate user
  if (!req.user || !req.user._id) {
    throw new ApiError(401, "Unauthorized access");
  }

  const teacherId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(teacherId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  // ✅ 2. Get teacher courses first
  const courses = await Course.find({ instructorId: teacherId })
    .select("_id")
    .lean();

  const courseIds = courses.map(c => c._id);

  // ✅ 3. Parallel queries (optimized)
  const [totalCourses, totalVideos, totalStudents] = await Promise.all([

    Course.countDocuments({ instructorId: teacherId }),

    Video.countDocuments({ uploadedBy: teacherId }),

    courseIds.length > 0
      ? Enrollment.countDocuments({ courseId: { $in: courseIds } })
      : 0

  ]);

  // ✅ 4. Final response
  return res.status(200).json(
    new ApiResponse(200, {
      totalCourses,
      totalVideos,
      totalStudents
    }, "Teacher dashboard fetched successfully")
  );
});