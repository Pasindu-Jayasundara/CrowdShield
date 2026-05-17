import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { buildSimulationClustersForWave, getMaxSimulationWaves } from '../data/sriLankaRegions';
import type { GeoCluster, SimulationConfig } from '../types/geo';

const STORAGE_KEY = 'crowdshield_active_simulation';

/** Real-time seconds between spread waves (faster preview for analysts). */
const WAVE_INTERVAL_SEC = 12;

type PersistedSimulation = {
  config: SimulationConfig;
  startedAt: number;
  currentWave: number;
};

type SimulationContextValue = {
  config: SimulationConfig | null;
  clusters: GeoCluster[];
  startedAt: number | null;
  currentWave: number;
  maxWaves: number;
  progressPct: number;
  elapsedMinutes: number;
  isActive: boolean;
  launchSimulation: (config: SimulationConfig) => void;
  endSimulation: () => void;
};

const SimulationContext = createContext<SimulationContextValue | null>(null);

function loadPersisted(): PersistedSimulation | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedSimulation;
    if (!parsed?.config?.originRegion) return null;
    return parsed;
  } catch {
    return null;
  }
}

function savePersisted(state: PersistedSimulation | null) {
  if (!state) {
    sessionStorage.removeItem(STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const initial = useRef(loadPersisted()).current;
  const [config, setConfig] = useState<SimulationConfig | null>(initial?.config ?? null);
  const [startedAt, setStartedAt] = useState<number | null>(initial?.startedAt ?? null);
  const [currentWave, setCurrentWave] = useState(() => {
    if (!initial) return 0;
    const max = getMaxSimulationWaves(initial.config);
    const elapsedSec = (Date.now() - initial.startedAt) / 1000;
    const fromTime = Math.floor(elapsedSec / WAVE_INTERVAL_SEC);
    return Math.min(Math.max(initial.currentWave, fromTime), max - 1);
  });
  const [tick, setTick] = useState(0);

  const maxWaves = config ? getMaxSimulationWaves(config) : 0;

  const clusters = useMemo(() => {
    if (!config) return [];
    return buildSimulationClustersForWave(config, currentWave);
  }, [config, currentWave]);

  const endSimulation = useCallback(() => {
    setConfig(null);
    setStartedAt(null);
    setCurrentWave(0);
    savePersisted(null);
  }, []);

  const launchSimulation = useCallback((next: SimulationConfig) => {
    const started = Date.now();
    setConfig(next);
    setStartedAt(started);
    setCurrentWave(0);
    savePersisted({ config: next, startedAt: started, currentWave: 0 });
  }, []);

  // Advance spread waves while simulation is active
  useEffect(() => {
    if (!config || startedAt == null) return;

    const tick = () => {
      const elapsedSec = (Date.now() - startedAt) / 1000;
      const waveFromTime = Math.floor(elapsedSec / WAVE_INTERVAL_SEC);
      const capped = Math.min(waveFromTime, maxWaves - 1);

      setCurrentWave((prev) => {
        const next = Math.max(prev, capped);
        if (next !== prev && config) {
          savePersisted({ config, startedAt, currentWave: next });
        }
        return next;
      });

      const durationSec = config.durationHours * 3600;
      if (elapsedSec >= durationSec) {
        endSimulation();
      }
    };

    tick();
    const id = window.setInterval(() => {
      tick();
      setTick((t) => t + 1);
    }, 4000);
    return () => window.clearInterval(id);
  }, [config, startedAt, maxWaves, endSimulation]);

  const progressPct =
    config && maxWaves > 1 ? Math.round((currentWave / (maxWaves - 1)) * 100) : config ? 100 : 0;

  const elapsedMinutes =
    startedAt != null ? Math.floor((Date.now() - startedAt) / 60000) : 0;
  void tick;

  const value = useMemo<SimulationContextValue>(
    () => ({
      config,
      clusters,
      startedAt,
      currentWave,
      maxWaves,
      progressPct,
      elapsedMinutes,
      isActive: config != null,
      launchSimulation,
      endSimulation,
    }),
    [
      config,
      clusters,
      startedAt,
      currentWave,
      maxWaves,
      progressPct,
      elapsedMinutes,
      launchSimulation,
      endSimulation,
    ],
  );

  return (
    <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}
