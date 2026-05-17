import { query } from "./_generated/server";
import { v } from "convex/values";
import {
  maxSeverity,
  resolveRegion,
  SRI_LANKA_CENTER,
} from "./lib/regions";

const MAX_REPORTS = 1000;

export type GeoCluster = {
  region: string;
  lat: number;
  lng: number;
  count: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  topScamType: string;
  trend: "Rising" | "Stable" | "Declining";
  isSimulated?: boolean;
};

function hoursAgo(iso: string, hours: number): boolean {
  return Date.now() - new Date(iso).getTime() <= hours * 3600000;
}

export const mapData = query({
  args: {
    timeRangeHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hours = args.timeRangeHours ?? 168;
    const reports = await ctx.db.query("reports").take(MAX_REPORTS);
    const campaigns = await ctx.db.query("campaigns").take(50);

    const filtered = reports.filter((r) => {
      if (!r.region) return false;
      if (hours >= 168) return true;
      return hoursAgo(r.createdAt, hours);
    });

    const byRegion = new Map<
      string,
      { severities: string[]; scamTypes: Map<string, number>; recent: number }
    >();

    for (const report of filtered) {
      const coords = resolveRegion(report.region);
      if (!coords) continue;
      const key = coords.label;
      const entry = byRegion.get(key) ?? {
        severities: [],
        scamTypes: new Map<string, number>(),
        recent: 0,
      };
      entry.severities.push(report.severity);
      entry.scamTypes.set(
        report.scamType,
        (entry.scamTypes.get(report.scamType) ?? 0) + 1,
      );
      if (hoursAgo(report.createdAt, 24)) entry.recent += 1;
      byRegion.set(key, entry);
    }

    const clusters: GeoCluster[] = [];
    for (const [region, data] of byRegion) {
      const coords = resolveRegion(region);
      if (!coords) continue;
      const count = data.severities.length;
      const topScamType =
        [...data.scamTypes.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ??
        "Unknown";
      const recentRatio = count > 0 ? data.recent / count : 0;
      const trend =
        recentRatio > 0.35 ? "Rising" : recentRatio < 0.1 ? "Declining" : "Stable";

      clusters.push({
        region,
        lat: coords.lat,
        lng: coords.lng,
        count,
        severity: maxSeverity(data.severities) as GeoCluster["severity"],
        topScamType,
        trend,
      });
    }

    clusters.sort((a, b) => b.count - a.count);

    const campaignMarkers = campaigns.flatMap((c) =>
      c.regionsAffected
        .map((r) => {
          const coords = resolveRegion(r);
          if (!coords) return null;
          return {
            name: c.name,
            region: coords.label,
            lat: coords.lat,
            lng: coords.lng,
            severity: c.severity,
            reportCount: c.reportCount,
            trend: c.trend,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null),
    );

    return {
      center: SRI_LANKA_CENTER,
      clusters,
      campaignMarkers,
      totalReports: filtered.length,
    };
  },
});
