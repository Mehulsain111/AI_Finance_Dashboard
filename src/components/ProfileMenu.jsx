"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function ProfileMenu() {
  const { user, setUser, logout } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const router = useRouter();

  if (!user) return null;

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // so choosing the same file again still fires onChange
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch("/api/user/photo", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUser((u) => (u ? { ...u, profileImageUrl: data.profileImageUrl } : u));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  const initial = user.name?.trim()?.[0]?.toUpperCase() || "?";

  return (
    <div className="position-relative d-flex align-items-center gap-2 rounded-pill border ps-2 pe-3 py-1 bg-body shadow-sm">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="btn p-0 border-0 rounded-circle overflow-hidden flex-shrink-0"
        style={{ width: 32, height: 32 }}
        title="Change profile photo"
        aria-label="Change profile photo"
        disabled={uploading}
      >
        {user.profileImageUrl ? (
          <Image
            src={user.profileImageUrl}
            alt={user.name}
            width={32}
            height={32}
            style={{ objectFit: "cover", width: "100%", height: "100%" }}
          />
        ) : (
          <span
            className="d-flex align-items-center justify-content-center bg-secondary-subtle text-secondary-emphasis fw-semibold"
            style={{ width: 32, height: 32, fontSize: 13 }}
          >
            {initial}
          </span>
        )}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
        className="d-none"
      />

      <span className="small fw-medium text-truncate" style={{ maxWidth: 120 }}>
        {uploading ? "Uploading..." : user.name}
      </span>

      <button type="button" onClick={handleLogout} className="btn btn-sm btn-link text-decoration-none p-0">
        Logout
      </button>

      {error ? (
        <div
          className="position-absolute small text-danger bg-body border rounded-2 px-2 py-1 shadow-sm"
          style={{ top: "calc(100% + 4px)", left: 0, whiteSpace: "nowrap", zIndex: 10 }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}
