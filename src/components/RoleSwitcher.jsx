"use client";

import { useApp } from "@/context/AppContext";

export default function RoleSwitcher() {
  const { role, setRole } = useApp();

  return (
    <label className="d-flex align-items-center gap-2 rounded-pill border px-3 py-2 bg-body shadow-sm">
      <span className="small text-body-secondary">Role</span>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="form-select form-select-sm w-auto"
        aria-label="Role switcher"
      >
        <option value="viewer">Viewer</option>
        <option value="admin">Admin</option>
      </select>
    </label>
  );
}
