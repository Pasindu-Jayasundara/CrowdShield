import type { Severity } from '../types';

export function severityColor(severity: Severity, solid = false): string {
  if (solid) {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-critical text-on-primary border-critical';
      case 'HIGH':
        return 'bg-high text-on-primary border-high';
      case 'MEDIUM':
        return 'bg-medium text-on-primary border-medium';
      case 'LOW':
        return 'bg-low text-on-primary border-low';
    }
  }
  switch (severity) {
    case 'CRITICAL':
      return 'text-critical bg-critical/10 border-critical/25';
    case 'HIGH':
      return 'text-high bg-high/10 border-high/25';
    case 'MEDIUM':
      return 'text-medium bg-medium/10 border-medium/25';
    case 'LOW':
      return 'text-low bg-low/10 border-low/25';
  }
}

export function severityGlow(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL':
      return 'glow-critical';
    case 'HIGH':
      return 'glow-high';
    default:
      return '';
  }
}

export function severityRingColor(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL':
      return '#e84040';
    case 'HIGH':
      return '#f5a623';
    case 'MEDIUM':
      return '#2d7dd2';
    case 'LOW':
      return '#22c55e';
  }
}

export function severityTintBg(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-critical/5';
    case 'HIGH':
      return 'bg-high/5';
    case 'MEDIUM':
      return 'bg-medium/5';
    case 'LOW':
      return 'bg-low/5';
    default:
      return 'bg-gray-50';
  }
}
