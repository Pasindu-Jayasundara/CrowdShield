import { useSimulation } from '../context/SimulationContext';
import { SimulationBanner } from './SimulationBanner';

/** Persists across analyst routes — simulation survives tab navigation. */
export function AnalystSimulationStrip() {
  const {
    config,
    isActive,
    currentWave,
    maxWaves,
    progressPct,
    elapsedMinutes,
    endSimulation,
  } = useSimulation();

  if (!isActive || !config) return null;

  return (
    <SimulationBanner
      config={config}
      currentWave={currentWave}
      maxWaves={maxWaves}
      progressPct={progressPct}
      elapsedMinutes={elapsedMinutes}
      onEnd={endSimulation}
    />
  );
}
