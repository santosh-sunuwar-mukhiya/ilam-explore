// Category pill used on cards and on the place detail page.
export default function CategoryBadge({ category, className = "" }) {
  if (!category) return null;

  return (
    <span
      className={`inline-flex max-w-full items-center truncate rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200 ring-inset ${className}`}
    >
      {category}
    </span>
  );
}