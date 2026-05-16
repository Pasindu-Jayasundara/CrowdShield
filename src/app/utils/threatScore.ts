import type { Severity } from '../types';

export const THREAT_SCORE_WEIGHTS = {
  ai: 0.5,
  community: 0.35,
  trend: 0.15,
} as const;

export function computeThreatScore(
  aiScore: number,
  communityScore: number,
  trendScore: number,
): number {
  const clamp = (n: number) => Math.min(100, Math.max(0, n));
  const raw =
    THREAT_SCORE_WEIGHTS.ai * clamp(aiScore) +
    THREAT_SCORE_WEIGHTS.community * clamp(communityScore) +
    THREAT_SCORE_WEIGHTS.trend * clamp(trendScore);
  return Math.round(raw);
}

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

export function defaultTrendScore(): number {
  return 50;
}

/** 0–20 Low · 21–50 Medium · 51–80 High · 81–100 Critical */
export function severityFromThreatScore(score: number): Severity {
  const s = Math.min(100, Math.max(0, Math.round(score)));
  if (s >= 81) return 'CRITICAL';
  if (s >= 51) return 'HIGH';
  if (s >= 21) return 'MEDIUM';
  return 'LOW';
}
