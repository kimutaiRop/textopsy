'use client';

import { useState } from "react";
import { IconLogo } from "./Icons";
import type { StoredUser } from "@/types/user";
import { GenderOption } from "@/types/analysis";
import { genderOptions } from "@/lib/contextOptions";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string, user: StoredUser) => void;
}

export function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<GenderOption | "">("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body = mode === "register" 
        ? { email, password, gender: gender || undefined }
        : { email, password };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        // Don't close modal on error - just show the error message
        setError(data.error || "Authentication failed");
        setLoading(false);
        return;
      }

      // Only close modal on successful authentication
      // Store token in localStorage
      localStorage.setItem("textopsy_auth_token", data.token);
      localStorage.setItem("textopsy_user", JSON.stringify(data.user));

      onAuthSuccess(data.token, data.user);
      onClose();
      setEmail("");
      setPassword("");
      setGender("");
      setLoading(false);
    } catch (err) {
      // Network errors or JSON parsing errors
      console.error("Auth error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={(e) => {
        // Only close if clicking the background, not the modal content
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="relative w-full max-w-md rounded-lg border border-gray-800 bg-[#0f172a] p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-white"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-6 flex items-center gap-3">
          <IconLogo className="h-8 w-8 text-[#b74bff]" />
          <h2 className="text-2xl font-bold text-white">
            {mode === "login" ? "Log In" : "Create Account"}
          </h2>
        </div>

        <p className="mb-6 text-sm text-gray-400">
          {mode === "login"
            ? "Log in to submit an analysis"
            : "Create an account to get started"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:border-[#b74bff] focus:outline-none focus:ring-1 focus:ring-[#b74bff]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded border border-gray-700 bg-gray-900 px-4 py-2 text-white placeholder-gray-500 focus:border-[#b74bff] focus:outline-none focus:ring-1 focus:ring-[#b74bff]"
              placeholder="••••••"
            />
            {mode === "register" && (
              <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
            )}
          </div>

          {mode === "register" && (
            <div>
              <label htmlFor="gender" className="mb-2 block text-sm font-medium text-gray-300">
                Gender <span className="text-xs text-gray-500">(optional)</span>
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as GenderOption | "")}
                className="w-full rounded border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-[#b74bff] focus:outline-none focus:ring-1 focus:ring-[#b74bff]"
              >
                <option value="">Select gender (optional)</option>
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                This helps us personalize your analysis. You can skip this if you prefer.
              </p>
            </div>
          )}

          {error && (
            <div className="rounded border border-red-900 bg-red-900/20 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded border-2 border-white bg-white px-6 py-3 font-bold text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setMode("register");
                  setError(null);
                  setGender("");
                }}
                className="text-[#b74bff] hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setGender("");
                }}
                className="text-[#b74bff] hover:underline"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

