import { NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/admin";
import { getUserPlanInfo } from "@/lib/billing";

export async function GET(request: Request) {
  try {
    const adminUser = await getAdminUserFromRequest(request);
    
    if (!adminUser) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const userInfo = await getUserPlanInfo(adminUser.id);
    if (!userInfo) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      admin: true,
      user: {
        id: userInfo.id,
        email: userInfo.email,
        plan: userInfo.plan,
        isPro: userInfo.isPro,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

