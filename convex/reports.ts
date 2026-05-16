import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  platformValidator,
  reportStatusValidator,
  severityValidator,
  voteTypeValidator,
} from "./lib/validators";

const MAX_REPORTS = 500;

export const list = query({
  args: {
    severity: v.optional(severityValidator),
    regions: v.optional(v.array(v.string())),
    status: v.optional(reportStatusValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? MAX_REPORTS, MAX_REPORTS);

    if (args.severity) {
      const reports = await ctx.db
        .query("reports")
        .withIndex("by_severity", (q) => q.eq("severity", args.severity!))
        .order("desc")
        .take(limit);
      return filterReports(reports, args.regions, args.status);
    }

    if (args.status) {
      const reports = await ctx.db
        .query("reports")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
      return filterReports(reports, args.regions, undefined);
    }

    const reports = await ctx.db
      .query("reports")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
    return filterReports(reports, args.regions, args.status);
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("reports")
      .withIndex("by_createdAt")
      .order("desc")
      .take(MAX_REPORTS);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db.query("reports").take(MAX_REPORTS);
    const campaigns = await ctx.db.query("campaigns").take(100);
    const oneHourAgo = Date.now() - 3600000;
    const reportsLastHour = reports.filter(
      (r) => new Date(r.createdAt).getTime() >= oneHourAgo,
    ).length;
    const regions = new Set(
      reports.map((r) => r.region).filter((r): r is string => Boolean(r)),
    );
    const criticalCount = reports.filter((r) => r.severity === "CRITICAL").length;

    return {
      activeThreats: reports.filter((r) => r.status !== "removed").length,
      reportsLastHour,
      campaignsDetected: campaigns.length,
      regionsAtRisk: regions.size,
      criticalCount,
    };
  },
});

export const create = mutation({
  args: {
    content: v.string(),
    platform: platformValidator,
    region: v.optional(v.string()),
    scamType: v.string(),
    severity: severityValidator,
    aiScore: v.number(),
    aiReasoning: v.string(),
    attackPatterns: v.array(v.string()),
    recommendations: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const createdAt = new Date().toISOString();
    return await ctx.db.insert("reports", {
      ...args,
      votesScam: 0,
      votesSuspicious: 0,
      votesSafe: 0,
      totalVotes: 0,
      status: "pending",
      createdAt,
    });
  },
});

export const vote = mutation({
  args: {
    reportId: v.id("reports"),
    voteType: voteTypeValidator,
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get("reports", args.reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    const patch =
      args.voteType === "scam"
        ? { votesScam: report.votesScam + 1 }
        : args.voteType === "suspicious"
          ? { votesSuspicious: report.votesSuspicious + 1 }
          : { votesSafe: report.votesSafe + 1 };

    await ctx.db.patch("reports", args.reportId, {
      ...patch,
      totalVotes: report.totalVotes + 1,
    });
  },
});

export const updateStatus = mutation({
  args: {
    reportId: v.id("reports"),
    status: reportStatusValidator,
  },
  handler: async (ctx, args) => {
    const report = await ctx.db.get("reports", args.reportId);
    if (!report) {
      throw new Error("Report not found");
    }
    await ctx.db.patch("reports", args.reportId, { status: args.status });
  },
});

function filterReports<T extends { region?: string; status: string }>(
  reports: T[],
  regions: string[] | undefined,
  status: string | undefined,
): T[] {
  let result = reports;
  if (regions && regions.length > 0) {
    const normalized = regions.map((r) => r.toLowerCase());
    result = result.filter(
      (r) => r.region && normalized.includes(r.region.toLowerCase()),
    );
  }
  if (status) {
    result = result.filter((r) => r.status === status);
  }
  return result;
}
