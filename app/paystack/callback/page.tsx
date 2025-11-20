'use client';

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function PaystackCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Finalizing your payment...");

  useEffect(() => {
    const reference = searchParams.get("reference");
    if (!reference) {
      setStatus("error");
      setMessage("Missing payment reference. Please try again.");
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("textopsy_auth_token") : null;
    if (!token) {
      setStatus("error");
      setMessage("Please log in before finishing checkout.");
      return;
    }

    const controller = new AbortController();

    const verifyPayment = async () => {
      try {
        const response = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reference }),
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || "Payment verification failed.");
        }

        setStatus("success");
        setMessage("Payment verified! Redirecting you back to Textopsy...");
        setTimeout(() => router.push("/"), 2000);
      } catch (error) {
        console.error("Paystack verification failed:", error);
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Payment verification failed.");
      }
    };

    verifyPayment();
    return () => controller.abort();
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] text-center text-gray-100">
      <div className="w-full max-w-md rounded-xl border border-gray-800 bg-[#0b1324] p-8 shadow-2xl">
        <div className="mb-4 text-sm font-mono uppercase tracking-widest text-gray-500">
          Paystack Checkout
        </div>
        <div className="mb-6">
          <div className="text-2xl font-bold">
            {status === "verifying" && "Hold on..."}
            {status === "success" && "You're Pro now!"}
            {status === "error" && "Verification failed"}
          </div>
          <p className="mt-4 text-sm text-gray-400">{message}</p>
        </div>
        {status === "error" && (
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full rounded-lg border border-[#b74bff] px-4 py-2 text-sm font-semibold text-[#b74bff] transition-colors hover:bg-[#b74bff]/10"
          >
            Back to app
          </button>
        )}
      </div>
    </div>
  );
}

export default function PaystackCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] text-center text-gray-100">
          <div className="w-full max-w-md rounded-xl border border-gray-800 bg-[#0b1324] p-8 shadow-2xl">
            <div className="mb-4 text-sm font-mono uppercase tracking-widest text-gray-500">Paystack Checkout</div>
            <div className="text-2xl font-bold">Loading...</div>
          </div>
        </div>
      }
    >
      <PaystackCallbackContent />
    </Suspense>
  );
}

