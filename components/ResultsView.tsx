'use client';

import { useEffect, useRef, useState, ReactNode } from "react";
import { Persona } from "@/types/analysis";
import type { AnalysisResult } from "@/types/analysis";
import {
  IconArrowLeft,
  IconBrutal,
  IconCharismatic,
  IconCheckCircle,
  IconChevronDown,
  IconCopy,
  IconFBI,
  IconFlag,
  IconRoaster,
  IconTherapist,
  IconToxic,
  IconZap,
} from "./Icons";
import { EvidenceSlider } from "./EvidenceSlider";

type InputPreview =
  | { type: "image"; url: string }
  | {
      type: "text";
      content: string;
    };

type ResultsViewProps = {
  result: AnalysisResult;
  persona: Persona;
  inputPreview: InputPreview;
  onReset: () => void;
  onReanalyze: (persona: Persona) => void;
  onDelete?: () => void;
  showDelete?: boolean;
};

const personaIcons: Record<Persona, ReactNode> = {
  [Persona.BRUTAL_BESTIE]: <IconBrutal className="h-4 w-4" />,
  [Persona.THERAPIST]: <IconTherapist className="h-4 w-4" />,
  [Persona.TOXIC_EX]: <IconToxic className="h-4 w-4" />,
  [Persona.FBI_PROFILER]: <IconFBI className="h-4 w-4" />,
  [Persona.GEN_Z_ROASTER]: <IconRoaster className="h-4 w-4" />,
  [Persona.CHARISMATIC_FLIRT]: <IconCharismatic className="h-4 w-4" />,
};

const getScoreColor = (score: number, invert = false) => {
  const good = invert ? score < 40 : score > 70;
  const bad = invert ? score > 70 : score < 40;
  if (good) return "text-emerald-400";
  if (bad) return "text-rose-400";
  return "text-amber-400";
};

