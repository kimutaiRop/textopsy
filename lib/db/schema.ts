import { pgTable, text, integer, timestamp, json, index, date, uniqueIndex } from "drizzle-orm/pg-core";
import type { ConversationContext } from "@/types/analysis";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey().notNull(),
    email: text("email").notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    plan: text("plan").default("free").notNull(),
    planExpiresAt: timestamp("plan_expires_at"),
    paystackCustomerCode: text("paystack_customer_code"),
    paystackAuthorizationCode: text("paystack_authorization_code"),
    emailVerifiedAt: timestamp("email_verified_at"),
    lastRenewalReminderAt: timestamp("last_renewal_reminder_at"),
  },
  (table) => ({
    emailIdx: index("users_email_idx").on(table.email),
  })
);

export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey().notNull(),
    sessionId: text("session_id").notNull(),
    title: text("title"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    context: json("context").$type<ConversationContext | null>(),
    userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  },
  (table) => ({
    sessionIdIdx: index("conversations_session_id_idx").on(table.sessionId),
    createdAtIdx: index("conversations_created_at_idx").on(table.createdAt),
    userIdIdx: index("conversations_user_id_idx").on(table.userId),
  })
);

export const conversationInputs = pgTable(
  "conversation_inputs",
  {
    id: text("id").primaryKey().notNull(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    inputType: text("input_type").notNull(), // "image" | "text"
    inputText: text("input_text"),
    inputImageBase64: text("input_image_base64"),
    inputImageMimeType: text("input_image_mime_type"),
    order: integer("order").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    conversationIdOrderIdx: index("conversation_inputs_conversation_id_order_idx").on(
      table.conversationId,
      table.order
    ),
  })
);

export const analyses = pgTable(
  "analyses",
  {
    id: text("id").primaryKey().notNull(),
    conversationId: text("conversation_id").references(() => conversations.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    // Input data
    inputType: text("input_type").notNull(), // "image" | "text"
    inputText: text("input_text"),
    inputImageBase64: text("input_image_base64"),
    inputImageMimeType: text("input_image_mime_type"),
    // Persona used
    persona: text("persona").notNull(),
    // Analysis results
    cringeScore: integer("cringe_score").notNull(),
    interestLevel: integer("interest_level").notNull(),
    responseSpeedRating: text("response_speed_rating").notNull(),
    redFlags: text("red_flags").array().default([]).notNull(),
    greenFlags: text("green_flags").array().default([]).notNull(),
    diagnosis: text("diagnosis").notNull(),
    detailedAnalysis: text("detailed_analysis").notNull(),
    suggestedReplies: json("suggested_replies").notNull(), // Array of SuggestedReply objects
  },
  (table) => ({
    conversationIdIdx: index("analyses_conversation_id_idx").on(table.conversationId),
    createdAtIdx: index("analyses_created_at_idx").on(table.createdAt),
    personaIdx: index("analyses_persona_idx").on(table.persona),
  })
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: text("id").primaryKey().notNull(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // "user" | "assistant"
    content: text("content").notNull(),
    persona: text("persona"), // Persona used for assistant messages
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    conversationIdIdx: index("chat_messages_conversation_id_idx").on(table.conversationId),
    createdAtIdx: index("chat_messages_created_at_idx").on(table.createdAt),
  })
);

export const userDailyUsage = pgTable(
  "user_daily_usage",
  {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    usageDate: date("usage_date").notNull(),
    submissionCount: integer("submission_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userDateIdx: uniqueIndex("user_usage_user_date_idx").on(table.userId, table.usageDate),
  })
);

export const userMonthlyCredits = pgTable(
  "user_monthly_credits",
  {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    usageMonth: text("usage_month").notNull(),
    creditsUsed: integer("credits_used").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userMonthIdx: uniqueIndex("user_monthly_credits_user_month_idx").on(table.userId, table.usageMonth),
  })
);

export const paystackTransactions = pgTable(
  "paystack_transactions",
  {
    id: text("id").primaryKey().notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    reference: text("reference").notNull(),
    authorizationUrl: text("authorization_url"),
    accessCode: text("access_code"),
    amount: integer("amount").notNull(),
    currency: text("currency").default("NGN").notNull(),
    status: text("status").default("pending").notNull(),
    channel: text("channel"),
    metadata: json("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    referenceIdx: index("paystack_transactions_reference_idx").on(table.reference),
    userIdx: index("paystack_transactions_user_idx").on(table.userId),
  })
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type ConversationInput = typeof conversationInputs.$inferSelect;
export type NewConversationInput = typeof conversationInputs.$inferInsert;
export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type UserDailyUsage = typeof userDailyUsage.$inferSelect;
export type UserMonthlyCredits = typeof userMonthlyCredits.$inferSelect;
export type PaystackTransaction = typeof paystackTransactions.$inferSelect;

