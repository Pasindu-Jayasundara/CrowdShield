import type { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

const tints: Record<string, string> = {
  critical: 'bg-critical/5 border-critical/15',
  high: 'bg-high/5 border-high/15',
  purple: 'bg-admin/5 border-admin/15',
  neutral: 'bg-gray-50 border-border',
  primary: 'bg-primary/5 border-primary/15',
};

export function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  trend,
  tint = 'neutral',
  valueClassName = 'text-text',
}: {
  label: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  tint?: keyof typeof tints;
  valueClassName?: string;
}) {
  return (
    <motion.div className={`card p-5 ${tints[tint]}`} whileHover={{ y: -1 }}>
      <div className="mb-3 flex items-start justify-between">
        <p className="text-sm font-medium text-text-muted">{label}</p>
        <Icon className="h-5 w-5 text-text-dim" />
      </div>
      <p className={`text-3xl font-bold ${valueClassName}`}>{value}</p>
      {change && (
        <p
          className={`mt-1 text-xs font-medium ${
            trend === 'up' ? 'text-low' : trend === 'down' ? 'text-critical' : 'text-text-muted'
          }`}
        >
          {change}
        </p>
      )}
    </motion.div>
  );
}
