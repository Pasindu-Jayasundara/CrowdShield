export function ScamTypeTag({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded-md border border-accent/30 bg-accent/5 px-2 py-0.5 text-[11px] font-semibold text-accent">
      {type}
    </span>
  );
}
