import type { Severity } from '../types';
import { severityFromThreatScore } from './threatScore';

/** @deprecated Use severityFromThreatScore — kept for callers using threat score bands. */
export function severityFromScore(score: number): Severity {
  return severityFromThreatScore(score);
}
