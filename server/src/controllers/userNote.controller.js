import mongoose from "mongoose";
import UserNote from "../models/userNote.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const createNote = asyncHandler(async (req, res) => {
  const { title, content, video, topic, timestamp, tags } = req.body;

  // 🔒 Validation
  if (!title || title.trim().length < 2) {
    throw new ApiError(400, "Title must be at least 2 characters");
  }

  if (!content || content.trim().length < 2) {
    throw new ApiError(400, "Content must be at least 2 characters");
  }

  if (!video && !topic) {
    throw new ApiError(400, "Note must be linked to video or topic");
  }

  if (video && topic) {
    throw new ApiError(400, "Note cannot have both video and topic");
  }

  if (video && !mongoose.Types.ObjectId.isValid(video)) {
    throw new ApiError(400, "Invalid video ID");
  }

  if (topic && !mongoose.Types.ObjectId.isValid(topic)) {
    throw new ApiError(400, "Invalid topic ID");
  }

  // 🔒 Sanitize
  const safeTitle = title.trim().slice(0, 120);
  const safeContent = content.trim().slice(0, 2000);

  const safeTags = Array.isArray(tags) ? tags.slice(0, 10) : [];

  const safeTimestamp =
    timestamp !== undefined && timestamp >= 0 ? timestamp : null;

  // 🔥 Create
  const note = await UserNote.create({
    user: req.user._id,
    video: video || null,
    topic: topic || null,
    title: safeTitle,
    content: safeContent,
    timestamp: safeTimestamp,
    tags: safeTags
  });

  return res.status(201).json(
    new ApiResponse(201, note, "Note created successfully")
  );
});

// get my notes
export const getNotes = asyncHandler(async (req, res) => {
  const { video, topic, search, tag } = req.query;

  const filter = { user: req.user._id };

  // 🔒 Filters
  if (video) {
    if (!mongoose.Types.ObjectId.isValid(video)) {
      throw new ApiError(400, "Invalid video ID");
    }
    filter.video = video;
  }

  if (topic) {
    if (!mongoose.Types.ObjectId.isValid(topic)) {
      throw new ApiError(400, "Invalid topic ID");
    }
    filter.topic = topic;
  }

  if (tag) {
    filter.tags = tag;
  }

  // 🔍 Search
  if (search) {
    filter.$text = { $search: search };
  }

  const notes = await UserNote.find(filter)
    .sort({ isPinned: -1, createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, notes, "Notes fetched successfully")
  );
});


// get notes by topic
export const getNoteById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid note ID");
  }

  const note = await UserNote.findOne({
    _id: id,
    user: req.user._id
  });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res.status(200).json(
    new ApiResponse(200, note, "Note fetched")
  );
});


// update note
export const updateNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content, tags, isPinned } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid note ID");
  }

  const note = await UserNote.findOne({
    _id: id,
    user: req.user._id
  });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  // 🔒 Update fields safely
  if (title !== undefined) {
    if (title.trim().length < 2) {
      throw new ApiError(400, "Title too short");
    }
    note.title = title.trim().slice(0, 120);
  }

  if (content !== undefined) {
    if (content.trim().length < 2) {
      throw new ApiError(400, "Content too short");
    }
    note.content = content.trim().slice(0, 2000);
  }

  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      throw new ApiError(400, "Tags must be an array");
    }
    note.tags = tags.slice(0, 10);
  }

  if (typeof isPinned === "boolean") {
    note.isPinned = isPinned;
  }

  note.lastEditedAt = new Date();

  await note.save();

  return res.status(200).json(
    new ApiResponse(200, note, "Note updated successfully")
  );
});


// delete note
export const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid note ID");
  }

  const note = await UserNote.findOneAndDelete({
    _id: id,
    user: req.user._id
  });

  if (!note) {
    throw new ApiError(404, "Note not found");
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Note deleted successfully")
  );
});