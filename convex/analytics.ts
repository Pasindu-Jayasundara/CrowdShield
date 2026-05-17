import { query } from "./_generated/server";
import { v } from "convex/values";

const MAX_REPORTS = 1000;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const chartData = query({
  args: {},
  handler: async (ctx) => {
    const reports = await ctx.db.query("reports").take(MAX_REPORTS);
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    const volumeByDay = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      volumeByDay.set(DAY_LABELS[d.getDay()], 0);
    }

    const scamTypeCounts = new Map<string, number>();
    const regionCounts = new Map<string, number>();

    for (const report of reports) {
      const created = new Date(report.createdAt).getTime();
      if (created >= sevenDaysAgo) {
        const label = DAY_LABELS[new Date(created).getDay()];
        volumeByDay.set(label, (volumeByDay.get(label) ?? 0) + 1);
      }
      scamTypeCounts.set(
        report.scamType,
        (scamTypeCounts.get(report.scamType) ?? 0) + 1,
      );
      if (report.region) {
        regionCounts.set(
          report.region,
          (regionCounts.get(report.region) ?? 0) + 1,
        );
      }
    }

    const volumeChartData = Array.from(volumeByDay.entries()).map(
      ([date, reportsCount]) => ({ date, reports: reportsCount }),
    );
    const scamTypeData = Array.from(scamTypeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    const regionData = Array.from(regionCounts.entries())
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return { volumeChartData, scamTypeData, regionData };
  },
});

export const localThreats = query({
  args: { regions: v.array(v.string()) },
  handler: async (ctx, args) => {
    const normalized = args.regions.map((r) => r.toLowerCase());
    const reports = await ctx.db.query("reports").take(MAX_REPORTS);
    const local = reports.filter(
      (r) => r.region && normalized.includes(r.region.toLowerCase()),
    );
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recent = local.filter(
      (r) => new Date(r.createdAt).getTime() >= oneDayAgo,
    );
    const scamTypeCounts = new Map<string, number>();
    for (const r of local) {
      scamTypeCounts.set(r.scamType, (scamTypeCounts.get(r.scamType) ?? 0) + 1);
    }
    const topScam =
      [...scamTypeCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "Unknown";
    const severities = local.map((r) => r.severity);
    const threatLevel =
      severities.includes("CRITICAL")
        ? "CRITICAL"
        : severities.includes("HIGH")
          ? "HIGH"
          : severities.includes("MEDIUM")
            ? "MEDIUM"
            : "LOW";
    const increasePct =
      local.length > 0
        ? Math.round((recent.length / local.length) * 100)
        : 0;

    return {
      activeThreats: local.filter((r) => r.status !== "removed").length,
      increasePct,
      trend: increasePct > 15 ? "Rising" : increasePct < 5 ? "Stable" : "Rising",
      topScam,
      threatLevel,
      reports: local
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 20),
    };
  },
});
