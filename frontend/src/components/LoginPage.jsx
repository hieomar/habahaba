"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/auth/authContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const result = await login(email, password);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Invalid email or password. Please try again.");
        setIsLoading(false);
      }
    } catch (err) {
      setError(err?.message || "Unable to sign in right now.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">

      {/* ── Left panel: Logo only ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-8 px-16">
          {/* Logo — large, centered */}
          <Image
            src="/branding/nasfam-logo.png"
            alt="NASFAM"
            width={160}
            height={160}
            priority
            className="object-contain"
            style={{ width: "auto", height: "auto" }}
          />
          {/* System name only */}
          <p className="text-[#113a1a] text-base font-semibold tracking-wide text-center leading-relaxed">
            Grain Traceability Management System
          </p>
        </div>
      </div>

      {/* ── Right panel: Login form ───────────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#113a1a] px-6 py-12">
        <div className="w-full max-w-[400px]">

          {/* Mobile branding */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="bg-white border border-gray-200 p-2 rounded-lg">
              <Image src="/branding/nasfam-logo.png" alt="NASFAM" width={36} height={36} priority className="object-contain" style={{ width: "auto", height: "auto" }} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">NASFAM</p>
              <p className="text-[10px] text-gray-300 mt-0.5">Grain Traceability Management System</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-sm text-gray-300 mt-1.5">Sign in to continue to your dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-700 font-medium leading-snug">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-200 mb-1.5">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="name@nasfam.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg outline-none focus:border-gray-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="text-sm font-semibold text-gray-200">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder={password ? "" : "••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2.5 pr-10 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg outline-none focus:border-gray-500 transition-colors disabled:bg-gray-50 disabled:text-gray-400"
                />
                {password && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-4.753 4.753m7.538 12.16A11.895 11.895 0 0112 19c-4.478 0-8.268-2.943-9.543-7a10.02 10.02 0 012.82-4.5m7.723 2.34a9.003 9.003 0 002.922-4.5M3 3l3.6 3.6m0 0L3 3m3.6 3.6L3 3" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 accent-[#1a5c2a] rounded border-gray-300 cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-gray-200 cursor-pointer select-none">
                Remember me
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-lg transition-colors
                ${isLoading ? "bg-white/70 text-gray-500 cursor-not-allowed" : "bg-white text-[#113a1a] hover:bg-gray-100"}`}
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
