// import dotenv from "dotenv";
// dotenv.config({
//   path: "../.env"
// });
import "./config/env.js";

import connectDB from "./db/db.js";
import { app } from "./app.js";
import { createMasterAdmin } from "./utils/createMasterAdmin.js";
import { connectRedis } from "./utils/redis.js";

 // 🔥 VERY IMPORTANT

// dotenv.config({
//   path: "../.env",
// });
console.log("Hello, Server is starting...");

const startServer = async () => {
  try {
    await connectDB();

    await createMasterAdmin();

    await connectRedis();

    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });

  } catch (error) {
    console.error("❌ Server start failed:", error);
    process.exit(1);
  }
};

startServer();