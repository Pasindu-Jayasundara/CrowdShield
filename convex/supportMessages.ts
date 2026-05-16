import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 50);
    return await ctx.db.query("supportMessages").order("desc").take(limit);
  },
});

export const create = mutation({
  args: {
    subject: v.string(),
    message: v.string(),
    userEmail: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("supportMessages", {
      ...args,
      status: "new",
      createdAt: new Date().toISOString(),
      replies: [],
    });
  },
});

export const reply = mutation({
  args: {
    messageId: v.id("supportMessages"),
    text: v.string(),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get("supportMessages", args.messageId);
    if (!msg) {
      throw new Error("Message not found");
    }
    const newReply = {
      text: args.text,
      isAdmin: args.isAdmin,
      createdAt: new Date().toISOString(),
    };
    await ctx.db.patch("supportMessages", args.messageId, {
      replies: [...msg.replies, newReply],
      status: args.isAdmin ? "replied" : msg.status,
    });
  },
});

export const updateStatus = mutation({
  args: {
    messageId: v.id("supportMessages"),
    status: v.union(v.literal("new"), v.literal("replied"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    const msg = await ctx.db.get("supportMessages", args.messageId);
    if (!msg) {
      throw new Error("Message not found");
    }
    await ctx.db.patch("supportMessages", args.messageId, {
      status: args.status,
    });
  },
});
