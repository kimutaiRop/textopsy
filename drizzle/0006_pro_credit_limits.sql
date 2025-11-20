CREATE TABLE IF NOT EXISTS "user_monthly_credits" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "usage_month" text NOT NULL,
  "credits_used" integer NOT NULL DEFAULT 0,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_monthly_credits_user_month_idx"
  ON "user_monthly_credits" ("user_id", "usage_month");

