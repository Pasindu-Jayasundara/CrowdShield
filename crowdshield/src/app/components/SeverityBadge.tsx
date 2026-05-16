import type { Severity } from '../types';
import { severityColor, severityGlow } from '../utils/severity';

export function SeverityBadge({ severity, solid = false }: { severity: Severity; solid?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ${severityColor(severity, solid)} ${!solid ? severityGlow(severity) : ''}`}
    >
      {severity}
    </span>
  );
}
