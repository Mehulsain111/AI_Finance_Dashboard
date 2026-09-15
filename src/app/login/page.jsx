"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center px-3">
      <div className="app-card card shadow-sm" style={{ maxWidth: 420, width: "100%" }}>
        <div className="card-body p-4 p-sm-5">
          <h1 className="h4 fw-semibold mb-1">Welcome back</h1>
          <p className="text-body-secondary small mb-4">Log in to your Finance Dashboard</p>

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <div>
              <label className="form-label small fw-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="form-label small fw-medium">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control"
                autoComplete="current-password"
              />
            </div>

            {error ? <div className="alert alert-danger py-2 small mb-0">{error}</div> : null}

            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
              className="w-100 justify-content-center"
            >
              {submitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>

          <p className="text-center small text-body-secondary mt-4 mb-0">
            Don&apos;t have an account? <Link href="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
