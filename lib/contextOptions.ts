import { ConversationPerspective, RelationshipType, GenderOption } from "@/types/analysis";

export const perspectiveOptions = [
  {
    value: ConversationPerspective.THEIR_MESSAGES,
    label: "Their replies",
    description: "Grade how their messages land on you.",
  },
  {
    value: ConversationPerspective.MY_MESSAGES,
    label: "My replies",
    description: "Roast or refine what I sent.",
  },
  {
    value: ConversationPerspective.BOTH,
    label: "Both sides",
    description: "Compare our energies together.",
  },
  {
    value: ConversationPerspective.UNSURE,
    label: "Not sure",
    description: "Help me figure out who sounds off.",
  },
];

export const relationshipOptions = [
  { value: RelationshipType.DATING, label: "Dating / together" },
  { value: RelationshipType.SITUATIONSHIP, label: "Situationship" },
  { value: RelationshipType.EXES, label: "Exes / post-breakup" },
  { value: RelationshipType.FRIENDS, label: "Friends" },
  { value: RelationshipType.COWORKERS, label: "Coworkers" },
  { value: RelationshipType.FAMILY, label: "Family" },
  { value: RelationshipType.ONLINE_ONLY, label: "Online-only" },
  { value: RelationshipType.OTHER, label: "Other vibe" },
  { value: RelationshipType.NOT_SURE, label: "Not sure yet" },
];

export const genderOptions = [
  { value: GenderOption.WOMAN, label: "Woman" },
  { value: GenderOption.MAN, label: "Man" },
  { value: GenderOption.NON_BINARY, label: "Non-binary" },
  { value: GenderOption.QUEER, label: "Queer / fluid" },
  { value: GenderOption.PREFER_NOT, label: "Prefer not to say" },
  { value: GenderOption.UNKNOWN, label: "Unsure" },
];

export const roleSuggestions = [
  "Girlfriend",
  "Boyfriend",
  "Partner",
  "Crush",
  "Spouse",
  "Best friend",
  "Coworker",
  "Manager",
  "Sibling",
  "Parent",
  "Situationship",
  "Other",
];

export type MessagePerspectiveCopy = {
  title: string;
  description: string;
};

export const MESSAGE_PERSPECTIVE_DEFAULT: MessagePerspectiveCopy = {
  title: "Message perspective",
  description: "Tell us whose voice you want decoded. We’ll reuse this context for every reply in this conversation.",
};

