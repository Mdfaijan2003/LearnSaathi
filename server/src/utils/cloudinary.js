import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: "learnsaathi/uploads",
      resource_type: "auto",
    });

    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlink(localFilePath, () => {});
    }

    return response;

  } catch (error) {

    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlink(localFilePath, () => {});
    }

    console.error("Cloudinary upload error:", error);
    return null;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {

    const response = await cloudinary.uploader.destroy(publicId);

    return response;

  } catch (error) {

    console.error("Cloudinary delete error:", error);
    return null;

  }
};