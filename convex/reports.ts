import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { PlatformType, SeverityType, StatusType } from "./schema";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("reports").order("desc").collect();
  },
});


export const createReport = mutation({
  args: {
    content: v.string(),
    platform: PlatformType,
    region: v.optional(v.string()),
    scamType: v.string(),
    severity: SeverityType,
    aiScore: v.number(),
    aiReasoning: v.string(),
    attackPatterns: v.array(v.string()),
    recommendations: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const newReportId = await ctx.db.insert("reports", {
      ...args,
      votesScam: 0,
      votesSuspicious: 0,
      votesSafe: 0,
      totalVotes: 0,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    return newReportId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("reports"),
    status: StatusType,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const remove = mutation({
  args: { id: v.id("reports") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
