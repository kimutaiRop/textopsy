ALTER TABLE "users" ADD COLUMN "plan" text DEFAULT 'free' NOT NULL;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan_expires_at" timestamp;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "paystack_customer_code" text;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "paystack_authorization_code" text;
--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "user_id" text;
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "conversations_user_id_idx" ON "conversations" USING btree ("user_id");
--> statement-breakpoint
CREATE TABLE "user_daily_usage" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"usage_date" date NOT NULL,
	"submission_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_daily_usage" ADD CONSTRAINT "user_daily_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "user_usage_user_date_idx" ON "user_daily_usage" USING btree ("user_id","usage_date");
--> statement-breakpoint
CREATE TABLE "paystack_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"reference" text NOT NULL,
	"authorization_url" text,
	"access_code" text,
	"amount" integer NOT NULL,
	"currency" text DEFAULT 'NGN' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"channel" text,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "paystack_transactions" ADD CONSTRAINT "paystack_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "paystack_transactions_reference_idx" ON "paystack_transactions" USING btree ("reference");
--> statement-breakpoint
CREATE INDEX "paystack_transactions_user_idx" ON "paystack_transactions" USING btree ("user_id");

