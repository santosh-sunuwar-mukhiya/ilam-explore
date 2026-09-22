function HeartIcon({ filled }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
    </svg>
  );
}

export default function SavePlaceButton({
  isSaved,
  isLoading = false,
  onClick,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      aria-pressed={isSaved}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
        isSaved
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
          : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
      } ${className}`}
    >
      <HeartIcon filled={isSaved} />
      <span>
        {isLoading
          ? isSaved
            ? "Removing..."
            : "Saving..."
          : isSaved
            ? "Saved"
            : "Save"}
      </span>
    </button>
  );
}
