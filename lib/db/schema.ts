import { pgTable, text, timestamp, jsonb, integer, boolean, primaryKey, uuid, index, serial } from "drizzle-orm/pg-core";
import type { PlatformStat, Audience } from "@/lib/profile/types";
import type { CapabilityId } from "@/lib/agentTypes";
import type { LeadStatus, LeadSource, LeadReview, ResearchBrief } from "@/lib/leads/types";
import type { JobKind, JobStatus } from "@/lib/jobs/types";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user id
  email: text("email"),
  name: text("name"),
  workspaceName: text("workspace_name").default("My Workspace").notNull(),
  notifications: jsonb("notifications").$type<Record<string, boolean>>().default({}).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;

export const creatorProfile = pgTable("creator_profile", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  niche: text("niche"),
  bio: text("bio"),
  platforms: jsonb("platforms").$type<PlatformStat[]>().default([]).notNull(),
  audience: jsonb("audience").$type<Audience>().default({}).notNull(),
  tone: text("tone"),
  pastDeals: text("past_deals"),
  rateFloor: integer("rate_floor"),
  tiktokOpenId: text("tiktok_open_id"),
  tiktokDisplayName: text("tiktok_display_name"),
  tiktokAvatarUrl: text("tiktok_avatar_url"),
  tiktokFollowerCount: integer("tiktok_follower_count"),
  tiktokFollowingCount: integer("tiktok_following_count"),
  tiktokLikesCount: integer("tiktok_likes_count"),
  tiktokVideoCount: integer("tiktok_video_count"),
  tiktokAccessToken: text("tiktok_access_token"),
  tiktokRefreshToken: text("tiktok_refresh_token"),
  tiktokTokenExpiresAt: timestamp("tiktok_token_expires_at", { withTimezone: true }),
  tiktokConnectedAt: timestamp("tiktok_connected_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type CreatorProfile = typeof creatorProfile.$inferSelect;

export const agents = pgTable(
  "agents",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    name: text("name").notNull(),
    initials: text("initials").notNull(),
    role: text("role").notNull(),
    color: text("color").notNull(),
    avatarUrl: text("avatar_url"),
    status: text("status").notNull().default("waiting"),
    task: text("task"),
    score: integer("score"),
    goal: text("goal"),
    char: integer("char"),
    type: text("type").notNull().default("custom"),
    capabilities: jsonb("capabilities").$type<CapabilityId[]>().default([]).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.id] }) })
);

export type DbAgent = typeof agents.$inferSelect;

export const teams = pgTable(
  "teams",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    name: text("name").notNull(),
    icon: text("icon"),
    iconBg: text("icon_bg"),
    description: text("description"),
    goal: text("goal"),
    members: jsonb("members").$type<string[]>().default([]).notNull(),
    activity: jsonb("activity").$type<unknown[]>().default([]).notNull(),
    meetings: integer("meetings").notNull().default(0),
    pipeline: integer("pipeline").notNull().default(0),
    leads: integer("leads").notNull().default(0),
    template: text("template"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.id] }) })
);

export type DbTeam = typeof teams.$inferSelect;

export const agentConfig = pgTable(
  "agent_config",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    agentId: text("agent_id").notNull(),
    name: text("name"),
    initials: text("initials"),
    color: text("color"),
    avatarUrl: text("avatar_url"),
    role: text("role"),
    goal: text("goal"),
    permissions: jsonb("permissions"),
    settings: jsonb("settings"),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.agentId] }) })
);

export const agentStates = pgTable(
  "agent_states",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    agentId: text("agent_id").notNull(),
    removed: boolean("removed").notNull().default(false),
    paused: boolean("paused").notNull().default(false),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.agentId] }) })
);

