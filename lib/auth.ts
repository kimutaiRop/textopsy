import "server-only";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";
const EMAIL_VERIFICATION_TOKEN_TTL_HOURS = Math.max(
  1,
  Number.parseInt(process.env.EMAIL_VERIFICATION_TOKEN_TTL_HOURS ?? "24", 10) || 24
);
const EMAIL_VERIFICATION_EXPIRES_IN = `${EMAIL_VERIFICATION_TOKEN_TTL_HOURS}h`;

export interface AuthUser {
  id: string;
  email: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

type EmailVerificationPayload = AuthUser & { scope: "verify-email" };

export function generateEmailVerificationToken(user: AuthUser): string {
  const payload: EmailVerificationPayload = {
    id: user.id,
    email: user.email,
    scope: "verify-email",
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: EMAIL_VERIFICATION_EXPIRES_IN,
  });
}

export function decodeEmailVerificationToken(token: string): EmailVerificationPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as EmailVerificationPayload;
    if (decoded.scope !== "verify-email") {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

export function getEmailVerificationTtlHours() {
  return EMAIL_VERIFICATION_TOKEN_TTL_HOURS;
}

export function getAuthTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  return null;
}

