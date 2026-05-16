import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export const SeverityType = v.union(v.literal('LOW'), v.literal('MEDIUM'), v.literal('HIGH'), v.literal('CRITICAL'));
export const PlatformType = v.union(v.literal('whatsapp'), v.literal('sms'), v.literal('email'), v.literal('facebook'), v.literal('instagram'), v.literal('other'));
export const StatusType = v.union(v.literal('pending'), v.literal('verified'), v.literal('removed'));
export const UserRoleType = v.union(v.literal('public'), v.literal('analyst'), v.literal('admin'));

export default defineSchema({
  ...authTables,

  reports: defineTable({
    content: v.string(),
    platform: PlatformType,
    region: v.optional(v.string()),
    scamType: v.string(),
    severity: SeverityType,
    aiScore: v.number(),
    aiReasoning: v.string(),
    attackPatterns: v.array(v.string()),
    recommendations: v.array(v.string()),
    votesScam: v.number(),
    votesSuspicious: v.number(),
    votesSafe: v.number(),
    totalVotes: v.number(),
    createdAt: v.string(), // Consider using Convex's built-in `_creationTime` later
    status: StatusType,
  }),

  campaigns: defineTable({
    name: v.string(),
    scamType: v.string(),
    severity: SeverityType,
    reportCount: v.number(),
    regionsAffected: v.array(v.string()),
    spreadVelocity: v.union(v.literal('slow'), v.literal('medium'), v.literal('fast')),
    trend: v.union(v.literal('rising'), v.literal('stable'), v.literal('declining')),
    hourlyRate: v.number(),
    firstSeen: v.string(),
    lastSeen: v.string(),
  }),

  supportMessages: defineTable({
    subject: v.string(),
    message: v.string(),
    userEmail: v.string(),
    status: v.union(v.literal('new'), v.literal('replied'), v.literal('closed')),
    priority: v.union(v.literal('low'), v.literal('medium'), v.literal('high')),
    createdAt: v.string(),
    replies: v.array(
      v.object({
        text: v.string(),
        isAdmin: v.boolean(),
        createdAt: v.string(),
      })
    ),
  }),

  subscriptions: defineTable({
    userEmail: v.string(),
    plan: v.union(v.literal('monthly'), v.literal('annual')),
    amount: v.number(),
    status: v.union(v.literal('active'), v.literal('cancelled'), v.literal('past_due'), v.literal('expired')),
    nextBilling: v.string(),
  }),
  // Overwriting core users table smoothly for the prototype
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),

    // Prototype specific fields (made optional so initial signup never errors out)
    username: v.optional(v.string()),
    role: v.optional(UserRoleType),
    reportsSubmitted: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  }).index("email", ["email"]),
});