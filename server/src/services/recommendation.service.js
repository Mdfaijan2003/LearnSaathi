import WatchHistory from "../models/watchHistory.model.js";
import Video from "../models/video.model.js";

export const computeRecommendations = async (userId) => {

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
        createdAt: -1
      })

      .limit(10)

      .lean();

  }

  /* =========================================================
     WEIGHTS
  ========================================================= */

  const subjectWeight = {};
  const programWeight = {};
  const categoryWeight = {};

  const watchedIds = [];

  history.forEach(h => {

    const v = h.video;

    if (!v) return;

    watchedIds.push(v._id);

    /* ---------------- WATCH RATIO ---------------- */

    const ratio = v.duration
      ? Math.min(h.watchedSeconds / v.duration, 1)
      : 0.5;

    const weight = ratio * 10;

    /* ---------------- SUBJECT ---------------- */

    if (v.subject) {

      const key = v.subject.toString();

      subjectWeight[key] =
        (subjectWeight[key] || 0) + weight;

    }

    /* ---------------- PROGRAM ---------------- */

    if (v.program) {

      const key = v.program.toString();

      programWeight[key] =
        (programWeight[key] || 0) + weight;

    }

    /* ---------------- CATEGORY ---------------- */

    if (v.category) {

      const key = v.category.toString();

      categoryWeight[key] =
        (categoryWeight[key] || 0) + weight;

    }

  });

  /* =========================================================
     CANDIDATE VIDEOS
  ========================================================= */

  const videos = await Video.find({

    isActive: true,

    _id: {
      $nin: watchedIds
    }

  })

    .limit(100)

    .lean();

  /* =========================================================
     SCORE VIDEOS
  ========================================================= */

  const scored = videos.map(v => {

    let score = 0;

    /* ---------------- SUBJECT ---------------- */

    if (v.subject) {

      score +=
        (subjectWeight[v.subject.toString()] || 0) * 3;

    }

    /* ---------------- PROGRAM ---------------- */

    if (v.program) {

      score +=
        (programWeight[v.program.toString()] || 0) * 2;

    }

    /* ---------------- CATEGORY ---------------- */

    if (v.category) {

      score +=
        (categoryWeight[v.category.toString()] || 0);

    }

    /* ---------------- POPULARITY ---------------- */

    score += Math.log10(v.views + 1);

    return {
      ...v,
      score
    };

  });

  /* =========================================================
     FINAL SORT
  ========================================================= */

  return scored

    .sort((a, b) => b.score - a.score)

    .slice(0, 10);

};