export function ResultsView({ result, persona, inputPreview, onReset, onReanalyze, onDelete, showDelete }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState<"analysis" | "replies">("analysis");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [evidenceSliderOpen, setEvidenceSliderOpen] = useState(false);
  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);
  const personaMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (personaMenuRef.current && !personaMenuRef.current.contains(event.target as Node)) {
        setPersonaMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      <EvidenceSlider
        isOpen={evidenceSliderOpen}
        onClose={() => setEvidenceSliderOpen(false)}
        inputPreview={inputPreview}
      />
    <div className="mx-auto w-full max-w-5xl px-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Navigation Bar */}
      <div className="mb-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="group flex items-center gap-2 text-xs font-medium text-gray-500 transition-colors hover:text-white"
          >
            <IconArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Start Over
          </button>
          {showDelete && onDelete && (
            <button
              onClick={onDelete}
              className="rounded p-1.5 text-gray-500 transition-colors hover:bg-red-600/20 hover:text-red-400"
              aria-label="Delete analysis"
              title="Delete this analysis"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          )}
        </div>

        <div className="relative" ref={personaMenuRef}>
          <button
            onClick={() => setPersonaMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full border border-gray-800 bg-gray-900/50 px-4 py-2 text-xs uppercase tracking-wider text-gray-300 transition-all hover:bg-gray-800 hover:border-gray-700"
          >
            <span className="text-[#b74bff]">{personaIcons[persona]}</span>
            {persona}
            <IconChevronDown
              className={`h-3 w-3 text-gray-500 transition-transform ${personaMenuOpen ? "rotate-180" : ""}`}
            />
          </button>

          {personaMenuOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-gray-800 bg-[#1e293b] shadow-2xl">
              <div className="border-b border-gray-800 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                Switch Analyst
              </div>
              {Object.values(Persona).map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setPersonaMenuOpen(false);
                    if (option !== persona) {
                      onReanalyze(option);
                    }
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-xs transition-colors ${
                    option === persona
                      ? "bg-[#b74bff]/10 text-[#b74bff]"
                      : "text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <span className={option === persona ? "text-[#b74bff]" : "text-gray-500"}>{personaIcons[option]}</span>
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Diagnosis Section - Short Punchline */}
      <div className="mb-10">
        <div className="mb-4 flex items-center gap-3">
           <div className="flex items-center gap-2 rounded-full bg-[#b74bff]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#b74bff]">
             <span className="h-1.5 w-1.5 rounded-full bg-[#b74bff] animate-pulse" />
             Diagnosis
           </div>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight max-w-4xl line-clamp-2">
          {result.diagnosis}
        </h1>
      </div>

      {/* Response Speed - Standalone */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800">
          <IconZap className="h-4 w-4 text-[#b74bff]" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Response Speed</span>
        </div>
        <p className="text-lg font-bold text-white pl-11">{result.responseSpeedRating}</p>
      </div>

      {/* Metrics Grid - Minimal (2 cols) */}
      <div className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 border-y border-gray-800/50 py-10">
        {/* Interest Level */}
        <div className="group">
           <span className="block mb-2 text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">Interest Level</span>
           <div className="flex items-baseline gap-1">
             <span className={`text-5xl font-mono font-light tracking-tighter ${getScoreColor(result.interestLevel)}`}>
               {result.interestLevel}
             </span>
             <span className="text-xl text-gray-600">%</span>
           </div>
           <p className="mt-2 text-sm text-gray-600">Likelihood they actually care</p>
        </div>

        {/* Cringe Score */}
        <div className="group md:border-l md:border-gray-800/50 md:pl-12">
           <span className="block mb-2 text-[10px] uppercase tracking-widest text-gray-500 group-hover:text-gray-300 transition-colors">Cringe Score</span>
           <div className="flex items-baseline gap-1">
             <span className={`text-5xl font-mono font-light tracking-tighter ${getScoreColor(result.cringeScore, true)}`}>
               {result.cringeScore}
             </span>
             <span className="text-xl text-gray-600">%</span>
           </div>
           <p className="mt-2 text-sm text-gray-600">Second-hand embarrassment level</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-12 flex gap-8 border-b border-gray-800/50">
        <button
          onClick={() => setActiveTab("analysis")}
          className={`pb-4 text-sm font-medium tracking-wide transition-all ${
            activeTab === 'analysis' 
              ? 'text-white border-b-2 border-[#b74bff]' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Analysis & Flags
        </button>
        <button
          onClick={() => setActiveTab("replies")}
          className={`pb-4 text-sm font-medium tracking-wide transition-all ${
            activeTab === 'replies' 
              ? 'text-white border-b-2 border-[#b74bff]' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          Suggested Replies
        </button>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === "analysis" ? (
           <div className="space-y-16">
               {/* Text Body */}
               <div>
                  <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
                    <IconFlag className="h-5 w-5 text-[#b74bff]" />
                    The Breakdown
                  </h3>
                  <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-gray-300 leading-relaxed font-light">{result.detailedAnalysis}</p>
                  </div>
               </div>

               {/* Flags */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div>
                   <div className="flex items-center gap-2 mb-6">
                     <span className="h-2 w-2 rounded-full bg-rose-500" />
                     <h4 className="text-xs font-bold text-rose-400 uppercase tracking-widest">Red Flags</h4>
                   </div>
                   <ul className="space-y-4">
                     {result.redFlags.map((flag, index) => (
                       <li key={index} className="flex items-start gap-3 text-sm text-gray-300 group">
                         <span className="mt-2 h-1 w-1 rounded-full bg-gray-700 shrink-0 group-hover:bg-rose-500 transition-colors" />
                         {flag}
                       </li>
                     ))}
                   </ul>
                 </div>
                 <div>
                   <div className="flex items-center gap-2 mb-6">
                     <span className="h-2 w-2 rounded-full bg-emerald-500" />
                     <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Green Flags</h4>
                   </div>
                   <ul className="space-y-4">
                     {result.greenFlags.map((flag, index) => (
                       <li key={index} className="flex items-start gap-3 text-sm text-gray-300 group">
                         <span className="mt-2 h-1 w-1 rounded-full bg-gray-700 shrink-0 group-hover:bg-emerald-500 transition-colors" />
                         {flag}
                       </li>
                     ))}
                   </ul>
                 </div>
                  </div>
                  
             {/* Evidence Button */}
             <div className="flex justify-center pt-8 border-t border-gray-800/50">
                       <button 
                 onClick={() => setEvidenceSliderOpen(true)}
                 className="group flex items-center gap-3 rounded-lg border-2 border-gray-800 bg-gray-900/50 px-6 py-4 text-sm font-medium text-gray-300 transition-all hover:border-[#b74bff] hover:bg-[#b74bff]/10 hover:text-white"
               >
                 <IconFlag className="h-5 w-5 text-[#b74bff] group-hover:scale-110 transition-transform" />
                 <span>View Evidence</span>
                 <span className="text-xs text-gray-500 group-hover:text-gray-400">
                   {inputPreview.type === "image" ? "Screenshot" : "Text"}
                 </span>
                       </button>
             </div>
           </div>
        ) : (
           // Replies Tab
           <div className="max-w-3xl">
              <div className="space-y-8">
                {result.suggestedReplies.map((reply, index) => (
                  <div key={index} className="group relative pl-8 transition-all">
                    {/* Vertical Line */}
                    <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-gray-800 group-hover:bg-[#b74bff] transition-colors" />
                    
                    <div className="mb-3 flex items-center justify-between">
                      <span className="inline-block rounded bg-gray-800/50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#b74bff] group-hover:bg-[#b74bff]/10 transition-colors">
                        {reply.tone}
                      </span>
                      <button
                        onClick={() => handleCopy(reply.text, index)}
                        className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                      >
                        {copiedIndex === index ? (
                          <>
                            <IconCheckCircle className="h-3 w-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <IconCopy className="h-3 w-3" />
                            <span>Copy text</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    <p className="text-xl text-gray-100 font-medium mb-3 leading-relaxed">{reply.text}</p>
                    <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors">{reply.explanation}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 pt-8 border-t border-gray-800/50 flex items-center gap-3 text-xs text-gray-600">
                 <IconCheckCircle className="h-4 w-4 text-gray-700" />
                 <p>Replies are generated securely on our servers. Copy actions stay on your device.</p>
              </div>
           </div>
        )}
      </div>
    </div>
    </>
  );
}
