/** Sri Lanka region centroids for geo map clustering */
export const REGION_COORDS: Record<
  string,
  { lat: number; lng: number; label: string }
> = {
  colombo: { lat: 6.9271, lng: 79.8612, label: "Colombo" },
  kandy: { lat: 7.2906, lng: 80.6337, label: "Kandy" },
  galle: { lat: 6.0535, lng: 80.221, label: "Galle" },
  jaffna: { lat: 9.6615, lng: 80.0255, label: "Jaffna" },
  negombo: { lat: 7.2088, lng: 79.8358, label: "Negombo" },
  gampaha: { lat: 7.0917, lng: 80.0081, label: "Gampaha" },
  kalutara: { lat: 6.5854, lng: 79.9607, label: "Kalutara" },
  matara: { lat: 5.9549, lng: 80.555, label: "Matara" },
  kurunegala: { lat: 7.4863, lng: 80.3647, label: "Kurunegala" },
  anuradhapura: { lat: 8.3114, lng: 80.4037, label: "Anuradhapura" },
  batticaloa: { lat: 7.7102, lng: 81.6924, label: "Batticaloa" },
  trincomalee: { lat: 8.5874, lng: 81.2152, label: "Trincomalee" },
};

export const SRI_LANKA_CENTER = { lat: 7.8731, lng: 80.7718 };
export const SRI_LANKA_ZOOM = 7;

export function resolveRegion(name: string | undefined) {
  if (!name) return null;
  const key = name.trim().toLowerCase();
  return REGION_COORDS[key] ?? null;
}

export function severityRank(severity: string): number {
  switch (severity) {
    case "CRITICAL":
      return 4;
    case "HIGH":
      return 3;
    case "MEDIUM":
      return 2;
    default:
      return 1;
  }
}

export function maxSeverity(severities: string[]): string {
  if (severities.includes("CRITICAL")) return "CRITICAL";
  if (severities.includes("HIGH")) return "HIGH";
  if (severities.includes("MEDIUM")) return "MEDIUM";
  return "LOW";
}
