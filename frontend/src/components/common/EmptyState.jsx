// Neutral placeholder for "the API answered, there is simply nothing to show".
export default function EmptyState({ title = "Nothing here yet", message, children }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h3 className="text-base font-semibold text-slate-700">{title}</h3>

      {message && <p className="mt-1 text-sm text-slate-500">{message}</p>}

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}