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

export function buildSimulationClusters(config: {
  scamType: string;
  intensity: 'low' | 'medium' | 'high';
  originRegion: string;
}): import('../types/geo').GeoCluster[] {
  const origin = REGION_COORDS[config.originRegion] ?? REGION_COORDS.Colombo;
  const baseCount =
    config.intensity === 'high' ? 120 : config.intensity === 'medium' ? 65 : 28;
  const severity =
    config.intensity === 'high'
      ? 'CRITICAL'
      : config.intensity === 'medium'
        ? 'HIGH'
        : 'MEDIUM';

  const spreadRegions = [
    config.originRegion,
    ...REGION_OPTIONS.filter((r) => r !== config.originRegion).slice(0, 3),
  ];

  return spreadRegions.map((region, i) => {
    const coords = REGION_COORDS[region] ?? origin;
    const jitter = () => (Math.random() - 0.5) * 0.35;
    return {
      region,
      lat: coords.lat + jitter(),
      lng: coords.lng + jitter(),
      count: Math.round(baseCount * (1 - i * 0.22)),
      severity: i === 0 ? severity : severity === 'CRITICAL' ? 'HIGH' : 'MEDIUM',
      topScamType: config.scamType,
      trend: 'Rising' as const,
      isSimulated: true,
    };
  });
}
