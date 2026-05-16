import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query to get all reports
export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("reports").order("desc").collect();
  },
});

// Mutation to add a new report
export const create = mutation({
  args: {
    content: v.string(),
    platform: v.union(v.literal('whatsapp'), v.literal('sms'), v.literal('email'), v.literal('facebook'), v.literal('instagram'), v.literal('other')),
    region: v.optional(v.string()),
    scamType: v.string(),
    severity: v.union(v.literal('LOW'), v.literal('MEDIUM'), v.literal('HIGH'), v.literal('CRITICAL')),
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