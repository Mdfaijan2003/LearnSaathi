import { ApiError } from "../utils/ApiError.js";

export const requireApprovedTeacher = (req, res, next) => {

  if (req.user.role !== "teacher") {
    throw new ApiError(403, "Only teachers allowed");
  }

  if (req.user.teacherStatus !== "approved") {
    throw new ApiError(403, "Teacher not approved yet");
  }

  next();
};