import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = async (fileBuffer, folder = "tirthing") => {
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      stream.end(fileBuffer);
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };

  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("Image upload failed");
  }
};