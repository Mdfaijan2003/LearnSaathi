import UserNote from "../models/userNote.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// create personal note
export const createUserNote = asyncHandler(async (req, res) => {

  const { topic, title, content } = req.body;

  if (!topic || !title || !content) {
    throw new ApiError(400, "All fields are required");
  }

  const note = await UserNote.create({
    user: req.user._id,
    topic,
    title,
    content
  });

  return res.status(201).json(
    new ApiResponse(201, note, "Note created successfully")
  );

});


// get my notes
export const getMyNotes = asyncHandler(async (req, res) => {

  const notes = await UserNote.find({
    user: req.user._id
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, notes, "Notes fetched")
  );

});


// get notes by topic
export const getMyNotesByTopic = asyncHandler(async (req, res) => {

  const { topicId } = req.params;

  const notes = await UserNote.find({
    user: req.user._id,
    topic: topicId
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, notes, "Topic notes fetched")
  );

});


// update note
export const updateUserNote = asyncHandler(async (req, res) => {

  const { noteId } = req.params;

  const note = await UserNote.findById(noteId);

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  if (note.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  const updatedNote = await UserNote.findByIdAndUpdate(
    noteId,
    req.body,
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(200, updatedNote, "Note updated")
  );

});


// delete note
export const deleteUserNote = asyncHandler(async (req, res) => {

  const { noteId } = req.params;

  const note = await UserNote.findById(noteId);

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  if (note.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized");
  }

  await note.deleteOne();

  return res.status(200).json(
    new ApiResponse(200, {}, "Note deleted")
  );

});