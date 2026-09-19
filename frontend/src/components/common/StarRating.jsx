// Shows a rating out of 5 without pulling in an icon library.
export default function StarRating({ rating = 0, reviewCount, className = "" }) {
  const rounded = Math.round(Number(rating) || 0);

  return (
    <span
      className={`inline-flex items-center gap-2 text-sm ${className}`}
      aria-label={`Rated ${Number(rating).toFixed(1)} out of 5`}
    >
      <span aria-hidden="true" className="tracking-tight text-amber-500">
        {"★".repeat(rounded)}
        <span className="text-slate-300">{"★".repeat(Math.max(0, 5 - rounded))}</span>
      </span>

      <span className="text-slate-600">
        {Number(rating).toFixed(1)}
        {typeof reviewCount === "number" && (
          <span className="text-slate-400"> ({reviewCount})</span>
        )}
      </span>
    </span>
  );
}