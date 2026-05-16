import type { Doc } from "../_generated/dataModel";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/** Map composite threat score to severity for user-facing display. */
export function severityFromThreatScore(score: number): Severity {
  const s = Math.min(100, Math.max(0, Math.round(score)));
  if (s >= 81) return "CRITICAL";
  if (s >= 51) return "HIGH";
  if (s >= 21) return "MEDIUM";
  return "LOW";
}

export const THREAT_SCORE_WEIGHTS = {
  ai: 0.5,
  community: 0.35,
  trend: 0.15,
} as const;

export type TrendLabel =
  | "rising"
  | "stable"
  | "declining"
  | "Rising"
  | "Stable"
  | "Declining";

/** ThreatScore = (0.5 × AI) + (0.35 × Community) + (0.15 × Trend) */
export function computeThreatScore(
  aiScore: number,
  communityScore: number,
  trendScore: number,
): number {
  const raw =
    THREAT_SCORE_WEIGHTS.ai * clamp(aiScore) +
    THREAT_SCORE_WEIGHTS.community * clamp(communityScore) +
    THREAT_SCORE_WEIGHTS.trend * clamp(trendScore);
  return Math.round(raw);
}

function clamp(n: number): number {
  return Math.min(100, Math.max(0, n));
}

/** Community validation score from vote distribution (0–100). */
export function computeCommunityScore(
  votesScam: number,
  votesSuspicious: number,
  votesSafe: number,
  totalVotes: number,
): number {
  if (totalVotes <= 0) return 0;
  const weighted = votesScam * 100 + votesSuspicious * 50 + votesSafe * 0;
  return Math.round(weighted / totalVotes);
}

export function trendLabelToScore(trend: TrendLabel | string): number {
  const t = trend.toLowerCase();
  if (t === "rising") return 85;
  if (t === "declining") return 25;
  return 50;
}

type CampaignLike = {
  scamType: string;
  trend: string;
  regionsAffected: string[];
};

type ReportLike = {
  scamType: string;
  region?: string;
  createdAt: string;
};

/** Trend score from matching campaign or regional report velocity. */
export function resolveTrendScore(
  report: ReportLike,
  campaigns: CampaignLike[],
  regionReports: ReportLike[],
): number {
  const regionKey = report.region?.trim().toLowerCase();
  const matchingCampaign = campaigns.find((c) => {
    if (c.scamType.toLowerCase() !== report.scamType.toLowerCase()) return false;
    if (!regionKey) return true;
    return c.regionsAffected.some((r) => r.trim().toLowerCase() === regionKey);
  });
  if (matchingCampaign) {
    return trendLabelToScore(matchingCampaign.trend);
  }

  if (regionReports.length >= 2) {
    const recent = regionReports.filter(
      (r) => Date.now() - new Date(r.createdAt).getTime() <= 24 * 60 * 60 * 1000,
    ).length;
    const ratio = recent / regionReports.length;
    if (ratio > 0.35) return 85;
    if (ratio < 0.1) return 25;
    return 50;
  }

  return 50;
}

export type ReportScores = {
  aiScore: number;
  communityScore: number;
  trendScore: number;
  threatScore: number;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
};

export function computeReportScores(
  report: Pick<
    Doc<"reports">,
    | "aiScore"
    | "votesScam"
    | "votesSuspicious"
    | "votesSafe"
    | "totalVotes"
    | "scamType"
    | "region"
    | "createdAt"
    | "severity"
  >,
  campaigns: CampaignLike[],
  allReports: ReportLike[],
): ReportScores {
  const communityScore = computeCommunityScore(
    report.votesScam,
    report.votesSuspicious,
    report.votesSafe,
    report.totalVotes,
  );

  const regionKey = report.region?.trim().toLowerCase();
  const regionReports = regionKey
    ? allReports.filter((r) => r.region?.trim().toLowerCase() === regionKey)
    : [];

  const trendScore = resolveTrendScore(report, campaigns, regionReports);
  const threatScore = computeThreatScore(
    report.aiScore,
    communityScore,
    trendScore,
  );

  return {
    aiScore: report.aiScore,
    communityScore,
    trendScore,
    threatScore,
    severity: severityFromThreatScore(threatScore),
  };
}
