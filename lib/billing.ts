import "server-only";

import { and, count, eq, gt, isNotNull, isNull, lt, lte, or } from "drizzle-orm";

import {
  conversations,
  db,
  paystackTransactions,
  userDailyUsage,
  userMonthlyCredits,
  users,
  type User,
} from "@/lib/db";
import { generateId } from "@/lib/conversation";

const DEFAULT_MAX_CONVERSATIONS = 5;
const DEFAULT_DAILY_SUBMISSIONS = 3;
const DEFAULT_PRO_DURATION_DAYS = 30;
const DEFAULT_PRO_CREDITS = 200;

function toPositiveInteger(value: string | number | null | undefined, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.floor(parsed);
}

export const FREE_MAX_CONVERSATIONS = toPositiveInteger(
  process.env.FREE_PLAN_MAX_CONVERSATIONS,
  DEFAULT_MAX_CONVERSATIONS
);

export const FREE_MAX_SUBMISSIONS_PER_DAY = toPositiveInteger(
  process.env.FREE_PLAN_MAX_SUBMISSIONS_PER_DAY,
  DEFAULT_DAILY_SUBMISSIONS
);

export const PRO_DURATION_IN_DAYS = toPositiveInteger(
  process.env.PAYSTACK_PRO_DURATION_DAYS,
  DEFAULT_PRO_DURATION_DAYS
);

export const PRO_MAX_CREDITS_PER_MONTH = toPositiveInteger(
  process.env.PRO_MAX_CREDITS_PER_MONTH,
  DEFAULT_PRO_CREDITS
);

export type PlanName = "free" | "pro";

export type UserPlanRecord = User & {
  plan: PlanName;
  planExpiresAt: Date | null;
  paystackCustomerCode: string | null;
  paystackAuthorizationCode: string | null;
};

export type UserPlanInfo = {
  id: string;
  email: string;
  plan: PlanName;
  isPro: boolean;
  planExpiresAt: Date | null;
  paystackCustomerCode: string | null;
  paystackAuthorizationCode: string | null;
  emailVerifiedAt: Date | null;
};

export type UsageSnapshot = {
  conversationLimit: number | null;
  conversationsUsed: number;
  submissionsLimit: number | null;
  submissionsUsed: number;
  resetsAt: string | null;
  creditLimit: number | null;
  creditsUsed: number;
  creditResetsAt: string | null;
};

type FreemiumLimitCode = "CONVERSATION_LIMIT" | "SUBMISSION_LIMIT" | "CREDIT_LIMIT";

class FreemiumLimitError extends Error {
  code: FreemiumLimitCode;
  status: number;
  details?: Record<string, unknown>;

  constructor(code: FreemiumLimitCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.status = 402;
    this.details = details;
  }
}

export async function normalizePlan(
  plan: string | null,
  planExpiresAt: Date | null
): Promise<{ plan: PlanName; isPro: boolean; planExpiresAt: Date | null }> {
  if (plan === "pro" && planExpiresAt) {
    if (planExpiresAt.getTime() <= Date.now()) {
      return { plan: "free", isPro: false, planExpiresAt: null };
    }
    return { plan: "pro", isPro: true, planExpiresAt };
  }

  if (plan === "pro" && !planExpiresAt) {
    return { plan: "pro", isPro: true, planExpiresAt: null };
  }

  return { plan: "free", isPro: false, planExpiresAt: null };
}

export async function getUserPlanInfo(userId: string): Promise<UserPlanInfo | null> {
  const [record] = await db
    .select({
      id: users.id,
      email: users.email,
      plan: users.plan,
      planExpiresAt: users.planExpiresAt,
      paystackCustomerCode: users.paystackCustomerCode,
      paystackAuthorizationCode: users.paystackAuthorizationCode,
      emailVerifiedAt: users.emailVerifiedAt,
    })
    .from(users as any)
    .where(eq(users.id, userId) as any)
    .limit(1);

  if (!record) {
    return null;
  }

  const normalized = await normalizePlan(record.plan, record.planExpiresAt);

  // If plan expired, downgrade user automatically so UI/API stay consistent
  if (record.plan === "pro" && !normalized.isPro) {
    await db
      .update(users as any)
      .set({
        plan: "free",
        planExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId) as any);
  }

  return {
    id: record.id,
    email: record.email,
    plan: normalized.plan,
    isPro: normalized.isPro,
    planExpiresAt: normalized.planExpiresAt,
    paystackCustomerCode: record.paystackCustomerCode,
    paystackAuthorizationCode: record.paystackAuthorizationCode,
    emailVerifiedAt: record.emailVerifiedAt ?? null,
  };
}

