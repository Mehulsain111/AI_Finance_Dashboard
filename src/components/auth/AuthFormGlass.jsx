"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Github, Mail, Lock, User, ArrowRight, Chrome } from "lucide-react"; // Using Chrome as a placeholder for Google icon if Google isn't in lucide

export default function AuthFormGlass() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, signup } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const calculateStrength = (pass) => {
    let score = 0;
    if (pass.length > 5) score += 1;
    if (pass.length > 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    return score;
  };

  const passScore = calculateStrength(form.password);
  const passColor = passScore < 2 ? "#ef4444" : passScore < 3 ? "#eab308" : "#10b981";
  const passWidth = form.password ? `${(passScore / 4) * 100}%` : "0%";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await signup(form.name, form.email, form.password);
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  function handleOAuth(provider) {
    // Mock OAuth for portfolio purposes
    setError(`${provider} OAuth is simulated for this portfolio demo.`);
  }

  return (
    <div className="position-relative w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 10 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? "login" : "signup"}
          initial={{ opacity: 0, rotateY: 90, scale: 0.9 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
          exit={{ opacity: 0, rotateY: -90, scale: 0.9 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          className="card overflow-hidden shadow-lg border-0"
          style={{ 
            maxWidth: 420, 
            width: "100%", 
            background: "rgba(15, 23, 42, 0.6)", 
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
            color: "#f8fafc"
          }}
        >
          <div className="card-body p-4 p-sm-5">
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-25 mb-3" style={{ width: 60, height: 60 }}>
                <Lock className="text-primary" size={28} />
              </div>
              <h2 className="h4 fw-bold mb-1">{isLogin ? "Welcome Back" : "Create Account"}</h2>
              <p className="text-white-50 small">
                {isLogin ? "Access your AI financial core" : "Initialize your biometric financial profile"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
              
              {!isLogin && (
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control bg-dark bg-opacity-50 text-white border-secondary"
                    id="floatingName"
                    placeholder="John Doe"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    style={{ backdropFilter: "blur(4px)" }}
                  />
                  <label htmlFor="floatingName" className="text-white-50"><User size={16} className="me-2 d-inline" />Full Name</label>
                </div>
              )}

              <div className="form-floating">
                <input
                  type="email"
                  className="form-control bg-dark bg-opacity-50 text-white border-secondary"
                  id="floatingEmail"
                  placeholder="name@example.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                />
                <label htmlFor="floatingEmail" className="text-white-50"><Mail size={16} className="me-2 d-inline" />Email address</label>
              </div>

              <div className="form-floating">
                <input
                  type="password"
                  className="form-control bg-dark bg-opacity-50 text-white border-secondary"
                  id="floatingPassword"
                  placeholder="Password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <label htmlFor="floatingPassword" className="text-white-50"><Lock size={16} className="me-2 d-inline" />Password</label>
              </div>

              {/* Password Strength Meter */}
              {!isLogin && (
                <div className="mt-1">
                  <div className="d-flex justify-content-between mb-1">
                    <small className="text-white-50" style={{ fontSize: "0.7rem" }}>Security Level</small>
                    <small style={{ fontSize: "0.7rem", color: passColor }}>
                      {passScore < 2 ? "Weak" : passScore < 3 ? "Moderate" : "Strong"}
                    </small>
                  </div>
                  <div className="progress" style={{ height: "4px", background: "rgba(255,255,255,0.1)" }}>
                    <div 
                      className="progress-bar transition-all" 
                      role="progressbar" 
                      style={{ width: passWidth, backgroundColor: passColor, transition: "width 0.3s ease, background-color 0.3s ease" }}
                    ></div>
                  </div>
                </div>
              )}

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="alert alert-danger py-2 small mb-0 border-0 bg-danger bg-opacity-25 text-danger-emphasis">
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary btn-lg mt-2 fw-semibold d-flex justify-content-center align-items-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  boxShadow: "0 0 15px rgba(59, 130, 246, 0.4)",
                  border: "none",
                  transition: "all 0.3s ease"
                }}
              >
                {submitting ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                ) : (
                  <>
                    {isLogin ? "Authenticate" : "Initialize Account"} <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="d-flex align-items-center my-4">
              <hr className="flex-grow-1 border-secondary opacity-25" />
              <span className="mx-3 text-white-50 small">OR</span>
              <hr className="flex-grow-1 border-secondary opacity-25" />
            </div>

            <div className="d-flex gap-2">
              <button 
                type="button" 
                onClick={() => handleOAuth("Google")}
                className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2 border-secondary text-white-50"
                style={{ transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "var(--bs-secondary)"; }}
              >
                <Chrome size={18} /> Google
              </button>
              <button 
                type="button" 
                onClick={() => handleOAuth("GitHub")}
                className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2 border-secondary text-white-50"
                style={{ transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "var(--bs-secondary)"; }}
              >
                <Github size={18} /> GitHub
              </button>
            </div>

            <div className="text-center mt-4">
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                className="btn btn-link text-white-50 text-decoration-none small p-0"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already initialized? Log in"}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
