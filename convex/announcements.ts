import { internal } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./lib/session";

const recipientType = v.union(
  v.literal("all"),
  v.literal("analysts"),
  v.literal("free_users"),
);

const MAX_USERS = 500;

async function countRecipients(
  ctx: QueryCtx | MutationCtx,
  recipients: "all" | "analysts" | "free_users",
) {
  const users = await ctx.db.query("users").take(MAX_USERS);
  const active = users.filter((u) => u.isActive);

  if (recipients === "all") return active.length;
  if (recipients === "analysts") {
    return active.filter((u) => u.role === "analyst" || u.role === "admin").length;
  }
  return active.filter(
    (u) => u.role === "public" || u.subscriptionPlan === "free",
  ).length;
}

export const recipientCounts = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.sessionToken, ["admin"]);
    const [all, analysts, free_users] = await Promise.all([
      countRecipients(ctx, "all"),
      countRecipients(ctx, "analysts"),
      countRecipients(ctx, "free_users"),
    ]);
    return { all, analysts, free_users };
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
      .query("announcements")
      .withIndex("by_sentAt")
      .order("desc")
      .take(limit);
  },
});

export const create = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    title: v.string(),
    message: v.string(),
    recipients: recipientType,
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.sessionToken, ["admin"]);
    const recipientCount = await countRecipients(ctx, args.recipients);
    const announcementId = await ctx.db.insert("announcements", {
      title: args.title.trim(),
      message: args.message.trim(),
      recipients: args.recipients,
      recipientCount,
      emailsSent: 0,
      emailsFailed: 0,
      sentAt: new Date().toISOString(),
    });

    await ctx.scheduler.runAfter(0, internal.email.sendAnnouncementBatch, {
      announcementId,
      title: args.title.trim(),
      message: args.message.trim(),
      recipients: args.recipients,
    });

    return announcementId;
  },
});
