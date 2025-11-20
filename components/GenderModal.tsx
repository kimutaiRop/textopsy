'use client';

import { useState } from "react";
import { IconLogo } from "./Icons";
import { GenderOption } from "@/types/analysis";
import { genderOptions } from "@/lib/contextOptions";
import type { StoredUser } from "@/types/user";

interface GenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: StoredUser) => void;
  authToken: string | null;
}

export function GenderModal({ isOpen, onClose, onSave, authToken }: GenderModalProps) {
  const [gender, setGender] = useState<GenderOption | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) {
      setError("Authentication required");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/user/gender", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ gender: gender || null }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to save gender");
        setLoading(false);
        return;
      }

      // Update stored user in localStorage
      const userStr = localStorage.getItem("textopsy_user");
      if (userStr) {
        try {
          const user: StoredUser = JSON.parse(userStr);
          user.gender = gender || null;
          localStorage.setItem("textopsy_user", JSON.stringify(user));
          onSave(user);
        } catch {
          // Ignore parse errors
        }
      }

      onClose();
      setGender("");
      setLoading(false);
    } catch (err) {
      console.error("Gender update error:", err);
      setError(err instanceof Error ? err.message : "Failed to save gender");
      setLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleSkip();
        }
      }}
    >
      <div 
        className="relative w-full max-w-md rounded-lg border border-gray-800 bg-[#0f172a] p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center gap-3">
          <IconLogo className="h-8 w-8 text-[#b74bff]" />
          <h2 className="text-2xl font-bold text-white">
            Tell us about yourself
          </h2>
        </div>

        <p className="mb-6 text-sm text-gray-400">
          Help us personalize your analysis by sharing your gender. This information will be used automatically in future conversations.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="gender" className="mb-2 block text-sm font-medium text-gray-300">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as GenderOption | "")}
              className="w-full rounded border border-gray-700 bg-gray-900 px-4 py-2 text-white focus:border-[#b74bff] focus:outline-none focus:ring-1 focus:ring-[#b74bff]"
            >
              <option value="">Select gender</option>
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

          {error && (
            <div className="rounded border border-red-900 bg-red-900/20 px-4 py-2 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="flex-1 rounded border border-gray-700 bg-gray-900 px-6 py-3 font-semibold text-gray-300 transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={loading || !gender}
              className="flex-1 rounded border-2 border-white bg-white px-6 py-3 font-bold text-black transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

