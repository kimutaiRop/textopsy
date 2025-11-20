'use client';

import Link from "next/link";
import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ResultsView } from "@/components/ResultsView";
import { UniversalInput } from "@/components/UniversalInput";
import { ConversationSidebar } from "@/components/ConversationSidebar";
import { AuthModal } from "@/components/AuthModal";
import { GenderModal } from "@/components/GenderModal";
import { IconArrowLeft, IconLogo, IconPlay, IconInfo, IconMessageSquare, IconClose, IconSearch } from "@/components/Icons";
import { ClarificationModal } from "@/components/ClarificationModal";
import { ContextViewModal } from "@/components/ContextViewModal";
import { applyClarificationAnswers } from "@/lib/contextUtils";
import { Persona, type ConversationContext, defaultConversationContext } from "@/types/analysis";
import type { AnalysisResult, UploadedImage, ClarificationQuestion, AnalysisInput } from "@/types/analysis";
import { useBillingLimits } from "@/hooks/useBillingLimits";
import type { StoredUser } from "@/types/user";
import { emitConversationListRefresh } from "@/lib/conversationEvents";

type Step = "loading" | "upload" | "analyzing" | "results";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("textopsy_session_id");
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("textopsy_session_id", sessionId);
  }
  return sessionId;
}

type ConversationData = {
  conversation: {
    id: string;
    title: string | null;
    createdAt: string;
    updatedAt: string;
    context: ConversationContext | null;
  };
  analyses: Array<{
    id: string;
    persona: string;
    inputType: string;
    inputText: string | null;
    inputImageBase64: string | null;
    inputImageMimeType: string | null;
    cringeScore: number;
    interestLevel: number;
    responseSpeedRating: string;
    redFlags: string[];
    greenFlags: string[];
    diagnosis: string;
    detailedAnalysis: string;
    suggestedReplies: any;
    createdAt: string;
  }>;
  inputs: Array<{
    id: string;
    inputType: string;
    inputText: string | null;
    inputImageBase64: string | null;
    inputImageMimeType: string | null;
    order: number;
    createdAt: string;
  }>;
  chatMessages?: Array<{
    id: string;
    role: "user" | "assistant";
    content: string;
    persona: string | null;
    createdAt: string;
  }>;
};

