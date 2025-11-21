'use client';

import { useCallback, useRef, useState, useEffect, type ClipboardEvent, type DragEvent, type ChangeEvent, type ReactNode } from "react";
import type { UploadedImage, ConversationContext } from "@/types/analysis";
import { Persona } from "@/types/analysis";
import { IconCamera, IconClose, IconUpload, IconBrutal, IconFBI, IconRoaster, IconTherapist, IconToxic, IconChevronDown, IconPlay, IconMessageSquare, IconCharismatic } from "./Icons";

type UniversalInputProps = {
  text: string;
  onTextChange: (value: string) => void;
  image: UploadedImage | null;
  onImageSelect: (file: File | null) => void;
  persona?: Persona;
  onPersonaChange?: (persona: Persona) => void;
  onAnalyze?: () => void;
  isAnalyzing?: boolean;
  isClarifying?: boolean;
  error?: string | null;
  conversationContext?: ConversationContext;
  onConversationContextChange?: (context: ConversationContext) => void;
  chatMode?: boolean; // If true, shows "Send" instead of "Analyze"
};

const personaIcons: Record<Persona, ReactNode> = {
  [Persona.BRUTAL_BESTIE]: <IconBrutal className="h-4 w-4" />,
  [Persona.THERAPIST]: <IconTherapist className="h-4 w-4" />,
  [Persona.TOXIC_EX]: <IconToxic className="h-4 w-4" />,
  [Persona.FBI_PROFILER]: <IconFBI className="h-4 w-4" />,
  [Persona.GEN_Z_ROASTER]: <IconRoaster className="h-4 w-4" />,
  [Persona.CHARISMATIC_FLIRT]: <IconCharismatic className="h-4 w-4" />,
};

