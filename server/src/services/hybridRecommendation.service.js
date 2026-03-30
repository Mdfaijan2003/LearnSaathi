import Video from "../models/video.model.js";
import WatchHistory from "../models/watchHistory.model.js";

/* -------------------- MAIN FUNCTION -------------------- */

export const computeHybridRecommendations = async (userId) => {

  /* =========================================================
     1. USER HISTORY
  ========================================================= */

  const history = await WatchHistory.find({ user: userId })
    .populate({
      path: "video",
      select: "category program subject duration"
    });

  const watchedIds = history.map(h => h.video?._id).filter(Boolean);

  /* =========================================================
     2. CONTENT-BASED SCORE
  ========================================================= */

  const subjectWeight = {};

  history.forEach(h => {
    const v = h.video;
    if (!v) return;

    const ratio = v.duration
      ? Math.min(h.watchedSeconds / v.duration, 1)
      : 0.5;

    const weight = ratio * 10;

    if (v.subject) {
      const key = v.subject.toString();
      subjectWeight[key] = (subjectWeight[key] || 0) + weight;
    }
  });

  const contentVideos = await Video.find({
    subject: { $in: Object.keys(subjectWeight) },
    _id: { $nin: watchedIds }
  })
    .limit(50)
    .lean();

  /* =========================================================
     3. COLLABORATIVE FILTERING
  ========================================================= */

  const similarUsers = await WatchHistory.aggregate([
    {
      $match: {
        video: { $in: watchedIds },
        user: { $ne: userId }
      }
    },
    {
      $group: {
        _id: "$user",
        common: { $sum: 1 }
      }
    },
    { $sort: { common: -1 } },
    { $limit: 20 }
  ]);

  const similarUserIds = similarUsers.map(u => u._id);

  let collabVideos = [];

  if (similarUserIds.length > 0) {
    collabVideos = await WatchHistory.aggregate([
      {
        $match: {
          user: { $in: similarUserIds },
          video: { $nin: watchedIds }
        }
      },
      {
        $group: {
          _id: "$video",
          score: { $sum: 1 }
        }
      },
      { $sort: { score: -1 } },
      { $limit: 50 },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "_id",
          as: "video"
        }
      },
      { $unwind: "$video" }
    ]);
  }

  /* =========================================================
     4. TRENDING
  ========================================================= */

  const trending = await Video.find()
    .sort({ views: -1, ratingAverage: -1 })
    .limit(50)
    .lean();

  /* =========================================================
     5. MERGE + SCORE
  ========================================================= */

  const map = new Map();

  /* 🔹 Content-based */
  contentVideos.forEach(v => {
    map.set(v._id.toString(), {
      ...v,
      score: 0.5 * (subjectWeight[v.subject] || 1)
    });
  });

  /* 🔹 Collaborative */
  collabVideos.forEach(item => {
    const id = item.video._id.toString();

    if (!map.has(id)) {
      map.set(id, { ...item.video, score: 0 });
    }

    map.get(id).score += 0.3 * item.score;
  });

  /* 🔹 Trending */
  trending.forEach(v => {
    const id = v._id.toString();

    if (!map.has(id)) {
      map.set(id, { ...v, score: 0 });
    }

    map.get(id).score += 0.2 * Math.log10(v.views + 1);
  });

  /* =========================================================
     6. FINAL SORT
  ========================================================= */

  const result = Array.from(map.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return result;
};