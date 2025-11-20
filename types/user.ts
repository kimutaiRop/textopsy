import { GenderOption } from "@/types/analysis";

export type StoredUser = {
  id: string;
  email: string;
  plan?: "free" | "pro";
  planExpiresAt?: string | null;
  isPro?: boolean;
  emailVerifiedAt?: string | null;
  isEmailVerified?: boolean;
  gender?: GenderOption | null;
};

