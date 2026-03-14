import Subject from "../models/subject.model.js";
import Program from "../models/program.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// create subject
export const createSubject = asyncHandler(async (req, res) => {

  const { name, programId, description } = req.body;

  if (!name || !programId) {
    throw new ApiError(400, "Name and program are required");
  }

  const programExists = await Program.findById(programId);

  if (!programExists) {
    throw new ApiError(404, "Program not found");
  }

  const subject = await Subject.create({
    name,
    program: programId,
    description
  });

  return res.status(201).json(
    new ApiResponse(201, subject, "Subject created successfully")
  );
});


// get subjects
export const getSubjects = asyncHandler(async (req, res) => {

  const { programId } = req.query;

  const filter = programId ? { program: programId } : {};

  const subjects = await Subject.find(filter)
    .populate("program", "name");

  return res.status(200).json(
    new ApiResponse(200, subjects, "Subjects fetched successfully")
  );
});