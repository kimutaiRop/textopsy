'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { IconArrowLeft, IconClose } from "./Icons";
import { onConversationListRefresh } from "@/lib/conversationEvents";

type Conversation = {
  id: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  analyses: Array<{ diagnosis: string }>;
  inputs: Array<{ inputType: string; inputText: string | null }>;
  _count: {
    analyses: number;
    inputs: number;
  };
};

type ConversationSidebarProps = {
  sessionId: string;
  currentConversationId: string | null;
  onSelectConversation: (id: string | null) => void;
  isOpen: boolean;
  onToggle: () => void;
};

export function ConversationSidebar({
  sessionId,
  currentConversationId,
  onSelectConversation,
  isOpen,
  onToggle,
}: ConversationSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const pendingRefreshRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!sessionId) {
      if (isMountedRef.current) {
        setConversations([]);
        setLoading(false);
      }
      return;
    }
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(`/api/conversations?sessionId=${sessionId}`, {
        signal: controller.signal,
      });
      if (response.ok) {
        const data = await response.json();
        if (isMountedRef.current) {
          setConversations(data.conversations || []);
        }
      } else if (isMountedRef.current) {
        setConversations([]);
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        console.warn("Conversations fetch timeout");
      } else {
        console.error("Failed to fetch conversations:", error);
      }
      if (isMountedRef.current) {
        setConversations([]);
      }
    } finally {
      clearTimeout(timeoutId);
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId || !isOpen) return;
    fetchConversations();
  }, [sessionId, isOpen, fetchConversations]);

  useEffect(() => {
    if (!isOpen || !pendingRefreshRef.current) {
      return;
    }
    pendingRefreshRef.current = false;
    fetchConversations();
  }, [isOpen, fetchConversations]);

  useEffect(() => {
    return onConversationListRefresh(() => {
      if (!sessionId) return;
      if (!isOpen) {
        pendingRefreshRef.current = true;
        return;
      }
      fetchConversations();
    });
  }, [sessionId, isOpen, fetchConversations]);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed left-4 top-20 z-30 rounded border border-gray-700 bg-[#1e293b] p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
      >
        <IconArrowLeft className="h-4 w-4 rotate-180" />
      </button>
    );
  }

  return (
    <div className="fixed left-0 top-0 z-30 h-full w-80 border-r border-gray-800 bg-[#0f172a]">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-gray-800 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Conversations</h2>
          <button
            onClick={onToggle}
            className="rounded p-1 text-gray-500 transition-colors hover:bg-gray-800 hover:text-white"
          >
            <IconArrowLeft className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No conversations yet</div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => {
                  router.push("/");
                  onSelectConversation(null);
                }}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  pathname === "/" || currentConversationId === null
                    ? "border-[#b74bff]/30 bg-[#151f35] text-white shadow-[0_0_16px_rgba(183,75,255,0.08)]"
                    : "border-transparent bg-[#141d30] text-gray-300 hover:border-gray-700/40 hover:bg-[#1b253d]"
                }`}
              >
                <div className="text-xs font-bold">+ New Analysis</div>
              </button>

              <button
                onClick={() => {
                  router.push("/plan");
                  onSelectConversation(null);
                }}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  pathname === "/plan"
                    ? "border-[#38bdf8]/30 bg-[#122036] text-white shadow-[0_0_16px_rgba(56,189,248,0.15)]"
                    : "border-transparent bg-[#141d30] text-gray-300 hover:border-gray-700/40 hover:bg-[#1b253d]"
                }`}
              >
                <div className="text-xs font-bold text-white">Plan & Limits</div>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-gray-500">Usage details & upgrades</p>
              </button>

              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group relative rounded-lg border p-3 transition-colors ${
                    pathname === `/conversation/${conv.id}` || currentConversationId === conv.id
                      ? "border-[#b74bff]/30 bg-[#151f35] shadow-[0_0_12px_rgba(183,75,255,0.08)]"
                      : "border-transparent bg-[#141d30] hover:border-gray-700/40 hover:bg-[#1b253d]"
                  }`}
                >
                  <button
                    onClick={() => {
                      router.push(`/conversation/${conv.id}`);
                      onSelectConversation(conv.id);
                    }}
                    className="w-full text-left"
                  >
                    <div className="mb-1 truncate text-xs font-bold text-white">
                    {conv.title || conv.analyses[0]?.diagnosis || "Untitled"}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {conv._count.analyses} analysis{conv._count.analyses !== 1 ? "es" : ""} •{" "}
                    {conv._count.inputs} input{conv._count.inputs !== 1 ? "s" : ""}
                  </div>
                  <div className="mt-1 text-[10px] text-gray-600">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                </button>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to delete this conversation?")) {
                        try {
                          const response = await fetch(`/api/conversations/${conv.id}`, {
                            method: "DELETE",
                            headers: {
                              "X-Session-Id": sessionId,
                            },
                          });
                          if (response.ok) {
                            // Remove from list
                            setConversations(prev => prev.filter(c => c.id !== conv.id));
                            // If this was the current conversation, navigate to home
                            if (currentConversationId === conv.id) {
                              router.push("/");
                              onSelectConversation(null);
                            }
                          } else {
                            alert("Failed to delete conversation");
                          }
                        } catch (error) {
                          console.error("Error deleting conversation:", error);
                          alert("Failed to delete conversation");
                        }
                      }
                    }}
                    className="absolute right-2 top-2 rounded p-1 text-gray-500 opacity-0 transition-opacity hover:bg-red-600/20 hover:text-red-400 group-hover:opacity-100"
                    title="Delete conversation"
                  >
                    <IconClose className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

