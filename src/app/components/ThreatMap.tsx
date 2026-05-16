import { useEffect } from 'react';
import L from 'leaflet';
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CampaignMarker, GeoCluster } from '../types/geo';
import { severityColor, SRI_LANKA_CENTER, SRI_LANKA_ZOOM } from '../data/sriLankaRegions';

function clusterDivIcon(count: number, severity: string, selected: boolean, simulated: boolean) {
  const color = severityColor(severity);
  const size = selected ? 44 : 38;
  return L.divIcon({
    className: 'threat-cluster-icon',
    html: `<div style="
      width:${size}px;height:${size}px;
      background:${color};
      border:2px solid #fff;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:700;color:#fff;
      box-shadow:0 2px 12px ${color}88;
      ${simulated ? 'outline:2px dashed #7C3AED;outline-offset:2px;' : ''}
    ">${count}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapResizeFix() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

function FitBounds({ clusters }: { clusters: GeoCluster[] }) {
  const map = useMap();
  useEffect(() => {
    if (clusters.length === 0) {
      map.setView(SRI_LANKA_CENTER, SRI_LANKA_ZOOM);
      return;
    }
    const bounds = clusters.map((c) => [c.lat, c.lng] as [number, number]);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 9 });
  }, [clusters, map]);
  return null;
}

export function ThreatMap({
  clusters,
  campaignMarkers,
  showHeatmap,
  showClusters,
  showCampaigns,
  selectedRegion,
  onSelectCluster,
}: {
  clusters: GeoCluster[];
  campaignMarkers: CampaignMarker[];
  showHeatmap: boolean;
  showClusters: boolean;
  showCampaigns: boolean;
  selectedRegion: string | null;
  onSelectCluster: (cluster: GeoCluster) => void;
}) {
  const center: LatLngExpression = SRI_LANKA_CENTER;

  return (
    <MapContainer center={center} zoom={SRI_LANKA_ZOOM} className="h-full w-full z-0" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapResizeFix />
      <FitBounds clusters={clusters} />

      {showHeatmap &&
        clusters.map((c) => (
          <CircleMarker
            key={`heat-${c.region}-${c.isSimulated}`}
            center={[c.lat, c.lng]}
            radius={Math.min(56, 12 + c.count * 0.35)}
            pathOptions={{
              color: 'transparent',
              fillColor: severityColor(c.severity),
              fillOpacity: 0.18,
              weight: 0,
            }}
          />
        ))}

      {showCampaigns &&
        campaignMarkers.map((c) => (
          <CircleMarker
            key={`campaign-${c.name}-${c.region}`}
            center={[c.lat, c.lng]}
            radius={22}
            pathOptions={{
              color: '#7C3AED',
              fillColor: '#7C3AED',
              fillOpacity: 0.08,
              weight: 2,
              dashArray: '6 4',
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">{c.name}</p>
                <p className="text-gray-600">{c.region}</p>
                <p>
                  {c.reportCount} reports · {c.trend}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

      {showClusters &&
        clusters.map((c) => (
          <Marker
            key={`cluster-${c.region}-${c.isSimulated}-${c.lat}`}
            position={[c.lat, c.lng]}
            icon={clusterDivIcon(
              c.count,
              c.severity,
              selectedRegion === c.region,
              Boolean(c.isSimulated),
            )}
            eventHandlers={{ click: () => onSelectCluster(c) }}
          >
            <Popup>
              <div className="min-w-[140px] text-sm">
                <p className="font-bold">
                  {c.region}
                  {c.isSimulated && (
                    <span className="ml-1 text-xs font-normal text-purple-600">(simulated)</span>
                  )}
                </p>
                <p>{c.count} reports</p>
                <p className="text-gray-600">{c.topScamType}</p>
                <p className="text-gray-500">Trend: {c.trend}</p>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
