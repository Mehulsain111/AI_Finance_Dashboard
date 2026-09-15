import Auth3DBackground from "@/components/auth/Auth3DBackground";
import AuthFormGlass from "@/components/auth/AuthFormGlass";

export const metadata = {
  title: "Authenticate | AI Finance",
  description: "Secure futuristic login to your AI Finance Dashboard",
};

export default function AuthPage() {
  return (
    <main className="position-relative w-100 vh-100 overflow-hidden bg-black">
      {/* 3D Background Layer */}
      <Auth3DBackground />

      {/* Foreground UI Layer */}
      <AuthFormGlass />
    </main>
  );
}
