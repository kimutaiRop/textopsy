'use client';

import { useEffect } from "react";
import type { ConversationContext } from "@/types/analysis";
import { ConversationPerspective, RelationshipType } from "@/types/analysis";
import { perspectiveOptions, relationshipOptions, genderOptions } from "@/lib/contextOptions";
import { IconClose, IconUsers, IconHeart, IconMessageSquare, IconInfo } from "./Icons";

type ContextViewModalProps = {
  isOpen: boolean;
  context: ConversationContext;
  onClose: () => void;
};

export function ContextViewModal({
  isOpen,
  context,
  onClose,
}: ContextViewModalProps) {
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

  if (!isOpen) {
    return null;
  }

  const getPerspectiveLabel = (value: ConversationPerspective): string => {
    const option = perspectiveOptions.find(opt => opt.value === value);
    return option?.label || value;
  };

  const getRelationshipLabel = (value: RelationshipType): string => {
    const option = relationshipOptions.find(opt => opt.value === value);
    return option?.label || value;
  };

  const getGenderLabel = (value: string): string => {
    const option = genderOptions.find(opt => opt.value === value);
    return option?.label || value;
  };

  // Check if there's additional context beyond just the default perspective
  // Check for actual values, not just existence of objects
  const hasRelationshipType = !!context.relationshipType;
  const hasUserInfo = !!(context.user && (context.user.role || (context.user.gender && context.user.gender !== 'unknown')));
  const hasPartnerInfo = !!(context.partner && (context.partner.role || (context.partner.gender && context.partner.gender !== 'unknown')));
  const hasAdditionalContext = hasRelationshipType || hasUserInfo || hasPartnerInfo;

  const perspectiveOption = perspectiveOptions.find(opt => opt.value === context.perspective);
  
  // Debug: log context structure
  console.log('[ContextViewModal] Full context object:', JSON.stringify(context, null, 2));
  console.log('[ContextViewModal] hasRelationshipType:', hasRelationshipType);
  console.log('[ContextViewModal] hasUserInfo:', hasUserInfo, 'user object:', context.user);
  console.log('[ContextViewModal] hasPartnerInfo:', hasPartnerInfo, 'partner object:', context.partner);
  console.log('[ContextViewModal] hasAdditionalContext:', hasAdditionalContext);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slider */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-lg bg-[#0f172a] border-l border-gray-800 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-[#b74bff]/30 bg-[#b74bff]/10">
                <IconInfo className="h-4 w-4 text-[#b74bff]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Context</h2>
                <p className="text-xs text-gray-400 mt-0.5">Stored information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
              aria-label="Close context"
            >
              <IconClose className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {/* Perspective - always shown */}
              <div className="border border-gray-800 bg-[#1e293b] p-4 rounded">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-[#b74bff]/30 bg-[#b74bff]/10">
                    <IconMessageSquare className="h-4 w-4 text-[#b74bff]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">Message Perspective</h3>
                      <span className="rounded border border-[#b74bff]/50 bg-[#b74bff]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#b74bff] whitespace-nowrap">
                        Required
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-200 mb-1">{getPerspectiveLabel(context.perspective)}</p>
                    {perspectiveOption?.description && (
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {perspectiveOption.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Relationship Type */}
              {context.relationshipType && (
                <div className="border border-gray-800 bg-[#1e293b] p-4 rounded">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-[#b74bff]/30 bg-[#b74bff]/10">
                      <IconHeart className="h-4 w-4 text-[#b74bff]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white mb-1">Relationship Type</h3>
                      <p className="text-sm font-medium text-gray-200">{getRelationshipLabel(context.relationshipType)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* User Info */}
              {context.user && (context.user.role || context.user.gender) && (
                <div className="border border-gray-800 bg-[#1e293b] p-4 rounded">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-[#b74bff]/30 bg-[#b74bff]/10">
                      <IconUsers className="h-4 w-4 text-[#b74bff]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white mb-3">Your Information</h3>
                      <div className="space-y-2">
                        {context.user.role && (
                          <div className="border border-gray-800 bg-[#0f172a] p-3 rounded">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Role</p>
                            <p className="text-sm text-gray-200">{context.user.role}</p>
                          </div>
                        )}
                        {context.user.gender && (
                          <div className="border border-gray-800 bg-[#0f172a] p-3 rounded">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Gender</p>
                            <p className="text-sm text-gray-200">{getGenderLabel(context.user.gender)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Partner Info */}
              {context.partner && (context.partner.role || context.partner.gender) && (
                <div className="border border-gray-800 bg-[#1e293b] p-4 rounded">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded border border-[#b74bff]/30 bg-[#b74bff]/10">
                      <IconUsers className="h-4 w-4 text-[#b74bff]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-white mb-3">Their Information</h3>
                      <div className="space-y-2">
                        {context.partner.role && (
                          <div className="border border-gray-800 bg-[#0f172a] p-3 rounded">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Role</p>
                            <p className="text-sm text-gray-200">{context.partner.role}</p>
                          </div>
                        )}
                        {context.partner.gender && (
                          <div className="border border-gray-800 bg-[#0f172a] p-3 rounded">
                            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Gender</p>
                            <p className="text-sm text-gray-200">{getGenderLabel(context.partner.gender)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state if only perspective is set */}
              {!hasAdditionalContext && (
                <div className="border border-gray-800 border-dashed bg-[#1e293b]/50 p-6 text-center rounded">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-gray-800/50 mb-3">
                    <IconInfo className="h-5 w-5 text-gray-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-400 mb-1">No additional context stored yet</p>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Additional information will appear here as you analyze conversations.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-800 px-6 py-4">
            <button
              onClick={onClose}
              className="w-full rounded border-2 border-[#b74bff] bg-[#b74bff]/10 px-4 py-2 text-sm font-medium text-[#b74bff] transition-colors hover:bg-[#b74bff]/20"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
