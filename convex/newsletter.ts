import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./lib/session";

export const subscribe = mutation({
  args: {
    email: v.string(),
    wantsCriticalAlerts: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (!email.includes("@")) {
      throw new Error("Invalid email address");
    }

    const wantsCriticalAlerts = args.wantsCriticalAlerts ?? true;

    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      if (existing.isActive) {
        await ctx.db.patch(existing._id, { wantsCriticalAlerts });
        return { subscribed: true, alreadySubscribed: true };
      }
      await ctx.db.patch(existing._id, { isActive: true, wantsCriticalAlerts });
      return { subscribed: true, alreadySubscribed: false };
    }

    await ctx.db.insert("newsletterSubscribers", {
      email,
      subscribedAt: new Date().toISOString(),
      isActive: true,
      wantsCriticalAlerts,
    });
    return { subscribed: true, alreadySubscribed: false };
  },
});

export const unsubscribe = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const existing = await ctx.db
      .query("newsletterSubscribers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) {
      await ctx.db.patch(existing._id, { isActive: false });
    }
    return { unsubscribed: true };
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
    const activeCount = subscribers.filter((s) => s.isActive).length;

    const newsletterId = await ctx.db.insert("newsletters", {
      subject: args.subject.trim(),
      content: args.content.trim(),
      sentAt: new Date().toISOString(),
      subscriberCount: activeCount,
      emailsSent: 0,
      emailsFailed: 0,
      openRate: 0,
      clickRate: 0,
    });

    await ctx.scheduler.runAfter(0, internal.email.sendNewsletterBatch, {
      newsletterId,
      subject: args.subject.trim(),
      content: args.content.trim(),
    });

    return newsletterId;
  },
});
