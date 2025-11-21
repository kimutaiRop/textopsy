export enum Persona {
  BRUTAL_BESTIE = "Brutal Best Friend",
  THERAPIST = "Empathetic Therapist",
  TOXIC_EX = "Toxic Ex",
  FBI_PROFILER = "FBI Behavioral Analyst",
  GEN_Z_ROASTER = "Gen Z Roaster",
  CHARISMATIC_FLIRT = "Charismatic Flirt Coach",
}

export interface SuggestedReply {
  tone: string;
  text: string;
  explanation: string;
}

export interface AnalysisResult {
  cringeScore: number;
  interestLevel: number;
  responseSpeedRating: string;
  redFlags: string[];
  greenFlags: string[];
  diagnosis: string;
  detailedAnalysis: string;
  suggestedReplies: SuggestedReply[];
}

export interface UploadedImage {
  base64: string;
  mimeType: string;
  previewUrl: string;
}

export type AnalysisInput =
  | { type: "image"; base64: string; mimeType: string }
  | { type: "text"; content: string };

export type ClarificationArea =
  | "perspective"
  | "relationshipType"
  | "userRole"
  | "partnerRole"
  | "userGender"
  | "partnerGender";

export interface ClarificationQuestion {
  id: string;
  area: ClarificationArea;
  question: string;
  helperText?: string;
  required?: boolean;
  suggestedAnswer?: string;
}

export interface ClarificationContextUpdates {
  userRole?: string;
  partnerRole?: string;
}

export interface ClarificationCheckResult {
  clarificationNeeded: boolean;
  rationale?: string;
  questions: ClarificationQuestion[];
  contextUpdates?: ClarificationContextUpdates;
}

export enum ConversationPerspective {
  THEIR_MESSAGES = "their_messages",
  MY_MESSAGES = "my_messages",
  BOTH = "both",
  UNSURE = "unsure",
}

export enum RelationshipType {
  DATING = "dating",
  SITUATIONSHIP = "situationship",
  FRIENDS = "friends",
  FAMILY = "family",
  COWORKERS = "coworkers",
  EXES = "exes",
  ONLINE_ONLY = "online_only",
  OTHER = "other",
  NOT_SURE = "not_sure",
}

export enum GenderOption {
  WOMAN = "woman",
  MAN = "man",
  NON_BINARY = "non_binary",
  QUEER = "queer",
  PREFER_NOT = "prefer_not",
  UNKNOWN = "unknown",
}

export interface ParticipantDescriptor {
  role?: string;
  gender?: GenderOption;
}

export interface ConversationContext {
  perspective: ConversationPerspective;
  relationshipType?: RelationshipType;
  user?: ParticipantDescriptor;
  partner?: ParticipantDescriptor;
}

export const defaultConversationContext: ConversationContext = {
  perspective: ConversationPerspective.THEIR_MESSAGES,
};