export async function ensureConversationAllowance(userId: string, isPro: boolean) {
  if (isPro) {
    return { remaining: Infinity };
  }

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(conversations as any)
    .where(eq(conversations.userId, userId) as any);

  const used = Number(total ?? 0);

  if (used >= FREE_MAX_CONVERSATIONS) {
    throw new FreemiumLimitError("CONVERSATION_LIMIT", "Free plan allows up to 5 stored conversations. Upgrade to Pro for unlimited threads.", {
      limit: FREE_MAX_CONVERSATIONS,
      used,
    });
  }

  return { remaining: FREE_MAX_CONVERSATIONS - used };
}

export async function getUsageDateKey(date = new Date()): Promise<string> {
  const utcYear = date.getUTCFullYear();
  const utcMonth = date.getUTCMonth();
  const utcDay = date.getUTCDate();
  const month = `${utcMonth + 1}`.padStart(2, "0");
  const day = `${utcDay}`.padStart(2, "0");
  return `${utcYear}-${month}-${day}`;
}

export async function getNextResetDateISO(date = new Date()): Promise<string> {
  const reset = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
  return reset.toISOString();
}

export async function getUsageMonthKey(date = new Date()): Promise<string> {
  const utcYear = date.getUTCFullYear();
  const utcMonth = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${utcYear}-${utcMonth}`;
}

export async function getNextMonthResetDateISO(date = new Date()): Promise<string> {
  const reset = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1));
  return reset.toISOString();
}

async function incrementProCreditUsage(userId: string) {
  const usageMonth = await getUsageMonthKey();

  const [existing] = await db
    .select()
    .from(userMonthlyCredits as any)
    .where(and(eq(userMonthlyCredits.userId, userId), eq(userMonthlyCredits.usageMonth, usageMonth)) as any)
    .limit(1);

  if (!existing) {
    await db.insert(userMonthlyCredits as any).values({
      id: generateId(),
      userId,
      usageMonth,
      creditsUsed: 1,
    });
    return;
  }

  if (existing.creditsUsed >= PRO_MAX_CREDITS_PER_MONTH) {
    throw new FreemiumLimitError("CREDIT_LIMIT", "You reached this month’s Pro credit limit. Contact support to increase it.", {
      limit: PRO_MAX_CREDITS_PER_MONTH,
      used: existing.creditsUsed,
      resetsAt: await getNextMonthResetDateISO(),
    });
  }

  await db
    .update(userMonthlyCredits as any)
    .set({
      creditsUsed: existing.creditsUsed + 1,
      updatedAt: new Date(),
    })
    .where(eq(userMonthlyCredits.id, existing.id) as any);
}

export async function incrementSubmissionUsage(userId: string, isPro: boolean) {
  if (isPro) {
    await incrementProCreditUsage(userId);
    return;
  }

  const usageDate = await getUsageDateKey();

  const [existing] = await db
    .select()
    .from(userDailyUsage as any)
    .where(and(eq(userDailyUsage.userId, userId), eq(userDailyUsage.usageDate, usageDate)) as any)
    .limit(1);

  if (!existing) {
    await db.insert(userDailyUsage as any).values({
      id: generateId(),
      userId,
      usageDate,
      submissionCount: 1,
    });
    return;
  }

  if (existing.submissionCount >= FREE_MAX_SUBMISSIONS_PER_DAY) {
    throw new FreemiumLimitError(
      "SUBMISSION_LIMIT",
      "You reached today’s free limit (3 submissions). Upgrade to keep going.",
      {
        limit: FREE_MAX_SUBMISSIONS_PER_DAY,
        used: existing.submissionCount,
        resetsAt: await getNextResetDateISO(),
      }
    );
  }

  await db
    .update(userDailyUsage as any)
    .set({
      submissionCount: existing.submissionCount + 1,
      updatedAt: new Date(),
    })
    .where(eq(userDailyUsage.id, existing.id) as any);
}

export async function getUsageSnapshot(userId: string, isPro: boolean): Promise<UsageSnapshot> {
  if (isPro) {
    const usageMonth = await getUsageMonthKey();
    const [monthly] = await db
      .select()
      .from(userMonthlyCredits as any)
      .where(and(eq(userMonthlyCredits.userId, userId), eq(userMonthlyCredits.usageMonth, usageMonth)) as any)
      .limit(1);

    return {
      conversationLimit: null,
      conversationsUsed: 0,
      submissionsLimit: null,
      submissionsUsed: 0,
      resetsAt: null,
      creditLimit: PRO_MAX_CREDITS_PER_MONTH,
      creditsUsed: monthly?.creditsUsed ?? 0,
      creditResetsAt: await getNextMonthResetDateISO(),
    };
  }

  const [{ count: total }] = await db
    .select({ count: count() })
    .from(conversations as any)
    .where(eq(conversations.userId, userId) as any);

  const usageDate = await getUsageDateKey();
  const [daily] = await db
    .select()
    .from(userDailyUsage as any)
    .where(and(eq(userDailyUsage.userId, userId), eq(userDailyUsage.usageDate, usageDate)) as any)
    .limit(1);

  const submissionsUsed = daily?.submissionCount ?? 0;

  return {
    conversationLimit: FREE_MAX_CONVERSATIONS,
    conversationsUsed: Number(total ?? 0),
    submissionsLimit: FREE_MAX_SUBMISSIONS_PER_DAY,
    submissionsUsed,
    resetsAt: await getNextResetDateISO(),
    creditLimit: null,
    creditsUsed: 0,
    creditResetsAt: null,
  };
}

export async function markTransactionAsSuccessful(reference: string) {
  await db
    .update(paystackTransactions as any)
    .set({
      status: "success",
      updatedAt: new Date(),
    })
    .where(eq(paystackTransactions.reference, reference) as any);
}

export async function calculateProExpiry(baseDate = new Date()): Promise<Date> {
  const expires = new Date(baseDate);
  expires.setUTCDate(expires.getUTCDate() + PRO_DURATION_IN_DAYS);
  return expires;
}

export async function serializeUserForClient(user: UserPlanInfo) {
  return Promise.resolve({
    id: user.id,
    email: user.email,
    plan: user.plan,
    planExpiresAt: user.planExpiresAt ? user.planExpiresAt.toISOString() : null,
    isPro: user.isPro,
    emailVerifiedAt: user.emailVerifiedAt ? user.emailVerifiedAt.toISOString() : null,
    isEmailVerified: Boolean(user.emailVerifiedAt),
  });
}

export type RenewalReminderCandidate = {
  id: string;
  email: string;
  planExpiresAt: Date;
};

export async function getUsersDueForRenewalReminder(daysBeforeExpiry = 3, limit = 50) {
  const now = new Date();
  const windowEnd = new Date(now);
  windowEnd.setUTCDate(windowEnd.getUTCDate() + Math.max(1, daysBeforeExpiry));

  const candidates = await db
    .select({
      id: users.id,
      email: users.email,
      planExpiresAt: users.planExpiresAt,
      lastRenewalReminderAt: users.lastRenewalReminderAt,
    })
    .from(users as any)
    .where(
      and(
        eq(users.plan, "pro") as any,
        isNotNull(users.planExpiresAt) as any,
        gt(users.planExpiresAt, now) as any,
        lte(users.planExpiresAt, windowEnd) as any,
        or(isNull(users.lastRenewalReminderAt), lt(users.lastRenewalReminderAt, now)) as any
      )
    )
    .limit(limit);

  return candidates
    .filter((candidate) => candidate.planExpiresAt)
    .map(
      (candidate) =>
        ({
          id: candidate.id,
          email: candidate.email,
          planExpiresAt: candidate.planExpiresAt!,
        }) satisfies RenewalReminderCandidate
    );
}

export async function markRenewalReminderSent(userId: string) {
  await db
    .update(users as any)
    .set({
      lastRenewalReminderAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId) as any);
}

export function getPlanManagementUrl() {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!base) {
    return null;
  }
  return `${base}/plan`;
}

export { FreemiumLimitError };

