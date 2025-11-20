'use client';

import { useEffect } from "react";
import { IconClose, IconFileText, IconImage } from "./Icons";

type InputPreview =
  | { type: "image"; url: string }
  | {
      type: "text";
      content: string;
    };

type EvidenceSliderProps = {
  isOpen: boolean;
  onClose: () => void;
  inputPreview: InputPreview;
};

export function EvidenceSlider({ isOpen, onClose, inputPreview }: EvidenceSliderProps) {
  // Prevent body scroll when slider is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slider */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-2xl bg-[#0f172a] border-l border-gray-800 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-[#b74bff]/30 bg-[#b74bff]/10">
                {inputPreview.type === "image" ? (
                  <IconImage className="h-4 w-4 text-[#b74bff]" />
                ) : (
                  <IconFileText className="h-4 w-4 text-[#b74bff]" />
                )}
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Evidence</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {inputPreview.type === "image" ? "Screenshot evidence" : "Text conversation"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              aria-label="Close evidence slider"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {inputPreview.type === "image" ? (
              <div className="space-y-4">
                <div className="rounded border border-gray-800 overflow-hidden bg-[#1e293b]">
                  <img
                    src={inputPreview.url}
                    alt="Conversation evidence"
                    className="w-full h-auto object-contain"
                  />
                </div>
                <div className="rounded border border-gray-800 bg-[#1e293b] p-4">
                  <p className="text-xs text-gray-400 text-center leading-relaxed">
                    This is the screenshot that was analyzed for this conversation. 
                    You can use it to reference the original messages.
                </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded border border-gray-800 bg-[#1e293b] p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded border border-[#b74bff]/30 bg-[#b74bff]/10">
                      <IconFileText className="h-4 w-4 text-[#b74bff]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-gray-300">
                      Conversation Text
                    </h3>
                      <p className="text-xs text-gray-500 mt-0.5">Original text used for analysis</p>
                    </div>
                  </div>
                  <div className="rounded border border-gray-800 bg-[#0f172a] p-5">
                    <pre className="whitespace-pre-wrap break-words text-sm text-gray-200 leading-relaxed font-sans">
                    {inputPreview.content}
                  </pre>
                  </div>
                </div>
                <div className="rounded border border-gray-800 bg-[#1e293b] p-4">
                  <p className="text-xs text-gray-400 text-center leading-relaxed">
                    This is the exact text that was analyzed. Use it to understand the context 
                    behind the analysis results.
                </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-800 px-6 py-4">
            <button
              onClick={onClose}
              className="w-full rounded border-2 border-[#b74bff] bg-[#b74bff]/10 px-4 py-2 text-sm font-medium text-[#b74bff] transition-colors hover:bg-[#b74bff]/20"
            >
              Close Evidence
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
