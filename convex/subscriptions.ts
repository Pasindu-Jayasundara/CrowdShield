import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./lib/session";

export const list = query({
  args: {
    sessionToken: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.sessionToken, ["admin"]);
    const limit = Math.min(args.limit ?? 100, 100);
    return await ctx.db.query("subscriptions").order("desc").take(limit);
  },
});

export const stats = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.sessionToken, ["admin"]);
    const subs = await ctx.db.query("subscriptions").take(500);
    const active = subs.filter((s) => s.status === "active");
    const pastDue = subs.filter((s) => s.status === "past_due");
    const cancelled = subs.filter((s) => s.status === "cancelled");
    const mrr = active.reduce((sum, s) => {
      return sum + (s.plan === "annual" ? s.amount / 12 : s.amount);
    }, 0);
    const churnRate =
      subs.length > 0
        ? Math.round((cancelled.length / subs.length) * 1000) / 10
        : 0;

    return {
      activeCount: active.length,
      mrr: Math.round(mrr),
      pastDueCount: pastDue.length,
      churnRate,
    };
  },
});

export const updateStatus = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    subscriptionId: v.id("subscriptions"),
    status: v.union(
      v.literal("active"),
      v.literal("cancelled"),
      v.literal("past_due"),
      v.literal("expired"),
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.sessionToken, ["admin"]);
    const sub = await ctx.db.get("subscriptions", args.subscriptionId);
    if (!sub) {
      throw new Error("Subscription not found");
    }
    await ctx.db.patch("subscriptions", args.subscriptionId, {
      status: args.status,
    });
  },
});
