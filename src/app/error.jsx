"use client";

import { useEffect } from "react";
import Button from "@/components/Button";
import { AlertOctagon } from "lucide-react";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4 text-center">
      <div className="app-card border shadow-sm p-5 d-flex flex-column align-items-center rounded-4" style={{ maxWidth: 450 }}>
        <AlertOctagon size={48} color="#ef4444" className="mb-3 opacity-75" />
        <h2 className="h4 fw-bold">Something went wrong</h2>
        <p className="text-body-secondary small mb-4">
          The application encountered an unexpected error. We apologize for the inconvenience.
        </p>
        <div className="d-flex gap-3">
          <Button variant="ghost" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
          <Button variant="primary" onClick={() => reset()}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
