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

/** Public checkout (demo) — creates subscription row and upgrades user if they exist. */
export const checkout = mutation({
  args: {
    email: v.string(),
    plan: v.union(v.literal("monthly"), v.literal("annual")),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (!email.includes("@")) {
      throw new Error("Invalid email address");
    }

    const nextBilling = new Date();
    if (args.plan === "monthly") {
      nextBilling.setMonth(nextBilling.getMonth() + 1);
    } else {
      nextBilling.setFullYear(nextBilling.getFullYear() + 1);
    }

    const subscriptionId = await ctx.db.insert("subscriptions", {
      userEmail: email,
      plan: args.plan,
      amount: args.amount,
      status: "active",
      nextBilling: nextBilling.toISOString(),
    });

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        subscriptionPlan: args.plan,
        subscriptionStatus: "active",
        role: user.role === "public" ? "analyst" : user.role,
      });
    }

    return { subscriptionId, email };
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
