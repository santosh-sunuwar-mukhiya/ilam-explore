// Simple, dependency free loading indicator.
export default function Loader({ label = "Loading...", className = "" }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-12 ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}