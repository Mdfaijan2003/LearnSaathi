import mongoose from "mongoose";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import Video from "../models/video.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


export const createAdmin = asyncHandler(async (req, res) => {

  // 🔐 Only master admin allowed
  if (req.user.email !== process.env.MASTER_ADMIN_EMAIL) {
    throw new ApiError(403, "Only master admin can create admins");
  }

  const { username, email, phoneNumber, password, fullName } = req.body;

  const existing = await User.findOne({
    $or: [{ email }, { phoneNumber }]
  });

  if (existing) {
    throw new ApiError(409, "Admin already exists");
  }

  const admin = await User.create({
    username,
    email,
    phoneNumber,
    password,
    fullName,
    role: "admin",
    teacherStatus: "approved",
    isEmailVerified: true
  });

  return res.status(201).json(
    new ApiResponse(201, admin, "Admin created successfully")
  );
});

export const getAdminDashboard = asyncHandler(async (req, res) => {

  const { from, to } = req.query;

  let matchStage = {};

  if (from && to) {
    matchStage.createdAt = {
      $gte: new Date(from),
      $lte: new Date(to)
    };
  }

  const stats = await User.aggregate([

    {
      $match: matchStage
    },

    {
      $facet: {

        // 🔹 USER STATS
        users: [
          {
            $group: {
              _id: null,
              totalUsers: { $sum: 1 },
              students: {
                $sum: { $cond: [{ $eq: ["$role", "student"] }, 1, 0] }
              },
              teachers: {
                $sum: { $cond: [{ $eq: ["$role", "teacher"] }, 1, 0] }
              }
            }
          }
        ],

        // 🔹 TEACHER STATUS
        teacherStatus: [
          {
            $match: { role: "teacher" }
          },
          {
            $group: {
              _id: "$teacherStatus",
              count: { $sum: 1 }
            }
          }
        ],

        // 🔹 RECENT USERS
        recentUsers: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $project: {
              username: 1,
              email: 1,
              role: 1,
              createdAt: 1
            }
          }
        ]

      }
    }
  ]);

  const result = stats[0];

  // Format teacher status
  const teacherStats = {
    pending: 0,
    approved: 0,
    rejected: 0
  };

  result.teacherStatus.forEach(item => {
    teacherStats[item._id] = item.count;
  });

  return res.status(200).json(
    new ApiResponse(200, {
      stats: result.users[0] || {},
      teacherStats,
      recentUsers: result.recentUsers
    }, "Dashboard data")
  );
});


export const getPendingTeachers = asyncHandler(async (req, res) => {

  const { page = 1, limit = 10, search = "" } = req.query;

  const query = {
    role: "teacher",
    teacherStatus: "pending"
  };

  // 🔍 search by name or email
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  const teachers = await User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .select("-password -refreshToken");

  const total = await User.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(200, {
      teachers,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    }, "Pending teachers fetched")
  );
});

export const approveTeacher = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid teacher ID");
  }

  const teacher = await User.findOne({
    _id: id,
    role: "teacher"
  });

  if (!teacher) {
    throw new ApiError(404, "Teacher not found");
  }

  if (teacher.teacherStatus === "approved") {
    throw new ApiError(400, "Teacher already approved");
  }

  teacher.teacherStatus = "approved";
  await teacher.save();

  return res.status(200).json(
    new ApiResponse(200, teacher, "Teacher approved successfully")
  );
});

export const rejectTeacher = asyncHandler(async (req, res) => {

  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid teacher ID");
  }

  const teacher = await User.findOne({
    _id: id,
    role: "teacher"
  });

  if (!teacher) {
    throw new ApiError(404, "Teacher not found");
  }

  teacher.teacherStatus = "rejected";
  await teacher.save();

  return res.status(200).json(
    new ApiResponse(200, teacher, "Teacher rejected")
  );
});

export const getUserGrowth = asyncHandler(async (req, res) => {

  const { from, to } = req.query;

  let matchStage = {};

  // ✅ Validate dates
  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate) || isNaN(toDate)) {
      throw new ApiError(400, "Invalid date format");
    }

    matchStage.createdAt = {
      $gte: fromDate,
      $lte: toDate
    };
  }

  const data = await User.aggregate([
    { $match: matchStage },

    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },

    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1
      }
    }
  ]);

  return res.status(200).json(
    new ApiResponse(200, data, "User growth fetched successfully")
  );
});

