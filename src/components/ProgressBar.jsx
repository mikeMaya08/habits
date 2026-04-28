export function ProgressBar({ value, color = '#4f46e5', label }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="progress" aria-label={label} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="progress-fill"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}
