import type { Severity } from '../types';

export interface GeoCluster {
  region: string;
  lat: number;
  lng: number;
  count: number;
  severity: Severity;
  topScamType: string;
  trend: 'Rising' | 'Stable' | 'Declining';
  isSimulated?: boolean;
}

export interface CampaignMarker {
  name: string;
  region: string;
  lat: number;
  lng: number;
  severity: Severity;
  reportCount: number;
  trend: string;
}

export interface SimulationConfig {
  scamType: string;
  intensity: 'low' | 'medium' | 'high';
  durationHours: number;
  originRegion: string;
}