type ConversationClarification = {
  persona: Persona;
  input: AnalysisInput;
  questions: ClarificationQuestion[];
  contextSnapshot: ConversationContext;
  resetAnalyses?: boolean;
};

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;
  const [sessionId, setSessionId] = useState("");
  const [currentStep, setCurrentStep] = useState<Step>("loading");
  const [persona, setPersona] = useState<Persona>(Persona.BRUTAL_BESTIE);
  const [conversationContext, setConversationContext] = useState<ConversationContext>(defaultConversationContext);
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [textInput, setTextInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("textopsy_sidebar_open");
      return saved === "true";
    }
    return false;
  });
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [genderModalOpen, setGenderModalOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [previousResults, setPreviousResults] = useState<Array<AnalysisResult & { id?: string; persona: Persona; inputPreview: { type: "text"; content: string } | { type: "image"; url: string }; originalInput?: { type: "text"; content: string } | { type: "image"; base64: string; mimeType: string }; timestamp: Date }>>([]);
  const [reanalyzingId, setReanalyzingId] = useState<string | null>(null);
  const [isClarifying, setIsClarifying] = useState(false);
  const [clarificationRequest, setClarificationRequest] = useState<ConversationClarification | null>(null);
  const [clarificationSubmitting, setClarificationSubmitting] = useState(false);
  const [contextViewModalOpen, setContextViewModalOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; role: "user" | "assistant"; content: string; persona: string | null; createdAt: Date }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [isSendingChat, setIsSendingChat] = useState(false);
  const [inputMode, setInputMode] = useState<"analysis" | "chat">("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const skipNextContextPersistRef = useRef(false);
  const { limits, loading: limitsLoading, error: limitsError, refresh: refreshLimits, reset: resetLimits } =
    useBillingLimits(authToken);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  useEffect(() => {
    if (limits?.isPro) {
      setUpgradeError(null);
    }
  }, [limits?.isPro]);
  const applyServerContext = useCallback((ctx: ConversationContext | null) => {
    skipNextContextPersistRef.current = true;
    setConversationContext(ctx ? { ...defaultConversationContext, ...ctx } : defaultConversationContext);
  }, []);

  const getConversationHeaders = useCallback(
    (includeAuth = false) => {
      const headers: Record<string, string> = {};
      if (sessionId) {
        headers["X-Session-Id"] = sessionId;
      }
      if (includeAuth && authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }
      return headers;
    },
    [sessionId, authToken]
  );

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("textopsy_sidebar_open", sidebarOpen.toString());
    }
  }, [sidebarOpen]);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("textopsy_auth_token");
      const userStr = localStorage.getItem("textopsy_user");
      
      if (token && userStr) {
        try {
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

  // Load conversation data
  useEffect(() => {
    if (!conversationId || checkingAuth) return;

    const loadConversation = async () => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}`, {
          headers: getConversationHeaders(),
        });
        if (response.status === 401 || response.status === 403) {
          setError("You don't have access to this conversation.");
          setCurrentStep("upload");
          return;
        }
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Failed to load conversation:", response.status, errorData);
          throw new Error(errorData.error || `Failed to load conversation (${response.status})`);
        }

        const responseData = await response.json();
        console.log("Conversation data received:", responseData);
        
        // API returns { conversation: { ...conversation, analyses, inputs, chatMessages } }
        const data: ConversationData = {
          conversation: responseData.conversation,
          analyses: responseData.conversation?.analyses || [],
          inputs: responseData.conversation?.inputs || [],
          chatMessages: responseData.conversation?.chatMessages || [],
        };
        setConversationData(data);

        // Load chat messages
        if (data.chatMessages) {
          setChatMessages(
            data.chatMessages.map((msg) => ({
              id: msg.id,
              role: msg.role,
              content: msg.content,
              persona: msg.persona,
              createdAt: new Date(msg.createdAt),
            }))
          );
        }

        const ctxFromServer: ConversationContext | null = responseData.conversation?.context || null;
        applyServerContext(ctxFromServer);

        // Set persona from most recent analysis, or default
        if (data.analyses.length > 0) {
          const mostRecentAnalysis = data.analyses[0];
          const personaValue = mostRecentAnalysis.persona as Persona;
          if (Object.values(Persona).includes(personaValue)) {
            setPersona(personaValue);
          }
        }

        // Convert analyses to previous results format
        const results = data.analyses.map((analysis) => {
          const inputPreview = analysis.inputType === "image" && analysis.inputImageBase64
            ? { type: "image" as const, url: `data:${analysis.inputImageMimeType};base64,${analysis.inputImageBase64}` }
            : { type: "text" as const, content: analysis.inputText || "" };

          // Store original input for reanalysis
          const originalInput = analysis.inputType === "image" && analysis.inputImageBase64
            ? { type: "image" as const, base64: analysis.inputImageBase64, mimeType: analysis.inputImageMimeType || "image/png" }
            : { type: "text" as const, content: analysis.inputText || "" };

          return {
            id: analysis.id,
            cringeScore: analysis.cringeScore,
            interestLevel: analysis.interestLevel,
            responseSpeedRating: analysis.responseSpeedRating,
            redFlags: analysis.redFlags,
            greenFlags: analysis.greenFlags,
            diagnosis: analysis.diagnosis,
            detailedAnalysis: analysis.detailedAnalysis,
            suggestedReplies: analysis.suggestedReplies,
            persona: analysis.persona as Persona,
            inputPreview,
            originalInput,
            timestamp: new Date(analysis.createdAt),
          };
        });

        setPreviousResults(results);
        setCurrentStep("upload");
      } catch (err) {
        console.error("Failed to load conversation:", err);
        setError("Failed to load conversation");
        setCurrentStep("upload");
      }
    };

    loadConversation();
  }, [conversationId, checkingAuth, getConversationHeaders]);

  const submitConversationAnalysis = async (
    selectedPersona: Persona,
    input: AnalysisInput,
    options: { resetAnalyses?: boolean; contextOverride?: ConversationContext } = {}
  ) => {
    if (options.resetAnalyses) {
      await clearExistingAnalyses();
    }
    await performAnalysisWithData(selectedPersona, input, undefined, options.contextOverride);
  };

  const startConversationSubmission = async (
    selectedPersona: Persona,
    input: AnalysisInput,
    options: { resetAnalyses?: boolean; contextOverride?: ConversationContext } = {}
  ) => {
    if (!authToken) {
      setAuthModalOpen(true);
      return;
    }

    const snapshot = options.contextOverride ?? conversationContext;
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
          questions: clarification.questions,
          contextSnapshot: snapshot,
          resetAnalyses: options.resetAnalyses,
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

    await submitConversationAnalysis(selectedPersona, input, {
      resetAnalyses: options.resetAnalyses,
      contextOverride: snapshot,
    });
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
      await submitConversationAnalysis(clarificationRequest.persona, clarificationRequest.input, {
        resetAnalyses: clarificationRequest.resetAnalyses,
        contextOverride: updatedContext,
      });
    } finally {
      setClarificationSubmitting(false);
    }
  };

  const handleClarificationCancel = () => {
    setClarificationSubmitting(false);
    setClarificationRequest(null);
    setError("Need that context before we can analyze.");
  };

  // Auto-scroll to bottom when content changes or conversation loads
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [previousResults, conversationData, chatMessages]);

  useEffect(() => {
    if (!conversationId) return;
    if (skipNextContextPersistRef.current) {
      skipNextContextPersistRef.current = false;
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      fetch(`/api/conversations/${conversationId}`, {
        method: "PATCH",
        headers: {
          ...getConversationHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ context: conversationContext }),
        signal: controller.signal,
      }).catch((error) => {
        console.error("Failed to persist conversation context:", error);
      });
    }, 600);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [conversationContext, conversationId, getConversationHeaders]);

  // Handle deleting an analysis
  const handleDeleteAnalysis = async (analysisId: string) => {
    if (!authToken) {
      alert("Please log in to delete analyses");
      return;
    }

    if (!confirm("Are you sure you want to delete this analysis? This will also delete the associated input. This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/analyses/${analysisId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        // Remove from local state
        setPreviousResults((prev) => prev.filter((r) => r.id !== analysisId));
        
        // Reload conversation to ensure consistency
        const convResponse = await fetch(`/api/conversations/${conversationId}`, {
          headers: getConversationHeaders(),
        });
        if (convResponse.ok) {
          const responseData = await convResponse.json();
          const data: ConversationData = {
            conversation: responseData.conversation,
            analyses: responseData.conversation.analyses || [],
            inputs: responseData.conversation.inputs || [],
          };
          const results = data.analyses.map((a) => {
            const inputPreview = a.inputType === "image" && a.inputImageBase64
              ? { type: "image" as const, url: `data:${a.inputImageMimeType};base64,${a.inputImageBase64}` }
              : { type: "text" as const, content: a.inputText || "" };
            
            const originalInput = a.inputType === "image" && a.inputImageBase64
              ? { type: "image" as const, base64: a.inputImageBase64, mimeType: a.inputImageMimeType || "image/png" }
              : { type: "text" as const, content: a.inputText || "" };

            return {
              id: a.id,
              cringeScore: a.cringeScore,
              interestLevel: a.interestLevel,
              responseSpeedRating: a.responseSpeedRating,
              redFlags: a.redFlags,
              greenFlags: a.greenFlags,
              diagnosis: a.diagnosis,
              detailedAnalysis: a.detailedAnalysis,
              suggestedReplies: a.suggestedReplies,
              persona: a.persona as Persona,
              inputPreview,
              originalInput,
              timestamp: new Date(a.createdAt),
            };
          });
          setPreviousResults(results);
          applyServerContext(responseData.conversation?.context || null);
          emitConversationListRefresh();
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        alert(errorData.error || "Failed to delete analysis");
      }
    } catch (error) {
      console.error("Failed to delete analysis:", error);
      alert("Failed to delete analysis");
    }
  };

  const clearExistingAnalyses = useCallback(async () => {
    if (!authToken) {
      return;
    }
    const deletable = previousResults.filter((r) => r.id);
    if (deletable.length === 0) {
      return;
    }

    try {
      await Promise.all(
        deletable.map((result) =>
          fetch(`/api/analyses/${result.id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
        )
      );
      setPreviousResults([]);
    } catch (err) {
      console.error("Failed to delete existing analyses:", err);
    }
  }, [authToken, previousResults]);

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

  const performAnalysisWithData = async (
    selectedPersona: Persona,
    input: AnalysisInput,
    updateAnalysisId?: string,
    contextOverride?: ConversationContext
  ) => {
    if (!authToken) {
      setAuthModalOpen(true);
      return;
    }

    setCurrentStep("analyzing");
    setError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          persona: selectedPersona,
          input,
          conversationId,
          sessionId,
          updateAnalysisId, // If provided, update existing analysis instead of creating new
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
          setUpgradeError(limitMessage);
          refreshLimits();
          setReanalyzingId(null);
          setCurrentStep("upload");
          return;
        }
        throw new Error(errorData.error || `HTTP ${response.status}: Analysis failed`);
      }

      const analysis = (await response.json()) as AnalysisResult & {
        conversationId?: string;
        sessionId?: string;
      };
      
      // If updating existing analysis, update it in place
      if (updateAnalysisId) {
        // Update the specific analysis in the list and clear loading state
        setPreviousResults(prev => {
          // Find the existing result to preserve its timestamp
          const existingResult = prev.find(r => r.id === updateAnalysisId);
          const updatedResult = {
            id: updateAnalysisId,
            cringeScore: analysis.cringeScore,
            interestLevel: analysis.interestLevel,
            responseSpeedRating: analysis.responseSpeedRating,
            redFlags: analysis.redFlags,
            greenFlags: analysis.greenFlags,
            diagnosis: analysis.diagnosis,
            detailedAnalysis: analysis.detailedAnalysis,
            suggestedReplies: analysis.suggestedReplies,
            persona: selectedPersona,
            inputPreview: input.type === "image" 
              ? { type: "image" as const, url: `data:${input.mimeType};base64,${input.base64}` }
              : { type: "text" as const, content: input.content },
            originalInput: input,
            timestamp: existingResult?.timestamp || new Date(), // Preserve existing timestamp or use current date
          };
          return prev.map(r => r.id === updateAnalysisId ? updatedResult : r);
        });
        setReanalyzingId(null);
        setCurrentStep("upload");
      } else {
        // For new analysis, optimistically add it to the results immediately
        const inputPreview = input.type === "image" 
          ? { type: "image" as const, url: `data:${input.mimeType};base64,${input.base64}` }
          : { type: "text" as const, content: input.content };

        const newResult = {
          id: undefined, // Will be set from server data after reload
          cringeScore: analysis.cringeScore,
          interestLevel: analysis.interestLevel,
          responseSpeedRating: analysis.responseSpeedRating,
          redFlags: analysis.redFlags,
          greenFlags: analysis.greenFlags,
          diagnosis: analysis.diagnosis,
          detailedAnalysis: analysis.detailedAnalysis,
          suggestedReplies: analysis.suggestedReplies,
          persona: selectedPersona,
          inputPreview,
          originalInput: input,
          timestamp: new Date(),
        };

        // Add the new result immediately to prevent clearing
        setPreviousResults(prev => [...prev, newResult]);

        // Clear input and reset to upload step so compose box is always visible
        setImage(null);
        setTextInput("");
        setCurrentStep("upload");

        // Reload conversation to ensure consistency and get proper IDs/timestamps
        try {
        const convResponse = await fetch(`/api/conversations/${conversationId}`, {
          headers: getConversationHeaders(),
        });
        if (convResponse.ok) {
          const responseData = await convResponse.json();
          const data: ConversationData = {
            conversation: responseData.conversation,
            analyses: responseData.conversation.analyses || [],
            inputs: responseData.conversation.inputs || [],
          };
          const results = data.analyses.map((a) => {
            const inputPreview = a.inputType === "image" && a.inputImageBase64
              ? { type: "image" as const, url: `data:${a.inputImageMimeType};base64,${a.inputImageBase64}` }
              : { type: "text" as const, content: a.inputText || "" };
            
            const originalInput = a.inputType === "image" && a.inputImageBase64
              ? { type: "image" as const, base64: a.inputImageBase64, mimeType: a.inputImageMimeType || "image/png" }
              : { type: "text" as const, content: a.inputText || "" };

            return {
              id: a.id,
              cringeScore: a.cringeScore,
              interestLevel: a.interestLevel,
              responseSpeedRating: a.responseSpeedRating,
              redFlags: a.redFlags,
              greenFlags: a.greenFlags,
              diagnosis: a.diagnosis,
              detailedAnalysis: a.detailedAnalysis,
              suggestedReplies: a.suggestedReplies,
              persona: a.persona as Persona,
              inputPreview,
              originalInput,
              timestamp: new Date(a.createdAt),
            };
          });
            // Update with server data (will include proper IDs and timestamps)
          setPreviousResults(results);
          applyServerContext(responseData.conversation?.context || null);
          }
        } catch (reloadError) {
          console.error("Failed to reload conversation after analysis:", reloadError);
          // Keep the optimistic result even if reload fails
        }
      }
      refreshLimits();
      emitConversationListRefresh();
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Analysis error:", err);
      
      // Clear loading state if updating
      if (updateAnalysisId) {
        setReanalyzingId(null);
      }
      
      let errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      
      if (err instanceof DOMException && err.name === "AbortError") {
        errorMessage = "Analysis timed out. The request took too long.";
      }
      
      if (errorMessage.includes("Authentication required") || errorMessage.includes("Invalid or expired token")) {
        setAuthModalOpen(true);
        setError("Please log in to submit an analysis.");
      } else {
        setError(errorMessage || "Failed to analyze. Please try again.");
      }
      
      setCurrentStep("upload");
      setReanalyzingId(null);
    }
  };

  const performAnalysis = async (selectedPersona: Persona) => {
    if (!authToken) {
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

    await startConversationSubmission(selectedPersona, input, {
      resetAnalyses: false, // Changed default: don't replace old analyses
    });
  };

  const handleAnalyzeClick = () => performAnalysis(persona);
  const handleReanalyze = (newPersona: Persona, originalInput?: { type: "text"; content: string } | { type: "image"; base64: string; mimeType: string }, analysisId?: string) => {
    if (originalInput && analysisId) {
      // Set loading state for this specific analysis
      setReanalyzingId(analysisId);
      // Reanalyze with the original input from that analysis - update existing instead of creating new
      performAnalysisWithData(newPersona, originalInput, analysisId);
    } else if (originalInput) {
      // Reanalyze with the original input from that analysis
      performAnalysisWithData(newPersona, originalInput);
    } else {
      // Fallback to current input if no original input provided
      performAnalysis(newPersona);
    }
  };

  const handleReset = () => {
    setImage(null);
    setTextInput("");
    setCurrentStep("upload");
    setError(null);
  };

  const handleSendChatMessage = async (chatImage?: UploadedImage | null) => {
    if (!authToken) {
      setAuthModalOpen(true);
      return;
    }

    const messageText = chatInput.trim();
    const hasImage = chatImage !== null && chatImage !== undefined;

    if (!messageText && !hasImage) {
      return;
    }

    setIsSendingChat(true);
    setError(null);

    const messageToSend = messageText;
    const imageToSend = chatImage;
    setChatInput("");
    if (chatImage !== undefined) {
      setImage(null);
    }

    try {
      // For now, chat only supports text. Images can be sent as questions about them.
      // If image is provided, we'll send a message about it
      let finalMessage = messageToSend;
      if (hasImage && imageToSend) {
        if (messageToSend) {
          finalMessage = messageToSend; // User has text, just use that
        } else {
          finalMessage = "What do you think about this image?";
        }
      }

      const response = await fetch(`/api/conversations/${conversationId}/chat`, {
        method: "POST",
        headers: {
          ...getConversationHeaders(true),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: finalMessage,
          persona,
          conversationContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        if (response.status === 402) {
          const limitMessage = errorData.error || "Free plan limit reached. Upgrade to continue.";
          setError(limitMessage);
          setUpgradeError(limitMessage);
          refreshLimits();
          setChatInput(messageToSend);
          if (hasImage && imageToSend) {
            setImage(imageToSend);
          }
          setIsSendingChat(false);
          return;
        }
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to send message`);
      }

      const data = await response.json();

      // Add both messages to chat
      setChatMessages((prev) => [
        ...prev,
        {
          id: data.userMessage.id,
          role: "user",
          content: data.userMessage.content,
          persona: null,
          createdAt: new Date(data.userMessage.createdAt),
        },
        {
          id: data.assistantMessage.id,
          role: "assistant",
          content: data.assistantMessage.content,
          persona: data.assistantMessage.persona,
          createdAt: new Date(data.assistantMessage.createdAt),
        },
      ]);
      refreshLimits();
      emitConversationListRefresh();
    } catch (err) {
      console.error("Error sending chat message:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to send message.";
      setError(errorMessage);
      setChatInput(messageToSend); // Restore message on error
      if (hasImage && imageToSend) {
        setImage(imageToSend); // Restore image on error
      }
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleDeleteChatMessage = async (messageId: string) => {
    if (!authToken) {
      alert("Please log in to delete messages");
      return;
    }

    if (!confirm("Are you sure you want to delete this message? This cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/conversations/${conversationId}/chat/${messageId}`, {
        method: "DELETE",
        headers: getConversationHeaders(true),
      });

      if (response.ok) {
        // Remove from local state
        setChatMessages((prev) => prev.filter((m) => m.id !== messageId));
        emitConversationListRefresh();
      } else {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        alert(errorData.error || "Failed to delete message");
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
      alert("Failed to delete message");
    }
  };

  const handleSelectConversation = (id: string | null) => {
    if (id) {
      router.push(`/conversation/${id}`);
    } else {
      router.push("/");
    }
  };

  const handleUpgradeClick = useCallback(async () => {
    if (!authToken) {
      setAuthModalOpen(true);
      return;
    }

    setUpgradeError(null);
    setUpgradeLoading(true);

    try {
      const response = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Failed to start Paystack checkout.");
      }

      if (typeof window !== "undefined") {
        window.location.href = data.authorizationUrl;
      }
    } catch (error) {
      setUpgradeError(error instanceof Error ? error.message : "Failed to initiate checkout.");
    } finally {
      setUpgradeLoading(false);
    }
  }, [authToken]);

  const handleAuthSuccess = (token: string, userData: StoredUser) => {
    setAuthToken(token);
    setUser(userData);
    setAuthModalOpen(false);
    setUpgradeError(null);
    refreshLimits();
    
    // Show gender modal if gender is missing
    if (!userData.gender || userData.gender === "unknown") {
      setGenderModalOpen(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("textopsy_auth_token");
    localStorage.removeItem("textopsy_user");
    setAuthToken(null);
    setUser(null);
    resetLimits();
    setUpgradeError(null);
  };

  const isAnalyzingStep = currentStep === "analyzing";
  const billingError = upgradeError || limitsError || null;

  if (checkingAuth || currentStep === "loading") {
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
        currentConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className={`flex flex-1 flex-col transition-all ${sidebarOpen ? "ml-80" : ""}`}>
        <header className="sticky top-0 z-20 border-b border-gray-800 bg-[#0f172a] px-6 py-4">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
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
              <span className="rounded bg-[#b74bff]/20 px-2 py-1 text-xs text-[#b74bff]">
                Conversation
              </span>
              <button
                type="button"
                onClick={() => setContextViewModalOpen(true)}
                className="flex items-center gap-1.5 rounded border border-gray-700 bg-[#1e293b] px-2.5 py-1 text-xs text-gray-300 transition-colors hover:border-[#b74bff]/50 hover:bg-[#b74bff]/10 hover:text-[#b74bff]"
                title="View conversation context"
              >
                <IconInfo className="h-3.5 w-3.5" />
                <span>Context</span>
              </button>
            </div>
            <div className="flex items-center gap-4">
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

        <main className={`relative flex flex-1 flex-col ${sidebarOpen ? "ml-0" : ""}`}>
          {/* Scrollable chat area with previous analyses and chat messages */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto max-w-4xl space-y-6">
              {/* Combine chat messages and analyses, sorted by timestamp */}
              {[
                ...chatMessages.map((msg) => ({
                  type: "chat" as const,
                  id: msg.id,
                  timestamp: msg.createdAt,
                  data: msg,
                })),
                ...previousResults.map((result) => ({
                  type: "analysis" as const,
                  id: result.id || `analysis-${Date.now()}`,
                  timestamp: result.timestamp || new Date(),
                  data: result,
                })),
              ]
                .sort((a, b) => {
                  const timeA = a.timestamp?.getTime() || 0;
                  const timeB = b.timestamp?.getTime() || 0;
                  return timeA - timeB;
                })
                .map((item) => {
                  if (item.type === "chat") {
                    const msg = item.data as typeof chatMessages[0];
                    return (
                      <div
                        key={`chat-${msg.id}`}
                        className={`group relative flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`relative max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.role === "user"
                              ? "bg-[#b74bff] text-white"
                              : "bg-[#1e293b] border border-gray-800 text-gray-200"
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                          {msg.role === "assistant" && msg.persona && (
                            <p className="mt-1 text-[10px] text-gray-500">{msg.persona}</p>
                          )}
                          <button
                            onClick={() => handleDeleteChatMessage(msg.id)}
                            className="absolute -top-2 -right-2 rounded-full bg-red-600 p-1 opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
                            aria-label="Delete message"
                            title="Delete this message"
                          >
                            <IconClose className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    const result = item.data as typeof previousResults[0];
                    return (
                      <div key={`analysis-${result.id}`} className="rounded-lg border border-gray-800 bg-[#1e293b] p-6">
                    <ResultsView
                          result={result}
                          persona={result.persona}
                          inputPreview={result.inputPreview}
                      onReset={handleReset}
                          onReanalyze={(newPersona) => handleReanalyze(newPersona, result.originalInput, result.id)}
                          onDelete={result.id ? () => handleDeleteAnalysis(result.id!) : undefined}
                          showDelete={!!result.id}
                    />
                  </div>
                    );
                  }
                })}
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Always visible compose input at bottom */}
          <div className="sticky bottom-0 overflow-visible border-t border-gray-800 bg-[#0f172a] px-6 py-4">
            <div className="mx-auto max-w-4xl overflow-visible">
              {reanalyzingId ? (
                <div className="flex items-center justify-center gap-3 py-8">
                  <div className="relative h-8 w-8">
                    <div className="absolute inset-0 rounded-full border-2 border-gray-800" />
                    <div className="absolute inset-0 rounded-full border-2 border-t-[#b74bff] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                  </div>
                  <span className="text-sm text-gray-400">Reanalyzing with different persona...</span>
                </div>
              ) : (
                <div>
                  {/* Mode toggle - subtle design */}
                  <div className="mb-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setInputMode("chat")}
                      className={`rounded-full p-2 transition-all ${
                        inputMode === "chat"
                          ? "bg-[#b74bff]/20 text-[#b74bff]"
                          : "text-gray-500 hover:bg-gray-800/50 hover:text-gray-300"
                      }`}
                      title="Chat mode"
                    >
                      <IconMessageSquare className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setInputMode("analysis")}
                      className={`rounded-full p-2 transition-all ${
                        inputMode === "analysis"
                          ? "bg-[#b74bff]/20 text-[#b74bff]"
                          : "text-gray-500 hover:bg-gray-800/50 hover:text-gray-300"
                      }`}
                      title="Analysis mode"
                    >
                      <IconSearch className="h-4 w-4" />
                    </button>
                  </div>

                  {error && (
                    <div className="mb-3 flex items-center gap-2 rounded border border-red-900 bg-red-900/20 px-4 py-2 text-sm text-red-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      {error}
                    </div>
                  )}

                  {billingError && !limits?.isPro && (
                    <div className="mb-3 rounded border border-[#b74bff]/40 bg-[#b74bff]/5 px-4 py-3 text-sm text-gray-200">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">Upgrade to keep analyzing</p>
                          <p className="text-xs text-gray-300">
                            {billingError || "Looks like you hit the free tier limit. Upgrade for unlimited runs."}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleUpgradeClick}
                          disabled={upgradeLoading}
                          className="rounded border border-[#b74bff] px-3 py-1.5 text-xs font-semibold text-[#b74bff] transition-colors hover:bg-[#b74bff]/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {upgradeLoading ? "Opening checkout..." : "Upgrade plan"}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push("/plan")}
                        className="mt-2 text-[11px] uppercase tracking-widest text-[#b74bff]"
                      >
                        View plan & limits 
                      </button>
                    </div>
                  )}

                  {inputMode === "chat" ? (
                    <>
                      <UniversalInput 
                        text={chatInput} 
                        onTextChange={setChatInput} 
                        image={image} 
                        onImageSelect={handleFileSelected}
                        persona={persona}
                        onPersonaChange={setPersona}
                        conversationContext={conversationContext}
                        onConversationContextChange={setConversationContext}
                        onAnalyze={() => handleSendChatMessage(image)}
                        isAnalyzing={isSendingChat}
                        isClarifying={false}
                        error={null}
                        chatMode={true}
                      />
                      <div className="rounded-lg border border-slate-800/50 bg-slate-900/30 p-3">
                        <p className="text-xs text-slate-400">
                          <span className="font-medium text-slate-300">Privacy:</span> Your conversations are private. Administrators cannot access your messages or responses. Only aggregated analysis metrics are visible.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {currentStep === "upload" ? (
                        <>
                          <UniversalInput 
                            text={textInput} 
                            onTextChange={setTextInput} 
                            image={image} 
                            onImageSelect={handleFileSelected}
                            persona={persona}
                            onPersonaChange={setPersona}
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
                        </>
                      ) : currentStep === "analyzing" ? (
                        <div className="flex items-center justify-center gap-3 py-8">
                          <div className="relative h-8 w-8">
                            <div className="absolute inset-0 rounded-full border-2 border-gray-800" />
                            <div className="absolute inset-0 rounded-full border-2 border-t-[#b74bff] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
                          </div>
                          <span className="text-sm text-gray-400">Analyzing...</span>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
      <ClarificationModal
        isOpen={!!clarificationRequest}
        questions={clarificationRequest?.questions ?? []}
        onSubmit={handleClarificationSubmit}
        onCancel={handleClarificationCancel}
        isSubmitting={clarificationSubmitting}
        contextSnapshot={clarificationRequest?.contextSnapshot}
      />
      <ContextViewModal
        isOpen={contextViewModalOpen}
        context={conversationContext}
        onClose={() => setContextViewModalOpen(false)}
      />
    </div>
  );
}

