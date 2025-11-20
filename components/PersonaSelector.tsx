'use client';

import { Persona } from "@/types/analysis";
import { IconBrutal, IconCharismatic, IconFBI, IconRoaster, IconTherapist, IconToxic } from "./Icons";
import { JSX } from "react";

type PersonaSelectorProps = {
  selectedPersona: Persona;
  onSelect: (persona: Persona) => void;
};

const descriptions: Record<Persona, string> = {
  [Persona.BRUTAL_BESTIE]: "No sugar-coating. Pure honesty.",
  [Persona.THERAPIST]: "Attachment styles & boundaries.",
  [Persona.TOXIC_EX]: "Chaotic energy & bad advice.",
  [Persona.FBI_PROFILER]: "Cold, calculated analysis.",
  [Persona.GEN_Z_ROASTER]: "Ruthless vibe check.",
  [Persona.CHARISMATIC_FLIRT]: "Charismatic flirting coach.",
};

const personaIcons: Record<Persona, React.ReactNode> = {
  [Persona.BRUTAL_BESTIE]: <IconBrutal />,
  [Persona.THERAPIST]: <IconTherapist />,
  [Persona.TOXIC_EX]: <IconToxic />,
  [Persona.FBI_PROFILER]: <IconFBI />,
  [Persona.GEN_Z_ROASTER]: <IconRoaster />,
  [Persona.CHARISMATIC_FLIRT]: <IconCharismatic />,
};

export function PersonaSelector({ selectedPersona, onSelect }: PersonaSelectorProps) {
  return (
    <div className="w-full">
      <h3 className="mb-3 px-1 text-sm font-medium uppercase tracking-widest text-gray-400">Analyst Persona</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
        {Object.values(Persona).map((persona) => {
          const isActive = persona === selectedPersona;
          return (
            <button
              key={persona}
              onClick={() => onSelect(persona)}
              className={`rounded border p-3 text-left transition-colors ${
                isActive
                  ? "border-[#b74bff] bg-[#b74bff] text-white"
                  : "border-gray-800 bg-[#1e293b] text-gray-400 hover:border-gray-700 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className={isActive ? "text-white" : "text-gray-500"}>{personaIcons[persona]}</span>
                <span className={`text-xs font-bold ${isActive ? "text-white" : "text-gray-300"}`}>{persona}</span>
              </div>
              <div className={`pl-0.5 text-[10px] leading-tight ${isActive ? "text-white/80" : "text-gray-500"}`}>
                {descriptions[persona]}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

