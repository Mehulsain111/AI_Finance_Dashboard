"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, Target, DollarSign, CheckCircle2 } from "lucide-react";

export default function AuthFormGlass() {
  // authState: "login" | "signup" | "onboarding"
  const [authState, setAuthState] = useState("login");
  const { login, signup } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [onboarding, setOnboarding] = useState({
    financialGoal: "Wealth Growth",
    monthlyIncome: "5000"
  });

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

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (authState === "login") {
        await login(form.email, form.password);
        router.push("/");
        router.refresh();
      } else {
        // Sign up successfully creates user & sets auth cookie
        await signup(form.name, form.email, form.password);
        // Instead of redirecting immediately, transition to editable onboarding!
        setSubmitting(false);
        setAuthState("onboarding");
      }
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  async function handleOnboardingSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          financialGoal: onboarding.financialGoal,
          monthlyIncome: Number(onboarding.monthlyIncome) || 0,
        }),
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Onboarding error:", err);
      // Fallback redirect if profile PUT fails non-critically
      router.push("/");
      router.refresh();
    }
  }

  function handleOAuth(provider) {
    setError(`${provider} OAuth is simulated for this portfolio demo.`);
  }

  return (
    <div className="position-relative w-100 h-100 d-flex align-items-center justify-content-center" style={{ zIndex: 10 }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={authState}
          initial={{ opacity: 0, rotateY: 90, scale: 0.9 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
          exit={{ opacity: 0, rotateY: -90, scale: 0.9 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.3 }}
          className="card overflow-hidden shadow-lg border-0"
          style={{ 
            maxWidth: 440, 
            width: "100%", 
            background: "rgba(15, 23, 42, 0.65)", 
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
            color: "#f8fafc"
          }}
        >
          <div className="card-body p-4">
            
            {/* Header Section */}
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-primary bg-opacity-25 mb-3" style={{ width: 60, height: 60 }}>
                {authState === "onboarding" ? (
                  <CheckCircle2 className="text-success" size={28} />
                ) : (
                  <Lock className="text-primary" size={28} />
                )}
              </div>
              <h2 className="h4 fw-bold mb-1">
                {authState === "login" && "Welcome Back"}
                {authState === "signup" && "Create Account"}
                {authState === "onboarding" && "Personalize Your Profile"}
              </h2>
              <p className="text-white-50 small mb-0">
                {authState === "login" && "Access your AI financial core"}
                {authState === "signup" && "Initialize your biometric financial profile"}
                {authState === "onboarding" && "Account created! Confirm your financial goals before entry."}
              </p>
            </div>

            {/* LOGIN & SIGNUP FORMS */}
            {authState !== "onboarding" ? (
              <>
                <form onSubmit={handleAuthSubmit} className="d-flex flex-column gap-3">
                  
                  {authState === "signup" && (
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
                      autoComplete={authState === "login" ? "current-password" : "new-password"}
                    />
                    <label htmlFor="floatingPassword" className="text-white-50"><Lock size={16} className="me-2 d-inline" />Password</label>
                  </div>

                  {/* Password Strength Meter for Signup */}
                  {authState === "signup" && (
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
                        {authState === "login" ? "Authenticate" : "Initialize Account"} <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                <div className="d-flex align-items-center my-3">
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="21.17" y1="8" x2="12" y2="8"></line><line x1="3.95" y1="6.06" x2="8.54" y2="14"></line><line x1="10.88" y1="21.94" x2="15.46" y2="14"></line></svg> Google
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleOAuth("GitHub")}
                    className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2 border-secondary text-white-50"
                    style={{ transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#fff"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.borderColor = "var(--bs-secondary)"; }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg> GitHub
                  </button>
                </div>

                <div className="text-center mt-3 mb-0">
                  <button 
                    onClick={() => { setAuthState(authState === "login" ? "signup" : "login"); setError(""); }}
                    className="btn btn-link text-white-50 text-decoration-none small p-0"
                  >
                    {authState === "login" ? "Don't have an account? Sign up" : "Already initialized? Log in"}
                  </button>
                </div>
              </>
            ) : (
              /* EDITABLE POST-SIGNUP ONBOARDING STATE */
              <form onSubmit={handleOnboardingSubmit} className="d-flex flex-column gap-3">
                <div className="form-floating">
                  <input
                    type="text"
                    className="form-control bg-dark bg-opacity-50 text-white border-secondary"
                    id="onboardingName"
                    placeholder="John Doe"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <label htmlFor="onboardingName" className="text-white-50"><User size={16} className="me-2 d-inline" />Display Name</label>
                </div>

                <div className="form-floating">
                  <select
                    className="form-select bg-dark bg-opacity-50 text-white border-secondary"
                    id="onboardingGoal"
                    value={onboarding.financialGoal}
                    onChange={(e) => setOnboarding({ ...onboarding, financialGoal: e.target.value })}
                  >
                    <option value="Wealth Growth" className="bg-dark text-white">Wealth Growth & Investment</option>
                    <option value="Emergency Fund" className="bg-dark text-white">Build Emergency Savings</option>
                    <option value="Debt Reduction" className="bg-dark text-white">Accelerated Debt Payoff</option>
                    <option value="Home Purchase" className="bg-dark text-white">Saving for Real Estate</option>
                    <option value="Retirement" className="bg-dark text-white">Long-term Retirement Planning</option>
                  </select>
                  <label htmlFor="onboardingGoal" className="text-white-50"><Target size={16} className="me-2 d-inline" />Primary Financial Goal</label>
                </div>

                <div className="form-floating">
                  <input
                    type="number"
                    min="0"
                    step="100"
                    className="form-control bg-dark bg-opacity-50 text-white border-secondary"
                    id="onboardingIncome"
                    placeholder="5000"
                    value={onboarding.monthlyIncome}
                    onChange={(e) => setOnboarding({ ...onboarding, monthlyIncome: e.target.value })}
                  />
                  <label htmlFor="onboardingIncome" className="text-white-50"><DollarSign size={16} className="me-2 d-inline" />Monthly Net Income ($)</label>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-success btn-lg mt-2 fw-semibold d-flex justify-content-center align-items-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    boxShadow: "0 0 20px rgba(16, 185, 129, 0.4)",
                    border: "none",
                    transition: "all 0.3s ease"
                  }}
                >
                  {submitting ? (
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  ) : (
                    <>
                      Save & Enter Dashboard <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
