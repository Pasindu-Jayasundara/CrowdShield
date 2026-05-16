import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./lib/session";

export const subscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (!email.includes("@")) {
      throw new Error("Invalid email address");
    }

    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      if (existing.isActive) {
        return { subscribed: true, alreadySubscribed: true };
      }
      await ctx.db.patch(existing._id, { isActive: true });
      return { subscribed: true, alreadySubscribed: false };
    }

    await ctx.db.insert("newsletterSubscribers", {
      email,
      subscribedAt: new Date().toISOString(),
      isActive: true,
    });
    return { subscribed: true, alreadySubscribed: false };
  },
});

export const subscriberCount = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.sessionToken, ["admin"]);
    const subs = await ctx.db.query("newsletterSubscribers").take(500);
    return subs.filter((s) => s.isActive).length;
  },
});

export const list = query({
  args: {
    sessionToken: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.sessionToken, ["admin"]);
    const limit = Math.min(args.limit ?? 20, 50);
    return await ctx.db
      .query("newsletters")
      .withIndex("by_sentAt")
      .order("desc")
      .take(limit);
  },
});

export const send = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    subject: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.sessionToken, ["admin"]);
    const subscribers = await ctx.db.query("newsletterSubscribers").take(500);
    const subscriberCount = subscribers.filter((s) => s.isActive).length;

    return await ctx.db.insert("newsletters", {
      subject: args.subject.trim(),
      content: args.content.trim(),
      sentAt: new Date().toISOString(),
      subscriberCount,
      openRate: 0,
      clickRate: 0,
    });
  },
});
