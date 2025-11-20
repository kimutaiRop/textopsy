'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PersonaSelector } from "@/components/PersonaSelector";
import { ResultsView } from "@/components/ResultsView";
import { UniversalInput } from "@/components/UniversalInput";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { AuthModal } from "@/components/AuthModal";
import { GenderModal } from "@/components/GenderModal";
import { IconArrowLeft, IconLogo, IconPlay } from "@/components/Icons";
import { ClarificationModal } from "@/components/ClarificationModal";
import { applyClarificationAnswers } from "@/lib/contextUtils";
import { Persona, type ConversationContext, defaultConversationContext } from "@/types/analysis";
import type { AnalysisResult, UploadedImage, ClarificationQuestion, AnalysisInput } from "@/types/analysis";
import type { StoredUser } from "@/types/user";
import { emitConversationListRefresh } from "@/lib/conversationEvents";

type Step = "upload" | "analyzing" | "results";

type PendingClarification = {
  persona: Persona;
  input: AnalysisInput;
  continueConversation?: boolean;
  conversationId?: string | null;
  contextSnapshot: ConversationContext;
  questions: ClarificationQuestion[];
};

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("textopsy_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("textopsy_session_id", sessionId);
  }
  return sessionId;
}

export default function HomePageClient() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const [currentStep, setCurrentStep] = useState<Step>("upload");
  const [persona, setPersona] = useState<Persona>(Persona.BRUTAL_BESTIE);
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [textInput, setTextInput] = useState("");
  const [result, setResult] = useState<AnalysisResult & { conversationId?: string; sessionId?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [conversationContext, setConversationContext] = useState<ConversationContext>(defaultConversationContext);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("textopsy_sidebar_open");
      return saved === "true";
    }
    return false;
  });

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("textopsy_sidebar_open", sidebarOpen.toString());
    }
  }, [sidebarOpen]);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [pendingSubmission, setPendingSubmission] = useState<{
    persona: Persona;
    continueConversation?: boolean;
    context: ConversationContext;
  } | null>(null);
  const [isClarifying, setIsClarifying] = useState(false);
  const [clarificationRequest, setClarificationRequest] = useState<PendingClarification | null>(null);
  const [clarificationSubmitting, setClarificationSubmitting] = useState(false);
  const [genderModalOpen, setGenderModalOpen] = useState(false);

  const handleFileSelected = (file: File | null) => {
    setError(null);
    if (!file) {
      setImage(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      setImage({
        base64,
        mimeType: file.type,
        previewUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  // Check authentication on mount and restore pending submission
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("textopsy_auth_token");
      const userStr = localStorage.getItem("textopsy_user");
      
      if (token && userStr) {
        try {
          // Verify token is still valid
          const response = await fetch("/api/auth/check", {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.authenticated) {
              setAuthToken(token);
              try {
                const storedUser: StoredUser | null =
                  data.user || (userStr ? (JSON.parse(userStr) as StoredUser) : null);
                if (storedUser) {
                  setUser(storedUser);
                  // Show gender modal if gender is missing
                  if (!storedUser.gender || storedUser.gender === "unknown") {
                    setGenderModalOpen(true);
                  }
                }
              } catch {
                const storedUser = data.user ?? null;
                setUser(storedUser);
                if (storedUser && (!storedUser.gender || storedUser.gender === "unknown")) {
                  setGenderModalOpen(true);
                }
              }
            } else {
              localStorage.removeItem("textopsy_auth_token");
              localStorage.removeItem("textopsy_user");
            }
          } else {
            localStorage.removeItem("textopsy_auth_token");
            localStorage.removeItem("textopsy_user");
          }
        } catch (err) {
          console.error("Auth check failed:", err);
          localStorage.removeItem("textopsy_auth_token");
          localStorage.removeItem("textopsy_user");
        }
      }
      setCheckingAuth(false);
    };
    
    checkAuth();
  }, []);

  // Restore pending form data and submission after auth
  useEffect(() => {
    if (authToken && !checkingAuth && pendingSubmission) {
      const pendingData = localStorage.getItem("textopsy_pending_form");
      if (pendingData) {
        try {
          const formData = JSON.parse(pendingData);
          
          // Restore form state
          if (formData.textInput !== undefined) {
            setTextInput(formData.textInput);
          }
          if (formData.image) {
            setImage(formData.image);
          }
          if (formData.persona) {
            setPersona(formData.persona);
          }
          if (formData.currentConversationId !== undefined) {
            setCurrentConversationId(formData.currentConversationId);
          }
          if (formData.conversationContext) {
            setConversationContext(formData.conversationContext);
          }
          
          // Clear pending data
          localStorage.removeItem("textopsy_pending_form");
          
          // Auto-submit after a small delay to ensure state is updated
          const submitTimeout = setTimeout(() => {
            const input = formData.image
              ? { type: "image" as const, base64: formData.image.base64, mimeType: formData.image.mimeType }
              : { type: "text" as const, content: formData.textInput || "" };

            initiateSubmission(pendingSubmission.persona, input, {
              continueConversation: pendingSubmission.continueConversation,
              conversationIdOverride: formData.currentConversationId || null,
              contextOverride: formData.conversationContext || defaultConversationContext,
            }).finally(() => setPendingSubmission(null));
          }, 200);
          
          return () => clearTimeout(submitTimeout);
        } catch (err) {
          console.error("Failed to restore pending form:", err);
          localStorage.removeItem("textopsy_pending_form");
          setPendingSubmission(null);
        }
      } else {
        // No pending data, clear pending submission
        setPendingSubmission(null);
      }
    }
  }, [authToken, checkingAuth, pendingSubmission]);

  // Internal function to perform analysis with explicit data
  const performAnalysisWithData = async (
    selectedPersona: Persona,
    input: AnalysisInput,
    conversationId: string | null,
    continueConversation?: boolean,
    contextOverride?: ConversationContext
  ) => {
    if (!authToken) {
      throw new Error("Authentication required");
    }

    setCurrentStep("analyzing");
    setError(null);

    // Setup abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

    try {
      const finalConversationId = continueConversation ? conversationId : null;

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          persona: selectedPersona,
          input,
          conversationId: finalConversationId,
          sessionId,
          context: contextOverride ?? conversationContext,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        if (response.status === 402) {
          const limitMessage = errorData.error || "Free plan limit reached. Upgrade to continue.";
          setError(limitMessage);
          setCurrentStep("upload");
          return;
        }
        throw new Error(errorData.error || `HTTP ${response.status}: Analysis failed`);
      }

      const analysis = (await response.json()) as AnalysisResult & {
        conversationId?: string;
        sessionId?: string;
      };
      setResult(analysis);
      setPersona(selectedPersona);
      emitConversationListRefresh();

      // Update conversation ID if returned and navigate to conversation page
      if (analysis.conversationId) {
        setCurrentConversationId(analysis.conversationId);
        // Navigate to conversation page
        router.push(`/conversation/${analysis.conversationId}`);
        return; // Don't show results on home page, let conversation page handle it
      }

      setCurrentStep("results");
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Analysis error:", err);
      
      let errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      
      if (err instanceof DOMException && err.name === "AbortError") {
        errorMessage = "Analysis timed out. The request took too long.";
      }
      
      // Show more specific error messages
      if (errorMessage.includes("Authentication required") || errorMessage.includes("Invalid or expired token")) {
        setAuthModalOpen(true);
        setError("Please log in to submit an analysis.");
      } else if (errorMessage.includes("API key") || errorMessage.includes("GOOGLE_GENAI_API_KEY") || errorMessage.includes("Gemini API key")) {
        setError("⚠️ Google Gemini API key not configured. Please set GOOGLE_GENAI_API_KEY in your .env.local file and restart the dev server.");
      } else if (errorMessage.includes("Gemini")) {
        setError(`Gemini API error: ${errorMessage}. Please check your connection and try again.`);
      } else {
        setError(errorMessage || "Failed to analyze. Is the conversation too short or unclear? Try again.");
      }
      
      setCurrentStep("upload");
    }
  };

  const initiateSubmission = async (
    selectedPersona: Persona,
    input: AnalysisInput,
    options: {
      continueConversation?: boolean;
      conversationIdOverride?: string | null;
      contextOverride?: ConversationContext;
    } = {}
  ) => {
    if (!authToken) {
      setAuthModalOpen(true);
      return;
    }

    const snapshot = options.contextOverride ?? conversationContext;
    const targetConversationId = options.conversationIdOverride ?? currentConversationId;

    setIsClarifying(true);
    try {
      const response = await fetch("/api/analyze/clarify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          persona: selectedPersona,
          input,
          context: snapshot,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setAuthModalOpen(true);
        }
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}: Clarification check failed`);
      }

      const clarification = (await response.json()) as {
        clarificationNeeded: boolean;
        questions?: ClarificationQuestion[];
      };

      if (clarification.clarificationNeeded && clarification.questions && clarification.questions.length > 0) {
        setClarificationRequest({
          persona: selectedPersona,
          input,
          continueConversation: options.continueConversation,
          conversationId: targetConversationId,
          contextSnapshot: snapshot,
          questions: clarification.questions,
        });
        return;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to check clarifications.";
      if (errorMessage.toLowerCase().includes("auth")) {
        setError("Please log in to submit an analysis.");
      } else {
        setError(errorMessage || "Failed to prepare analysis.");
      }
      setCurrentStep("upload");
      return;
    } finally {
      setIsClarifying(false);
    }

    await performAnalysisWithData(
      selectedPersona,
      input,
      targetConversationId,
      options.continueConversation,
      snapshot
    );
  };

  const handleClarificationSubmit = async (answers: Record<string, string>) => {
    if (!clarificationRequest) return;
    setClarificationSubmitting(true);

    const updatedContext = applyClarificationAnswers(
      clarificationRequest.contextSnapshot,
      clarificationRequest.questions,
      answers
    );
    setConversationContext(updatedContext);
    setClarificationRequest(null);

    try {
      await performAnalysisWithData(
        clarificationRequest.persona,
        clarificationRequest.input,
        clarificationRequest.conversationId ?? currentConversationId,
        clarificationRequest.continueConversation,
        updatedContext
      );
    } finally {
      setClarificationSubmitting(false);
    }
  };

  const handleClarificationCancel = () => {
    setClarificationSubmitting(false);
    setClarificationRequest(null);
    setError("We need that context to run the analysis. Try again when you're ready.");
  };

  const performAnalysis = async (selectedPersona: Persona, continueConversation?: boolean) => {
    console.log("Analysis requested", { selectedPersona, hasImage: !!image, textLength: textInput.length });
    
    // Check authentication before submitting
    if (!authToken) {
      // Store form data in localStorage before showing login
      const formData = {
        textInput,
        image,
        persona: selectedPersona,
        currentConversationId,
        continueConversation,
        conversationContext,
      };
      localStorage.setItem("textopsy_pending_form", JSON.stringify(formData));
      
      // Store pending submission info
      setPendingSubmission({
        persona: selectedPersona,
        continueConversation,
        context: conversationContext,
      });
      
      setAuthModalOpen(true);
      return;
    }
    
    if (!image && !textInput.trim()) {
      setError("Please input text or upload a screenshot.");
      return;
    }

    setError(null);

    const input = image
      ? { type: "image" as const, base64: image.base64, mimeType: image.mimeType }
      : { type: "text" as const, content: textInput };

    await initiateSubmission(selectedPersona, input, {
      continueConversation,
    });
  };

  const handleAnalyzeClick = () => performAnalysis(persona, false);
  const handleContinueConversation = () => performAnalysis(persona, true);
  const handleReanalyze = (newPersona: Persona) => performAnalysis(newPersona, !!currentConversationId);

  const handleReset = () => {
    setImage(null);
    setTextInput("");
    setResult(null);
    setCurrentConversationId(null);
    setCurrentStep("upload");
    setError(null);
  };

  const handleSelectConversation = (id: string | null) => {
    if (id) {
      router.push(`/conversation/${id}`);
    } else {
      router.push("/");
    }
  };

  // Load conversation when selected
  useEffect(() => {
    if (currentConversationId) {
      // Optionally load conversation data here
      // For now, we'll just indicate it's selected
    }
  }, [currentConversationId]);

  const handleAuthSuccess = (token: string, userData: StoredUser) => {
    setAuthToken(token);
    setUser(userData);
    setAuthModalOpen(false);
    
    // Show gender modal if gender is missing
    if (!userData.gender || userData.gender === "unknown") {
      setGenderModalOpen(true);
    }
    
    // The useEffect will handle restoring form data and auto-submitting
  };

  const handleLogout = () => {
    localStorage.removeItem("textopsy_auth_token");
    localStorage.removeItem("textopsy_user");
    setAuthToken(null);
    setUser(null);
  };

  const isAnalyzingStep = currentStep === "analyzing";

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
        <div className="text-center">
          <div className="relative mb-4 h-12 w-12 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#b74bff] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0f172a] text-slate-100">
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      <GenderModal
        isOpen={genderModalOpen}
        onClose={() => setGenderModalOpen(false)}
        onSave={(updatedUser) => {
          setUser(updatedUser);
          setGenderModalOpen(false);
        }}
        authToken={authToken}
      />
      
      <ConversationSidebar
        sessionId={sessionId}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className={`flex flex-1 flex-col transition-all ${sidebarOpen ? "ml-80" : ""}`}>
        <header className="sticky top-0 z-20 border-b border-gray-800 bg-[#0f172a] px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="rounded border border-gray-800 p-1.5 text-gray-400 transition-colors hover:border-gray-700 hover:text-white"
                aria-label="Toggle sidebar"
              >
                <IconArrowLeft
                  className={`h-4 w-4 transition-transform ${sidebarOpen ? "" : "rotate-180"}`}
                />
              </button>
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-100 transition-colors hover:text-white"
              >
                <IconLogo className="h-5 w-5 text-[#b74bff]" />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-white">Textopsy</p>
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gray-500">
                    Message autopsy
                  </p>
                </div>
              </Link>
              {currentConversationId && (
                <span className="rounded bg-[#b74bff]/20 px-2 py-1 text-xs text-[#b74bff]">
                  Continuing conversation
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-2 border border-gray-800 px-3 py-1 text-[10px] font-mono uppercase tracking-widest text-gray-500 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>System online</span>
              </div>
              <button
                type="button"
                onClick={() => router.push("/plan")}
                className="rounded border border-gray-700 px-3 py-1.5 text-xs uppercase tracking-widest text-gray-400 transition-colors hover:border-gray-600 hover:text-white"
              >
                Plan
              </button>
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="hidden text-sm text-gray-400 sm:inline">{user.email}</span>
                  <button
                    onClick={handleLogout}
                    className="rounded border border-gray-700 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-gray-600 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="rounded border border-[#b74bff] px-4 py-2 text-sm font-medium text-[#b74bff] transition-colors hover:bg-[#b74bff]/10"
                >
                  Log In
                </button>
              )}
            </div>
          </div>
        </header>

        <main className={`relative flex flex-grow flex-col p-6 ${currentStep === "results" ? "" : "items-center justify-center"}`}>
        {currentStep === "upload" && (
          <div className="relative z-10 w-full max-w-4xl animate-in fade-in">
            <div className="mb-12 space-y-4 text-center">
              <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                Decode the <span className="text-[#b74bff]">subtext.</span>
              </h1>
              <p className="mx-auto max-w-lg text-lg leading-relaxed text-gray-400">
                Analysis for your confusing text threads.
                <br className="hidden md:block" />
                Find out if you&apos;re being ghosted, gaslit, or loved.
              </p>
            </div>

            <div className="space-y-8">
              <PersonaSelector selectedPersona={persona} onSelect={setPersona} />
              
              <UniversalInput
                text={textInput}
                onTextChange={setTextInput}
                image={image}
                onImageSelect={handleFileSelected}
                conversationContext={conversationContext}
                onConversationContextChange={setConversationContext}
                onAnalyze={handleAnalyzeClick}
                isAnalyzing={isAnalyzingStep}
                isClarifying={isClarifying}
                error={error}
              />

              <div className="rounded-lg border border-slate-800/50 bg-slate-900/30 p-3">
                <p className="text-xs text-slate-400">
                  <span className="font-medium text-slate-300">Privacy:</span> Your conversations are private. Administrators cannot access your messages or responses. Only aggregated analysis metrics are visible.
                </p>
              </div>

              {currentConversationId && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleContinueConversation}
                    disabled={(!image && !textInput.trim()) || isAnalyzingStep || isClarifying}
                    className={`rounded border-2 px-6 py-2.5 text-sm font-bold transition-colors ${
                      (!image && !textInput.trim()) || isAnalyzingStep || isClarifying
                        ? "cursor-not-allowed border-gray-800 bg-gray-900 text-gray-700"
                        : "border-[#b74bff] bg-[#b74bff] text-white hover:bg-[#a03de8]"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Add to Conversation
                      <IconPlay className="h-3.5 w-3.5" />
                    </span>
                  </button>
                  </div>
                )}
            </div>
          </div>
        )}

        {currentStep === "analyzing" && (
          <div className="z-10 flex flex-col items-center text-center">
            <div className="relative mb-8 h-20 w-20">
              <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#b74bff] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-white">
              {isClarifying ? "Checking details..." : "Analyzing..."}
            </h2>
            <p className="font-mono text-sm text-gray-500">
              {isClarifying
                ? "Gathering context for accurate analysis..."
                : persona === Persona.BRUTAL_BESTIE && "Preparing to hurt your feelings..."}
              {!isClarifying && persona === Persona.THERAPIST && "Reviewing attachment patterns..."}
              {!isClarifying && persona === Persona.TOXIC_EX && "Thinking about myself..."}
              {!isClarifying && persona === Persona.FBI_PROFILER && "Building psychological profile..."}
              {!isClarifying && persona === Persona.GEN_Z_ROASTER && "Calculating cringe levels..."}
            </p>
          </div>
        )}

        {currentStep === "results" && result && (
          <ResultsView
            result={result}
            persona={persona}
            inputPreview={image ? { type: "image", url: image.previewUrl } : { type: "text", content: textInput }}
            onReset={handleReset}
            onReanalyze={handleReanalyze}
          />
        )}
        </main>

        <footer className="border-t border-gray-800 p-6 text-center text-xs text-gray-700">
          <p>Textopsy v1.2 &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
      <ClarificationModal
        isOpen={!!clarificationRequest}
        questions={clarificationRequest?.questions ?? []}
        onSubmit={handleClarificationSubmit}
        onCancel={handleClarificationCancel}
        isSubmitting={clarificationSubmitting}
        contextSnapshot={clarificationRequest?.contextSnapshot}
      />
    </div>
  );
}

