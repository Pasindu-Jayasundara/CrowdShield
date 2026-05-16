import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define reusable literal unions based on your types
const SeverityType = v.union(v.literal('LOW'), v.literal('MEDIUM'), v.literal('HIGH'), v.literal('CRITICAL'));
const PlatformType = v.union(v.literal('whatsapp'), v.literal('sms'), v.literal('email'), v.literal('facebook'), v.literal('instagram'), v.literal('other'));
const StatusType = v.union(v.literal('pending'), v.literal('verified'), v.literal('false_positive'), v.literal('removed'));
const UserRoleType = v.union(v.literal('public'), v.literal('analyst'), v.literal('admin'));

export default defineSchema({
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

  users: defineTable({
    email: v.string(),
    username: v.string(),
    role: UserRoleType,
    subscriptionPlan: v.string(),
    subscriptionStatus: v.string(),
    reportsSubmitted: v.number(),
    createdAt: v.string(),
    isActive: v.boolean(),
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
});