import { motion } from 'motion/react';
import { FlaskConical } from 'lucide-react';

export function SimulationBanner() {
  return (
    <motion.div
      className="flex items-center gap-2 border-b border-primary/30 bg-primary/10 px-4 py-2 text-sm text-primary"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
    >
      <FlaskConical className="h-4 w-4" />
      Active simulation running — data may include synthetic threats
    </motion.div>
  );
}
