import "server-only";
import { verifyToken, getAuthTokenFromRequest, type AuthUser } from "@/lib/auth";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";

export function isAdminEmail(email: string): boolean {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || "";
  const adminEmails = adminEmailsEnv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  
  return adminEmails.includes(email.toLowerCase().trim());
}

export async function getAdminUserFromRequest(request: Request): Promise<AuthUser | null> {
  const token = getAuthTokenFromRequest(request);
  if (!token) {
    return null;
  }

  const user = verifyToken(token);
  if (!user) {
    return null;
  }

  // Check if user is admin by email
  if (!isAdminEmail(user.email)) {
    return null;
  }

  return user;
}

export async function requireAdmin(request: Request): Promise<AuthUser> {
  const adminUser = await getAdminUserFromRequest(request);
  if (!adminUser) {
    throw new Error("Unauthorized: Admin access required");
  }
  return adminUser;
}

