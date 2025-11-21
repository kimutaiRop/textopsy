'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { IconLogo } from "@/components/Icons";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const messageParam = searchParams.get("message");

    if (statusParam === "success" || statusParam === "error") {
      setStatus(statusParam);
    }

    if (messageParam) {
      setMessage(decodeURIComponent(messageParam));
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f172a] px-4">
      <div className="w-full max-w-md rounded-lg border border-gray-800 bg-[#0b1324] p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-center gap-3">
          <IconLogo className="h-8 w-8 text-[#b74bff]" />
          <h1 className="text-2xl font-bold text-white">Email Verification</h1>
        </div>

        {status === "success" ? (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
                <svg
                  className="h-8 w-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-white">Email Verified!</h2>
            <p className="mb-6 text-gray-400">
              {message || "Your email has been successfully verified."}
            </p>
            <p className="text-sm text-gray-500">
              Redirecting you to the home page in 3 seconds...
            </p>
            <Link
              href="/"
              className="mt-4 inline-block rounded border-2 border-white bg-white px-6 py-3 font-bold text-black transition-colors hover:bg-gray-200"
            >
              Go to Home
            </Link>
          </div>
        ) : status === "error" ? (
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <svg
                  className="h-8 w-8 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-white">Verification Failed</h2>
            <p className="mb-6 text-gray-400">
              {message || "The verification link is invalid or has expired."}
            </p>
            <div className="flex gap-3">
              <Link
                href="/"
                className="flex-1 rounded border border-gray-700 bg-gray-900 px-4 py-2 text-center font-semibold text-gray-300 transition-colors hover:bg-gray-800"
              >
                Go to Home
              </Link>
              <button
                onClick={() => router.push("/?show-auth=register")}
                className="flex-1 rounded border-2 border-white bg-white px-4 py-2 font-bold text-black transition-colors hover:bg-gray-200"
              >
                Sign Up Again
              </button>
            </div>
          </div>
        ) : (
          <VerifyEmailLoading />
        )}
      </div>
    </div>
  );
}

function VerifyEmailLoading() {
  return (
    <div className="text-center">
      <div className="mb-4 flex justify-center">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#b74bff] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
      </div>
      <p className="text-gray-400">Processing verification...</p>
    </div>
  );
}

