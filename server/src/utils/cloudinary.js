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
    if (!localFilePath) {
      throw new Error(400, "No file path provided for upload.");
    }

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
    return new ApiError(500, error.message || "Cloudinary upload failed");
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {

    const response = await cloudinary.uploader.destroy(publicId);

    return response;

  } catch (error) {

    console.error("Cloudinary delete error:", error);
    return new ApiError(500, error.message || "Cloudinary delete failed");

  }
};