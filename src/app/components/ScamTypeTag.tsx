export function ScamTypeTag({ type }: { type: string }) {
  const isSafe = type.toLowerCase() === 'safe';
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
        isSafe
          ? 'border-low/30 bg-low/10 text-low'
          : 'border-accent/30 bg-accent/5 text-accent'
      }`}
    >
      {type}
    </span>
  );
}
