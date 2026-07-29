import "server-only";
import { v2 as cloudinary } from "cloudinary";

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn(
    "Cloudinary is not configured -- CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and " +
      "CLOUDINARY_API_SECRET must all be set in .env.local with real values from " +
      "your Cloudinary dashboard (cloudinary.com/console). Profile photo uploads will fail until then.",
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
