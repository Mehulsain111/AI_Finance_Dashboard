"use client";

import Button from "./Button";
import { useApp } from "@/context/AppContext";

export default function DarkModeToggle() {
  const { darkMode, setDarkMode } = useApp();

  return (
    <Button
      variant="default"
      onClick={() => setDarkMode((v) => !v)}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      {darkMode ? "Light Mode" : "Dark Mode"}
    </Button>
  );
}
