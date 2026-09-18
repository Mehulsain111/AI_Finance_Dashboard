import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getSessionUserId } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";

const MAX_BYTES = 4 * 1024 * 1024; // 4MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("photo");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, or WEBP images are allowed" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const dataUri = `data:${file.type};base64,${Buffer.from(bytes).toString("base64")}`;

  let uploadResult;
  try {
    uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "finance-dashboard/profile-photos",
      // Fixed public_id per user + overwrite: re-uploading replaces the old
      // photo at the same address instead of piling up orphaned images.
      public_id: userId,
      overwrite: true,
      resource_type: "image",
      transformation: [{ width: 256, height: 256, crop: "fill", gravity: "face" }],
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json({ error: "Upload failed, please try again" }, { status: 502 });
  }

  try {
    await dbConnect();
    await User.findByIdAndUpdate(userId, { $set: { profileImageUrl: uploadResult.secure_url } });
    return NextResponse.json({ profileImageUrl: uploadResult.secure_url });
  } catch (err) {
    console.error("Save profile photo error:", err);
    return NextResponse.json({ error: "Something went wrong. Check the server terminal for details." }, { status: 500 });
  }
}
