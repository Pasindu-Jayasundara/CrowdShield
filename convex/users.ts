import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./lib/session";

const UserRoleType = v.union(
  v.literal("public"),
  v.literal("analyst"),
  v.literal("admin"),
);

const MAX_USERS = 500;

export const list = query({
  args: {
    sessionToken: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.sessionToken, ["admin"]);
    const limit = Math.min(args.limit ?? 100, 100);
    return await ctx.db.query("users").order("desc").take(limit);
  },
});

export const get = query({
  args: {
    sessionToken: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.sessionToken, ["admin"]);
    return await ctx.db.get("users", args.userId);
  },
});

export const stats = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.sessionToken, ["admin"]);
    const users = await ctx.db.query("users").take(MAX_USERS);
    const analysts = users.filter((u) => u.role === "analyst").length;
    const active = users.filter((u) => u.isActive).length;
    return {
      total: users.length,
      analysts,
      conversionRate:
        users.length > 0
          ? Math.round((analysts / users.length) * 1000) / 10
          : 0,
      active,
    };
  },
});

export const update = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    userId: v.id("users"),
    role: v.optional(UserRoleType),
    isActive: v.optional(v.boolean()),
    subscriptionPlan: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.sessionToken, ["admin"]);
    const user = await ctx.db.get("users", args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    const patch: {
      role?: "public" | "analyst" | "admin";
      isActive?: boolean;
      subscriptionPlan?: string;
      subscriptionStatus?: string;
    } = {};

    if (args.role !== undefined) patch.role = args.role;
    if (args.isActive !== undefined) patch.isActive = args.isActive;
    if (args.subscriptionPlan !== undefined) {
      patch.subscriptionPlan = args.subscriptionPlan;
    }
    if (args.subscriptionStatus !== undefined) {
      patch.subscriptionStatus = args.subscriptionStatus;
    }

    if (Object.keys(patch).length === 0) {
      throw new Error("No fields to update");
    }

    await ctx.db.patch("users", args.userId, patch);
    return await ctx.db.get("users", args.userId);
  },
});
