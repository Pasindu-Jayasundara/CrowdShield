export const REGION_OPTIONS = [
  'Colombo',
  'Kandy',
  'Galle',
  'Jaffna',
  'Negombo',
  'Gampaha',
  'Kalutara',
  'Matara',
  'Kurunegala',
  'Anuradhapura',
] as const;

export const REGION_COORDS: Record<string, { lat: number; lng: number }> = {
  Colombo: { lat: 6.9271, lng: 79.8612 },
  Kandy: { lat: 7.2906, lng: 80.6337 },
  Galle: { lat: 6.0535, lng: 80.221 },
  Jaffna: { lat: 9.6615, lng: 80.0255 },
  Negombo: { lat: 7.2088, lng: 79.8358 },
  Gampaha: { lat: 7.0917, lng: 80.0081 },
  Kalutara: { lat: 6.5854, lng: 79.9607 },
  Matara: { lat: 5.9549, lng: 80.555 },
  Kurunegala: { lat: 7.4863, lng: 80.3647 },
  Anuradhapura: { lat: 8.3114, lng: 80.4037 },
};

export const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];
export const SRI_LANKA_ZOOM = 7;

export function severityColor(severity: string): string {
  switch (severity) {
    case 'CRITICAL':
      return '#E84040';
    case 'HIGH':
      return '#F5A623';
    case 'MEDIUM':
      return '#2D7DD2';
    default:
      return '#22C55E';
  }
}

import type { GeoCluster, SimulationConfig } from '../types/geo';
import type { Severity } from '../types';

/** Spread order: origin first, then remaining regions (deterministic). */
export function getSimulationSpreadOrder(originRegion: string): string[] {
  const origin = (REGION_OPTIONS as readonly string[]).includes(originRegion)
    ? originRegion
    : 'Colombo';
  return [origin, ...REGION_OPTIONS.filter((r) => r !== origin)];
}

export function getMaxSimulationWaves(config: SimulationConfig): number {
  const spread = getSimulationSpreadOrder(config.originRegion);
  const byDuration = Math.min(
    spread.length,
    Math.max(2, Math.ceil(config.durationHours / 2)),
  );
  return Math.min(spread.length, byDuration);
}

function originSeverity(intensity: SimulationConfig['intensity']): Severity {
  if (intensity === 'high') return 'CRITICAL';
  if (intensity === 'medium') return 'HIGH';
  return 'MEDIUM';
}

function spreadSeverity(origin: Severity, distanceFromOrigin: number): Severity {
  if (distanceFromOrigin === 0) return origin;
  const rank: Record<Severity, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
  const down: Severity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const idx = Math.max(0, rank[origin] - distanceFromOrigin);
  return down[idx] ?? 'LOW';
}

/** Build synthetic clusters for waves 0..wave (inclusive) — simulates geographic spread over time. */
export function buildSimulationClustersForWave(
  config: SimulationConfig,
  wave: number,
): GeoCluster[] {
  const order = getSimulationSpreadOrder(config.originRegion);
  const maxWave = getMaxSimulationWaves(config);
  const activeWave = Math.min(Math.max(0, wave), maxWave - 1);
  const regions = order.slice(0, activeWave + 1);

  const baseCount =
    config.intensity === 'high' ? 140 : config.intensity === 'medium' ? 72 : 32;
  const originSev = originSeverity(config.intensity);

  return regions.map((region, i) => {
    const coords = REGION_COORDS[region] ?? REGION_COORDS.Colombo;
    const waveFactor = 1 + activeWave * 0.08;
    const distanceFactor = 1 - i * 0.18;
    const count = Math.max(8, Math.round(baseCount * waveFactor * distanceFactor));
    return {
      region,
      lat: coords.lat + (i === 0 ? 0 : (Math.sin(i * 1.7) * 0.12)),
      lng: coords.lng + (i === 0 ? 0 : (Math.cos(i * 2.1) * 0.12)),
      count,
      severity: spreadSeverity(originSev, i),
      topScamType: config.scamType,
      trend: 'Rising' as const,
      isSimulated: true,
    };
  });
}

/** @deprecated Use buildSimulationClustersForWave */
export function buildSimulationClusters(config: SimulationConfig): GeoCluster[] {
  return buildSimulationClustersForWave(config, getMaxSimulationWaves(config) - 1);
}
