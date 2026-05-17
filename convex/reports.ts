import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./lib/session";
import { computeReportScores } from "./lib/threatScore";
import {
  platformValidator,
  reportStatusValidator,
  severityValidator,
  voteTypeValidator,
} from "./lib/validators";

const MAX_REPORTS = 500;

async function loadScoreContext(ctx: QueryCtx | MutationCtx) {
  const [campaigns, allReports] = await Promise.all([
    ctx.db.query("campaigns").take(50),
    ctx.db.query("reports").take(MAX_REPORTS),
  ]);
  return { campaigns, allReports };
}

function enrichReport<T extends Doc<"reports">>(
  report: T,
  campaigns: Awaited<ReturnType<typeof loadScoreContext>>["campaigns"],
  allReports: Awaited<ReturnType<typeof loadScoreContext>>["allReports"],
) {
  const scores = computeReportScores(report, campaigns, allReports);
  return { ...report, ...scores };
}

export const list = query({
  args: {
    severity: v.optional(severityValidator),
    regions: v.optional(v.array(v.string())),
    status: v.optional(reportStatusValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? MAX_REPORTS, MAX_REPORTS);
    const { campaigns, allReports } = await loadScoreContext(ctx);

    if (args.severity) {
      const reports = await ctx.db
        .query("reports")
        .withIndex("by_severity", (q) => q.eq("severity", args.severity!))
        .order("desc")
        .take(limit);
      return filterReports(reports, args.regions, args.status).map((r) =>
        enrichReport(r, campaigns, allReports),
      );
    }

    if (args.status) {
      const reports = await ctx.db
        .query("reports")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(limit);
      return filterReports(reports, args.regions, undefined).map((r) =>
        enrichReport(r, campaigns, allReports),
      );
    }

    const reports = await ctx.db
      .query("reports")
      .withIndex("by_createdAt")
      .order("desc")
      .take(limit);
    return filterReports(reports, args.regions, args.status).map((r) =>
      enrichReport(r, campaigns, allReports),
    );
  },
});

export const get = query({
  args: {},
  handler: async (ctx) => {
    const { campaigns, allReports } = await loadScoreContext(ctx);
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_createdAt")
      .order("desc")
      .take(MAX_REPORTS);
    return reports.map((r) => enrichReport(r, campaigns, allReports));
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
    const { campaigns, allReports } = await loadScoreContext(ctx);

    const draft = {
      ...args,
      votesScam: 0,
      votesSuspicious: 0,
      votesSafe: 0,
      totalVotes: 0,
      status: "pending" as const,
      createdAt,
    };

    const scores = computeReportScores(draft, campaigns, [
      ...allReports,
      { scamType: args.scamType, region: args.region, createdAt },
    ]);

    return await ctx.db.insert("reports", {
      ...draft,
      communityScore: scores.communityScore,
      trendScore: scores.trendScore,
      threatScore: scores.threatScore,
      severity: scores.severity,
    });
  },
});

export const getMyVote = query({
  args: {
    reportId: v.id("reports"),
    voterId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reportVotes")
      .withIndex("by_report_and_voter", (q) =>
        q.eq("reportId", args.reportId).eq("voterId", args.voterId),
      )
      .unique();
    return existing?.voteType ?? null;
  },
});

export const vote = mutation({
  args: {
    reportId: v.id("reports"),
    voterId: v.string(),
    voteType: voteTypeValidator,
  },
  handler: async (ctx, args) => {
    if (!args.voterId.trim()) {
      throw new Error("Invalid voter id");
    }

    const existing = await ctx.db
      .query("reportVotes")
      .withIndex("by_report_and_voter", (q) =>
        q.eq("reportId", args.reportId).eq("voterId", args.voterId),
      )
      .unique();

    if (existing) {
      throw new Error("You have already voted on this report");
    }

    const report = await ctx.db.get("reports", args.reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    await ctx.db.insert("reportVotes", {
      reportId: args.reportId,
      voterId: args.voterId,
      voteType: args.voteType,
      createdAt: new Date().toISOString(),
    });

    const updated = {
      ...report,
      votesScam: report.votesScam + (args.voteType === "scam" ? 1 : 0),
      votesSuspicious:
        report.votesSuspicious + (args.voteType === "suspicious" ? 1 : 0),
      votesSafe: report.votesSafe + (args.voteType === "safe" ? 1 : 0),
      totalVotes: report.totalVotes + 1,
    };

    const { campaigns, allReports } = await loadScoreContext(ctx);
    const scores = computeReportScores(updated, campaigns, allReports);

    await ctx.db.patch("reports", args.reportId, {
      votesScam: updated.votesScam,
      votesSuspicious: updated.votesSuspicious,
      votesSafe: updated.votesSafe,
      totalVotes: updated.totalVotes,
      communityScore: scores.communityScore,
      trendScore: scores.trendScore,
      threatScore: scores.threatScore,
      severity: scores.severity,
    });
  },
});

export const updateStatus = mutation({
  args: {
    reportId: v.id("reports"),
    status: reportStatusValidator,
    sessionToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.sessionToken, ["admin"]);
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
