import Bookmark from "../models/bookmark.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const addBookmark = asyncHandler(async (req, res) => {

  const { contentType, contentId } = req.body;

  const bookmark = await Bookmark.create({
    user: req.user._id,
    contentType,
    contentId
  });

  return res.status(201).json(
    new ApiResponse(201, bookmark, "Bookmark added")
  );

});

export const removeBookmark = asyncHandler(async (req, res) => {

  const { contentType, contentId } = req.body;

  await Bookmark.findOneAndDelete({
    user: req.user._id,
    contentType,
    contentId
  });

  return res.status(200).json(
    new ApiResponse(200, {}, "Bookmark removed")
  );

});

export const getMyBookmarks = asyncHandler(async (req, res) => {

  const bookmarks = await Bookmark.find({
    user: req.user._id
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, bookmarks, "Bookmarks fetched")
  );

});