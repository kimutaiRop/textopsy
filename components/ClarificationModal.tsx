'use client';

import { useEffect, useState } from "react";
import type { ClarificationQuestion, ConversationContext } from "@/types/analysis";
import { ConversationPerspective, RelationshipType, GenderOption } from "@/types/analysis";
import { perspectiveOptions, relationshipOptions, genderOptions } from "@/lib/contextOptions";
import { deriveContextValueForArea } from "@/lib/contextUtils";
import { IconClose, IconMessageSquare, IconHeart, IconUsers, IconInfo } from "./Icons";

type ClarificationModalProps = {
  isOpen: boolean;
  questions: ClarificationQuestion[];
  onSubmit: (answers: Record<string, string>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  contextSnapshot?: ConversationContext;
};

const areaLabels: Record<string, string> = {
  perspective: "Message perspective",
  relationshipType: "Relationship vibe",
  userRole: "Your role",
  partnerRole: "Their role",
  userGender: "Your gender",
  partnerGender: "Their gender",
};

const areaIcons: Record<string, React.ReactNode> = {
  perspective: <IconMessageSquare className="h-4 w-4 text-[#b74bff]" />,
  relationshipType: <IconHeart className="h-4 w-4 text-[#b74bff]" />,
  userRole: <IconUsers className="h-4 w-4 text-[#b74bff]" />,
  partnerRole: <IconUsers className="h-4 w-4 text-[#b74bff]" />,
  userGender: <IconUsers className="h-4 w-4 text-[#b74bff]" />,
  partnerGender: <IconUsers className="h-4 w-4 text-[#b74bff]" />,
};

export function ClarificationModal({
  isOpen,
  questions,
  onSubmit,
  onCancel,
  isSubmitting = false,
  contextSnapshot,
}: ClarificationModalProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    const defaults: Record<string, string> = {};
    questions.forEach((question) => {
      const contextValue = deriveContextValueForArea(contextSnapshot, question.area);
      defaults[question.id] = question.suggestedAnswer ?? contextValue ?? "";
    });
    setAnswers(defaults);
  }, [isOpen, questions, contextSnapshot]);

  if (!isOpen) {
    return null;
  }

  const updateAnswer = (id: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const canSubmit = questions.every((question) => {
    if (question.required === false) return true;
    const response = answers[question.id];
    return typeof response === "string" && response.trim().length > 0;
  });

  const renderInput = (question: ClarificationQuestion) => {
    const value = answers[question.id] ?? "";

    switch (question.area) {
      case "perspective":
        return (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {perspectiveOptions.map((option) => {
              const isActive = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateAnswer(question.id, option.value)}
                  className={`group flex flex-col items-start rounded border-2 px-4 py-3.5 text-left transition-all ${
                    isActive
                      ? "border-[#b74bff] bg-[#b74bff]/10 text-white"
                      : "border-gray-800 bg-[#1e293b] text-gray-300 hover:border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  <span className="text-sm font-bold">{option.label}</span>
                  <span className={`text-xs mt-1 leading-relaxed ${isActive ? "text-gray-300" : "text-gray-500"}`}>
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        );
      case "relationshipType":
        return (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relationshipOptions.map((option) => {
              const isActive = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateAnswer(question.id, option.value)}
                  className={`rounded border-2 px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? "border-[#b74bff] bg-[#b74bff]/10 text-white"
                      : "border-gray-800 bg-[#1e293b] text-gray-300 hover:border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        );
      case "userGender":
      case "partnerGender":
        return (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {genderOptions.map((option) => {
              const isActive = value === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateAnswer(question.id, option.value)}
                  className={`rounded border-2 px-4 py-3 text-sm font-semibold transition-all ${
                    isActive
                      ? "border-[#b74bff] bg-[#b74bff]/10 text-white"
                      : "border-gray-800 bg-[#1e293b] text-gray-300 hover:border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        );
      case "userRole":
      case "partnerRole":
        return (
          <input
            type="text"
            className="mt-4 w-full rounded border-2 border-gray-800 bg-[#1e293b] px-4 py-3 text-sm text-gray-200 placeholder:text-gray-500 focus:border-[#b74bff] focus:bg-gray-800 focus:outline-none transition-all"
            value={value}
            placeholder="Type your answer"
            onChange={(event) => updateAnswer(question.id, event.target.value)}
          />
        );
      default:
        return (
          <textarea
            className="mt-4 w-full rounded border-2 border-gray-800 bg-[#1e293b] px-4 py-3 text-sm text-gray-200 placeholder:text-gray-500 focus:border-[#b74bff] focus:bg-gray-800 focus:outline-none transition-all"
            value={value}
            rows={3}
            onChange={(event) => updateAnswer(question.id, event.target.value)}
          />
        );
    }
  };

  const handleSubmit = () => {
    if (!canSubmit || isSubmitting) return;
    onSubmit(answers);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 py-4 backdrop-blur-sm sm:items-center sm:py-8">
      <div className="w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] flex flex-col rounded border border-gray-800 bg-[#0f172a] p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8 flex-shrink-0">
          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded border border-[#b74bff]/30 bg-[#b74bff]/10 flex-shrink-0">
              <IconInfo className="h-5 w-5 sm:h-6 sm:w-6 text-[#b74bff]" />
            </div>
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#b74bff] font-semibold">Quick check</p>
              <h2 className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold text-white">We need a little more context</h2>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-400 leading-relaxed">
                Our analyst wants to be precise. Clear these up and we'll run the full Textopsy instantly.
              </p>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="rounded p-1.5 sm:p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white flex-shrink-0"
              aria-label="Close modal"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="space-y-4 sm:space-y-5 flex-1 overflow-y-auto pr-1 sm:pr-2 min-h-0">
          {questions.map((question, index) => (
            <div 
              key={question.id} 
              className="border border-gray-800 bg-[#1e293b] p-4 sm:p-5 md:p-6 rounded"
            >
              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded border border-[#b74bff]/30 bg-[#b74bff]/10">
                  {areaIcons[question.area] || <IconInfo className="h-4 w-4 sm:h-5 sm:w-5 text-[#b74bff]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start sm:items-center justify-between gap-2 sm:gap-3 mb-1 flex-col sm:flex-row">
                    <p className="text-sm font-bold text-white leading-snug flex-1">{question.question}</p>
                    <span className="rounded border border-gray-700 bg-gray-800 px-2 sm:px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap self-start sm:self-auto">
                      {areaLabels[question.area] || "Context"}
                    </span>
                  </div>
                  {question.helperText && (
                    <p className="text-xs text-gray-500 mt-1 sm:mt-1.5 leading-relaxed">{question.helperText}</p>
                  )}
                </div>
              </div>
              {renderInput(question)}
            </div>
          ))}
        </div>

        {/* Fixed footer with buttons */}
        <div className="mt-4 sm:mt-6 md:mt-8 flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 border-t border-gray-800 pt-4 sm:pt-6 flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="order-2 sm:order-1 rounded border-2 border-gray-800 bg-[#1e293b] px-4 sm:px-5 py-2.5 sm:py-3 text-sm font-semibold text-gray-400 transition-colors hover:border-gray-700 hover:text-white hover:bg-gray-800"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className={`order-1 sm:order-2 flex items-center justify-center gap-2 rounded border-2 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold transition-all ${
              !canSubmit || isSubmitting 
                ? "cursor-not-allowed border-transparent bg-gray-800 text-gray-500" 
                : "border-[#b74bff] bg-[#b74bff]/10 text-[#b74bff] hover:bg-[#b74bff]/20"
            }`}
          >
            {isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#b74bff] border-t-transparent" />}
            <span>{isSubmitting ? "Submitting..." : "Continue"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
