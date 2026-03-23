import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const createMasterAdmin = async () => {
  try {

    const existingAdmin = await User.findOne({
      email: process.env.MASTER_ADMIN_EMAIL
    });

    if (existingAdmin) {
      console.log("✅ Master admin already exists");
      return;
    }

    // const hashedPassword = await bcrypt.hash(
    //   process.env.MASTER_ADMIN_PASSWORD,
    //   10
    // );

    await User.create({
      username: "masteradmin",
      fullName: "Master Admin",
      email: process.env.MASTER_ADMIN_EMAIL,
      password: process.env.MASTER_ADMIN_PASSWORD,
      role: "admin",
      teacherStatus: "approved", // not needed but safe
      isEmailVerified: true
    });

    console.log("🔥 Master admin created successfully");

  } catch (error) {
    console.error("❌ Error creating master admin:", error);
  }
};