import Note from "../models/note.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadCloudinary } from "../utils/cloudinary.js";


// Upload note (teacher only)
export const uploadNote = asyncHandler(async (req, res) => {

  if (req.user.role !== "teacher") {
    throw new ApiError(403, "Only teachers can upload notes");
  }

  const {
    title,
    description,
    content,
    program,
    subject,
    chapter,
    topic,
    isFree
  } = req.body;

  if (!title || !program || !subject) {
    throw new ApiError(400, "Required fields missing");
  }

  let fileUrl = "";

  const fileLocalPath = req.files?.file?.[0]?.path;

  if (fileLocalPath) {

    const uploadedFile = await uploadCloudinary(fileLocalPath);

    if (!uploadedFile) {
      throw new ApiError(500, "File upload failed");
    }

    fileUrl = uploadedFile.secure_url;
  }

  const note = await Note.create({
    title,
    description,
    content,
    fileUrl,
    program,
    subject,
    chapter,
    topic,
    uploadedBy: req.user._id,
    isFree
  });

  return res.status(201).json(
    new ApiResponse(201, note, "Note uploaded successfully")
  );
});


// Get note by id
export const getNoteById = asyncHandler(async (req, res) => {

  const note = await Note.findById(req.params.noteId)
    .populate("uploadedBy", "username avatar");

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res.status(200).json(
    new ApiResponse(200, note, "Note fetched successfully")
  );
});


// Get notes by topic
export const getNotesByTopic = asyncHandler(async (req, res) => {

  const notes = await Note.find({
    topic: req.params.topicId
  })
  .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, notes, "Notes fetched")
  );
});


// Get notes by chapter
export const getNotesByChapter = asyncHandler(async (req, res) => {

  const notes = await Note.find({
    chapter: req.params.chapterId
  })
  .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, notes, "Notes fetched")
  );
});


// Get notes by subject
export const getNotesBySubject = asyncHandler(async (req, res) => {

  const notes = await Note.find({
    subject: req.params.subjectId
  })
  .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, notes, "Notes fetched")
  );
});


// Search notes
export const searchNotes = asyncHandler(async (req, res) => {

  const { q } = req.query;

  if (!q) {
    throw new ApiError(400, "Search query required");
  }

  const notes = await Note.find(
    { $text: { $search: q } },
    { score: { $meta: "textScore" } }
  )
  .sort({ score: { $meta: "textScore" } });

  return res.status(200).json(
    new ApiResponse(200, notes, "Search results")
  );
});