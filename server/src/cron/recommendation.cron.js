import cron from "node-cron";

import { redisClient } from "../utils/redis.js";
import { computeRecommendations } from "../services/recommendation.service.js";
import { computeHybridRecommendations } from "../services/hybridRecommendation.service.js";

import User from "../models/user.model.js";


export const startRecommendationCron = () => {

  cron.schedule("*/15 * * * *", async () => {

    console.log("🔥 Running recommendation cron...");

    try {

      /* =====================================================
         REDIS CHECK
      ===================================================== */

      if (!redisClient.isOpen) {
        console.log("❌ Redis not connected");
        return;
      }

      /* =====================================================
         ACTIVE USERS ONLY
      ===================================================== */

      const users = await User.find({

        isActive: true

      })

        .select("_id")

        .lean();

      console.log(`👥 Users found: ${users.length}`);

      /* =====================================================
         PROCESS USERS
      ===================================================== */

      for (const user of users) {

        try {

          const userId = user._id.toString();

          /* -----------------------------------------------
             COMPUTE IN PARALLEL
          ----------------------------------------------- */

          const [

            recommendations,
            hybridRecommendations

          ] = await Promise.all([

            computeRecommendations(userId),

            computeHybridRecommendations(userId)

          ]);

          /* -----------------------------------------------
             SAVE CACHE
          ----------------------------------------------- */

          await Promise.all([

            redisClient.setEx(

              `recommendations:${userId}`,

              60 * 60,

              JSON.stringify(recommendations)

            ),

            redisClient.setEx(

              `hybrid:${userId}`,

              60 * 60,

              JSON.stringify(hybridRecommendations)

            )

          ]);

          console.log(
            `✅ Cached recommendations for ${userId}`
          );

        } catch (err) {

          console.log(
            `❌ Failed for user ${user._id}:`,
            err.message
          );

        }

      }

      console.log("🚀 Recommendation cron completed");

    } catch (err) {

      console.log(
        "❌ Recommendation cron failed:",
        err.message
      );

    }

  });

};