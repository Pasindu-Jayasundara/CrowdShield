import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export const UserRoleType = v.union(v.literal('public'), v.literal('analyst'), v.literal('admin'));

export default defineSchema({
  ...authTables,

  // Custom project tables
  reports: defineTable({
    content: v.string(),
    platform: v.union(v.literal('whatsapp'), v.literal('sms'), v.literal('email'), v.literal('facebook'), v.literal('instagram'), v.literal('other')),
    severity: v.union(v.literal('LOW'), v.literal('MEDIUM'), v.literal('HIGH'), v.literal('CRITICAL')),
    status: v.union(v.literal('pending'), v.literal('verified'), v.literal('false_positive'), v.literal('removed')),
    userId: v.id("users"),
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
  
  subscriptions: defineTable({
    userId: v.id("users"),
    plan: v.string(),
    status: v.string(),
    expirationDate: v.optional(v.number()),
  }).index("userId", ["userId"]),
  
  invitations: defineTable({
    email: v.string(),
    token: v.string(),
    expiresAt: v.number(),
    invitedBy: v.id("users"),
  }).index("email", ["email"]).index("token", ["token"]),
});