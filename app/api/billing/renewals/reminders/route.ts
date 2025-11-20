import { NextResponse } from "next/server";

import { getPlanManagementUrl, getUsersDueForRenewalReminder, markRenewalReminderSent } from "@/lib/billing";
import { sendPlanRenewalReminderEmail } from "@/lib/email";

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { daysBeforeExpiry = 3, limit = 25 } = await request.json().catch(() => ({}));

  const candidates = await getUsersDueForRenewalReminder(daysBeforeExpiry, limit);
  let sent = 0;

  for (const candidate of candidates) {
    try {
      await sendPlanRenewalReminderEmail({
        email: candidate.email,
        planName: "Pro",
        expiresAt: candidate.planExpiresAt.toUTCString(),
        renewalUrl: getPlanManagementUrl(),
      });
      await markRenewalReminderSent(candidate.id);
      sent += 1;
    } catch (error) {
      console.error("[renewal-reminder] Failed to notify", candidate.id, error);
    }
  }

  return NextResponse.json({ remindersSent: sent, attempted: candidates.length });
}

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return true;
  }

  const header = request.headers.get("authorization");
  return header === `Bearer ${cronSecret}`;
}


