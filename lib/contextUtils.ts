import {
  ConversationPerspective,
  ConversationContext,
  ClarificationQuestion,
  ClarificationArea,
  GenderOption,
  RelationshipType,
} from "@/types/analysis";

export function deriveContextValueForArea(
  context: ConversationContext | undefined,
  area: ClarificationArea
): string | undefined {
  if (!context) return undefined;
  switch (area) {
    case "perspective":
      return context.perspective;
    case "relationshipType":
      return context.relationshipType;
    case "userRole":
      return context.user?.role;
    case "partnerRole":
      return context.partner?.role;
    case "userGender":
      return context.user?.gender;
    case "partnerGender":
      return context.partner?.gender;
    default:
      return undefined;
  }
}

export function applyClarificationAnswers(
  baseContext: ConversationContext,
  questions: ClarificationQuestion[],
  answers: Record<string, string>
): ConversationContext {
  const nextContext: ConversationContext = {
    ...baseContext,
    user: baseContext.user ? { ...baseContext.user } : undefined,
    partner: baseContext.partner ? { ...baseContext.partner } : undefined,
  };

  for (const question of questions) {
    const value = (answers[question.id] ?? "").trim();
    if (!value) {
      clearArea(nextContext, question.area);
      continue;
    }

    switch (question.area) {
      case "perspective":
        nextContext.perspective = value as ConversationPerspective;
        break;
      case "relationshipType":
        nextContext.relationshipType = value as RelationshipType;
        break;
      case "userRole":
        nextContext.user = { ...(nextContext.user || {}), role: value };
        break;
      case "partnerRole":
        nextContext.partner = { ...(nextContext.partner || {}), role: value };
        break;
      case "userGender":
        nextContext.user = { ...(nextContext.user || {}), gender: value as GenderOption };
        break;
      case "partnerGender":
        nextContext.partner = { ...(nextContext.partner || {}), gender: value as GenderOption };
        break;
    }
  }

  if (nextContext.user && !Object.keys(nextContext.user).length) {
    nextContext.user = undefined;
  }
  if (nextContext.partner && !Object.keys(nextContext.partner).length) {
    nextContext.partner = undefined;
  }

  return nextContext;
}

function clearArea(context: ConversationContext, area: ClarificationArea) {
  switch (area) {
    case "perspective":
      // Do not fully clear perspective, fall back to default (their messages)
      context.perspective = ConversationPerspective.THEIR_MESSAGES;
      break;
    case "relationshipType":
      delete context.relationshipType;
      break;
    case "userRole":
      if (context.user) {
        delete context.user.role;
      }
      break;
    case "partnerRole":
      if (context.partner) {
        delete context.partner.role;
      }
      break;
    case "userGender":
      if (context.user) {
        delete context.user.gender;
      }
      break;
    case "partnerGender":
      if (context.partner) {
        delete context.partner.gender;
      }
      break;
    default:
      break;
  }
}