export function UniversalInput({
  text,
  onTextChange,
  image,
  onImageSelect,
  persona,
  onPersonaChange,
  onAnalyze,
  isAnalyzing = false,
  isClarifying = false,
  error,
  conversationContext,
  onConversationContextChange,
  chatMode = false,
}: UniversalInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const personaMenuRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const hasContent = !!text.trim() || !!image;
  const isExpanded = !isMobile || isFocused || hasInteracted || hasContent;

  useEffect(() => {
    if (hasContent) {
      setHasInteracted(true);
    }
  }, [hasContent]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const minHeight = isExpanded ? 160 : 100;
      const maxHeight = isMobile ? 320 : 400;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollHeight, minHeight), maxHeight)}px`;
    }
  }, [text, isExpanded, isMobile]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (personaMenuRef.current && !personaMenuRef.current.contains(event.target as Node)) {
        setPersonaMenuOpen(false);
      }
    };
    if (personaMenuOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [personaMenuOpen]);

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const files = event.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          onImageSelect(file);
        }
      }
    },
    [onImageSelect],
  );

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onImageSelect(event.target.files[0]);
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    if (event.clipboardData.files && event.clipboardData.files.length > 0) {
      const file = event.clipboardData.files[0];
      if (file.type.startsWith("image/")) {
        event.preventDefault();
        onImageSelect(file);
      }
    }
  };

  const isSubmitDisabled = (!image && !text.trim()) || isAnalyzing || isClarifying;

  return (
    <div className="mx-auto mb-6 w-full space-y-4 sm:mb-8">
      <div
        className={`relative ${personaMenuOpen ? "overflow-visible" : "overflow-hidden"} rounded border-2 bg-[#1e293b] transition-colors duration-200 ${isDragging
            ? "border-[#b74bff] bg-[rgba(183,75,255,0.05)]"
            : image || text.trim()
              ? "border-[#b74bff]"
              : "border-gray-700 hover:border-gray-600 focus-within:border-gray-500"
          }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className={`relative flex flex-col ${isExpanded ? "min-h-[160px]" : "min-h-[100px]"} sm:min-h-[160px]`}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            onPaste={handlePaste}
            onFocus={() => {
              setIsFocused(true);
              setHasInteracted(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={chatMode ? "Ask a question or share an image...\n\nOr drop a screenshot." : "Paste conversation here...\n\nOr drop a screenshot."}
            className="w-full resize-none overflow-hidden bg-transparent p-4 pb-20 font-mono text-sm leading-relaxed text-gray-200 placeholder:text-gray-600 focus:outline-none"
            spellCheck={false}
            style={{
              minHeight: isExpanded ? "160px" : "100px",
              maxHeight: isMobile ? "320px" : "400px",
            }}
          />


          {/* Bottom bar with controls */}
          <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between border-t border-gray-800 bg-[#1e293b] p-2">
            <div className="flex items-center gap-2">
              {/* Tiny image preview at bottom left */}
              {image && (
                <div className="relative group">
                  <div className="rounded border border-[#b74bff] bg-gray-900 p-0.5">
                    <img
                      src={image.previewUrl}
                      alt="Attached"
                      className="h-8 w-8 object-cover rounded"
                    />
                  </div>
                  <button
                    onClick={() => onImageSelect(null)}
                    className="absolute -top-1 -right-1 rounded-full bg-red-600 p-0.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500"
                    aria-label="Remove image"
                  >
                    <IconClose className="h-2 w-2" />
                  </button>
                </div>
              )}

              <span
                className={`font-mono text-[10px] transition-opacity duration-300 ${text.length > 0 ? "text-gray-500" : "opacity-0"
                  }`}
              >
                {text.length} CHARS
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Persona Selector Dropdown */}
              {persona && onPersonaChange && (
                <div className="relative z-50" ref={personaMenuRef}>
                  <button
                    onClick={() => setPersonaMenuOpen(!personaMenuOpen)}
                    className="flex items-center gap-1.5 rounded border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-gray-600 hover:bg-gray-700 hover:text-white"
                  >
                    <span className="text-[#b74bff]">{personaIcons[persona]}</span>
                    <span className="hidden sm:inline text-[10px]">{persona}</span>
                    <IconChevronDown className={`h-3 w-3 transition-transform ${personaMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {personaMenuOpen && (
                    <div className="absolute bottom-full right-0 mb-2 z-50 w-56 overflow-hidden rounded-lg border border-gray-800 bg-[#1e293b] shadow-xl">
                      <div className="border-b border-gray-800 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Analyst Persona
                      </div>
                      {Object.values(Persona).map((p) => (
                        <button
                          key={p}
                          onClick={() => {
                            onPersonaChange(p);
                            setPersonaMenuOpen(false);
                          }}
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left text-xs transition-colors ${p === persona
                              ? "bg-[#b74bff]/10 text-[#b74bff]"
                              : "text-gray-300 hover:bg-gray-800"
                            }`}
                        >
                          <span className={p === persona ? "text-[#b74bff]" : "text-gray-500"}>
                            {personaIcons[p]}
                          </span>
                          <span>{p}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Image Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded border border-gray-700 bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:border-gray-600 hover:bg-gray-700 hover:text-white"
              >
                <IconCamera className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-[10px]">Upload</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              {/* Analyze/Send Button */}
              {onAnalyze && (
                <button
                  onClick={onAnalyze}
                  disabled={isSubmitDisabled}
                  aria-busy={isAnalyzing || isClarifying}
                  className={`flex items-center gap-1.5 rounded-lg border-2 px-3 py-1.5 text-xs font-bold transition-colors ${isSubmitDisabled
                      ? "cursor-not-allowed border-gray-800 bg-gray-900 text-gray-700"
                      : "border-[#b74bff] bg-[#b74bff] text-white hover:bg-[#a03de8]"
                    }`}
                >
                  {isClarifying ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span className="hidden sm:inline">Checking details...</span>
                    </>
                  ) : isAnalyzing ? (
                    <>
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span className="hidden sm:inline">{chatMode ? "Sending..." : "Analyzing..."}</span>
                    </>
                  ) : (
                    <>
                      {chatMode ? (
                        <>
                          <IconMessageSquare className="h-3 w-3" />
                          <span className="hidden sm:inline">Send</span>
                    </>
                  ) : (
                    <>
                      <IconPlay className="h-3 w-3" />
                      <span className="hidden sm:inline">Analyze</span>
                        </>
                      )}
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {isDragging && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#1e293b]/90 backdrop-blur-sm">
            <div className="mb-4 text-[#b74bff]">
              <IconUpload className="h-12 w-12" />
            </div>
            <p className="text-lg font-bold text-[#b74bff]">Drop to upload</p>
          </div>
        )}
      </div>
    </div>
  );
}

