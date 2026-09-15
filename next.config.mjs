/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Lets next/image optimize the Cloudinary-hosted profile photos.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
};

export default nextConfig;
