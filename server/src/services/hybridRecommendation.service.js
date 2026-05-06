import Video from "../models/video.model.js";
import WatchHistory from "../models/watchHistory.model.js";

export const computeHybridRecommendations =
async (userId) => {

  /* =========================================================
     USER HISTORY
  ========================================================= */

  const history = await WatchHistory.find({
    user: userId
  })

    .populate({
      path: "video",
      match: { isActive: true },
      select: `
        category
        program
        subject
        duration
        views
        ratingAverage
      `
    })

    .lean();

  /* =========================================================
     NO HISTORY → TRENDING
  ========================================================= */

  if (history.length === 0) {

    return await Video.find({
      isActive: true
    })

      .sort({
        views: -1,
        ratingAverage: -1,
        createdAt: -1
      })

      .limit(10)

      .lean();

  }

  /* =========================================================
     WATCHED IDS
  ========================================================= */

  const watchedIds = history

    .map(h => h.video?._id)

    .filter(Boolean);

  /* =========================================================
     CONTENT WEIGHTS
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

      subjectWeight[key] =
        (subjectWeight[key] || 0) + weight;

    }

  });

  /* =========================================================
     CONTENT-BASED VIDEOS
  ========================================================= */

  const contentVideos = await Video.find({

    isActive: true,

    subject: {
      $in: Object.keys(subjectWeight)
    },

    _id: {
      $nin: watchedIds
    }

  })

    .limit(50)

    .lean();

  /* =========================================================
     COLLABORATIVE FILTERING
  ========================================================= */

  const similarUsers =
    await WatchHistory.aggregate([

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

      {
        $sort: {
          common: -1
        }
      },

      {
        $limit: 20
      }

    ]);

  const similarUserIds =
    similarUsers.map(u => u._id);

  let collabVideos = [];

  /* =========================================================
     GET SIMILAR USER VIDEOS
  ========================================================= */

  if (similarUserIds.length > 0) {

    collabVideos =
      await WatchHistory.aggregate([

        {
          $match: {

            user: {
              $in: similarUserIds
            },

            video: {
              $nin: watchedIds
            }

          }
        },

        {
          $group: {
            _id: "$video",
            score: { $sum: 1 }
          }
        },

        {
          $sort: {
            score: -1
          }
        },

        {
          $limit: 50
        },

        {
          $lookup: {
            from: "videos",
            localField: "_id",
            foreignField: "_id",
            as: "video"
          }
        },

        {
          $unwind: "$video"
        },

        {
          $match: {
            "video.isActive": true
          }
        }

      ]);

  }

  /* =========================================================
     TRENDING
  ========================================================= */

  const trending = await Video.find({
    isActive: true
  })

    .sort({
      views: -1,
      ratingAverage: -1,
      createdAt: -1
    })

    .limit(50)

    .lean();

  /* =========================================================
     MERGE + SCORE
  ========================================================= */

  const map = new Map();

  /* ---------------- CONTENT ---------------- */

  contentVideos.forEach(v => {

    map.set(v._id.toString(), {

      ...v,

      score:
        0.5 *
        (subjectWeight[v.subject?.toString()] || 1)

    });

  });

  /* ---------------- COLLAB ---------------- */

  collabVideos.forEach(item => {

    const id = item.video._id.toString();

    if (!map.has(id)) {

      map.set(id, {
        ...item.video,
        score: 0
      });

    }

    map.get(id).score += 0.3 * item.score;

  });

  /* ---------------- TRENDING ---------------- */

  trending.forEach(v => {

    const id = v._id.toString();

    if (!map.has(id)) {

      map.set(id, {
        ...v,
        score: 0
      });

    }

    map.get(id).score +=
      0.2 * Math.log10(v.views + 1);

  });

  /* =========================================================
     FINAL SORT
  ========================================================= */

  return Array.from(map.values())

    .sort((a, b) => b.score - a.score)

    .slice(0, 10);

};