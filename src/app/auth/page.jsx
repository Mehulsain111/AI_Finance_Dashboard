import Auth3DBackground from "@/components/auth/Auth3DBackground";
import AuthFormGlass from "@/components/auth/AuthFormGlass";

export const metadata = {
  title: "Authenticate | AI Finance",
  description: "Secure futuristic login to your AI Finance Dashboard",
};

export default function AuthPage() {
  return (
    <main className="position-fixed top-0 start-0 w-100 h-100 overflow-y-auto bg-black" style={{ zIndex: 50, WebkitOverflowScrolling: "touch" }}>
      {/* 3D Background Layer */}
      <Auth3DBackground />

      {/* Foreground UI Layer */}
      <AuthFormGlass />
    </main>
  );
}
