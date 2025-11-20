import { NextResponse } from "next/server";

import { getAuthTokenFromRequest, verifyToken } from "@/lib/auth";
import { getUsageSnapshot, getUserPlanInfo } from "@/lib/billing";

export async function GET(request: Request) {
  const token = getAuthTokenFromRequest(request);
  if (!token) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const authUser = verifyToken(token);
  if (!authUser) {
    return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
  }

  const planInfo = await getUserPlanInfo(authUser.id);
  if (!planInfo) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const usage = await getUsageSnapshot(planInfo.id, planInfo.isPro);

  return NextResponse.json({
    plan: planInfo.plan,
    isPro: planInfo.isPro,
    planExpiresAt: planInfo.planExpiresAt ? planInfo.planExpiresAt.toISOString() : null,
    conversationLimit: usage.conversationLimit,
    conversationsUsed: usage.conversationsUsed,
    submissionsLimit: usage.submissionsLimit,
    submissionsUsed: usage.submissionsUsed,
    resetsAt: usage.resetsAt,
    creditLimit: usage.creditLimit,
    creditsUsed: usage.creditsUsed,
    creditResetsAt: usage.creditResetsAt,
  });
}

