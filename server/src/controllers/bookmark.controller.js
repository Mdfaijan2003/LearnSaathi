import Bookmark from "../models/bookmark.model.js";
import mongoose from "mongoose";

import TeacherNote from "../models/teacherNote.model.js";
import Video from "../models/video.model.js";
import Topic from "../models/topic.model.js";

import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

export const toggleBookmark = asyncHandler(async (req, res) => {

  const { type, item } = req.body;

  if (!type || !["note", "video", "topic"].includes(type)) {
    throw new ApiError(400, "Invalid type");
  }

  if (!item || !isValidId(item)) {
    throw new ApiError(400, "Invalid item ID");
  }

  /* 🔥 EXISTENCE CHECK */
  if (type === "note") {
    const exists = await TeacherNote.exists({ _id: item });
    if (!exists) throw new ApiError(404, "Note not found");
  }

  if (type === "video") {
    const exists = await Video.exists({ _id: item });
    if (!exists) throw new ApiError(404, "Video not found");
  }

  if (type === "topic") {
    const exists = await Topic.exists({ _id: item });
    if (!exists) throw new ApiError(404, "Topic not found");
  }

  const filter = {
    user: req.user._id,
    type,
    item
  };

  const existing = await Bookmark.findOneAndDelete(filter);

  if (existing) {
    await existing.deleteOne();
    return res.json(
      new ApiResponse(200, { bookmarked: false }, "Removed")
    );
  }

  // await Bookmark.create(filter);

  try {
    await Bookmark.create(filter);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(200).json(
        new ApiResponse(200, { bookmarked: true }, "Already bookmarked")
      );
    }
    throw err;
  }

  return res.status(201).json(
    new ApiResponse(201, { bookmarked: true }, "Bookmark added")
  );
});

export const getBookmarks = asyncHandler(async (req, res) => {

  let { type, page = 1, limit = 10 } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);

  const filter = { user: req.user._id };

  if (type) {
    if (!["note", "video", "topic"].includes(type)) {
      throw new ApiError(400, "Invalid type");
    }
    filter.type = type;
  }

  const skip = (page - 1) * limit;

  const bookmarks = await Bookmark.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  /* 🔥 FETCH REAL DATA */
  const populated = await Promise.all(
    bookmarks.map(async (b) => {

      let data = null;

      if (b.type === "note") {
        data = await TeacherNote.findById(b.item)
          .select("title fileUrl")
          .lean();
      }

      if (b.type === "video") {
        data = await Video.findById(b.item)
          .select("title thumbnail")
          .lean();
      }

      if (b.type === "topic") {
        data = await Topic.findById(b.item)
          .select("title")
          .lean();
      }

      return {
        id: b._id,
        type: b.type,
        data
      };
    })
  );

  return res.json(
    new ApiResponse(200, populated, "Bookmarks fetched")
  );
});

export const deleteBookmark = asyncHandler(async (req, res) => {

  const { id } = req.params;

  const deleted = await Bookmark.findOneAndDelete({
    _id: id,
    user: req.user._id
  });

  if (!deleted) {
    throw new ApiError(404, "Bookmark not found");
  }

  return res.json(
    new ApiResponse(200, {}, "Deleted")
  );
});