export const teamMembers = pgTable(
  "team_members",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    teamId: text("team_id").notNull(),
    members: jsonb("members").$type<string[]>().default([]).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.userId, t.teamId] }) })
);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    agentId: text("agent_id"),
    name: text("name").notNull(),
    title: text("title"),
    company: text("company"),
    email: text("email"),
    status: text("status").$type<LeadStatus>().notNull().default("new"),
    score: integer("score"),
    source: text("source").$type<LeadSource>().notNull().default("manual"),
    review: text("review").$type<LeadReview>().notNull().default("accepted"),
    profileUrl: text("profile_url"),
    platform: text("platform"),
    research: jsonb("research").$type<ResearchBrief | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    userAgentIdx: index("leads_user_agent_idx").on(t.userId, t.agentId),
    userReviewIdx: index("leads_user_review_idx").on(t.userId, t.review),
  })
);

export type DbLead = typeof leads.$inferSelect;

export const activity = pgTable(
  "activity",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    agentId: text("agent_id"),
    type: text("type").notNull(),
    leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
    text: text("text").notNull(),
    dismissed: boolean("dismissed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ userCreatedIdx: index("activity_user_created_idx").on(t.userId, t.createdAt) })
);

export type DbActivity = typeof activity.$inferSelect;

export const jobs = pgTable(
  "jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    agentId: text("agent_id"),
    kind: text("kind").$type<JobKind>().notNull(),
    status: text("status").$type<JobStatus>().notNull().default("queued"),
    params: jsonb("params").$type<Record<string, unknown>>().default({}).notNull(),
    result: jsonb("result").$type<Record<string, unknown> | null>(),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (t) => ({ userStatusIdx: index("jobs_user_status_idx").on(t.userId, t.status) })
);

export type DbJob = typeof jobs.$inferSelect;

export const outreachDrafts = pgTable(
  "outreach_drafts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    agentId: text("agent_id"),
    leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
    subject: text("subject"),
    body: text("body").notNull(),
    rationale: text("rationale"),
    kind: text("kind").$type<"outreach" | "follow-up">().notNull().default("outreach"),
    status: text("status").$type<"draft" | "sent">().notNull().default("draft"),
    dismissed: boolean("dismissed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (t) => ({ userCreatedIdx: index("outreach_drafts_user_idx").on(t.userId, t.createdAt) })
);

export type DbOutreachDraft = typeof outreachDrafts.$inferSelect;

export const proposals = pgTable(
  "proposals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    agentId: text("agent_id"),
    leadId: uuid("lead_id").notNull().references(() => leads.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    products: jsonb("products").$type<string[]>().default([]).notNull(),
    status: text("status").$type<"draft" | "sent">().notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (t) => ({ userCreatedIdx: index("proposals_user_idx").on(t.userId, t.createdAt) })
);

export type DbProposal = typeof proposals.$inferSelect;

export const meetings = pgTable(
  "meetings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    agentId: text("agent_id"),
    leadId: uuid("lead_id").references(() => leads.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    kind: text("kind").$type<"call" | "shoot" | "deliverable">().notNull().default("call"),
    whenAt: timestamp("when_at", { withTimezone: true }).notNull(),
    whenLabel: text("when_label"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ userWhenIdx: index("meetings_user_when_idx").on(t.userId, t.whenAt) })
);

export type DbMeeting = typeof meetings.$inferSelect;

export const messages = pgTable(
  "messages",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    agentId: text("agent_id"),
    who: text("who").$type<"ai" | "me">().notNull(),
    text: text("text").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ userIdIdx: index("messages_user_id_idx").on(t.userId, t.id) })
);

export type DbMessage = typeof messages.$inferSelect;

// No userId here on purpose — this guards a public, unauthenticated endpoint (demo booking) by IP.
export const demoBookingAttempts = pgTable(
  "demo_booking_attempts",
  {
    id: serial("id").primaryKey(),
    ip: text("ip").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({ ipCreatedIdx: index("demo_booking_attempts_ip_created_idx").on(t.ip, t.createdAt) })
);
