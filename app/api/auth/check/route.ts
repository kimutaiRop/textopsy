import { NextResponse } from "next/server";
import { verifyToken, getAuthTokenFromRequest } from "@/lib/auth";
import { getUserPlanInfo, serializeUserForClient } from "@/lib/billing";

export async function GET(request: Request) {
  try {
    const token = getAuthTokenFromRequest(request);

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const dbUser = await getUserPlanInfo(user.id);
    if (!dbUser) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: await serializeUserForClient(dbUser),
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

