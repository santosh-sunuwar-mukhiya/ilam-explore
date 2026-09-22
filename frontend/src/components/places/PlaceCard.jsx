import { Link } from "react-router-dom";
import CategoryBadge from "../common/CategoryBadge";
import StarRating from "../common/StarRating";
import { resolveImageUrl } from "../../api/config";

// One destination card. All values come from the real /places payload.
export default function PlaceCard({
  place,
  onRemove,
  removeLabel = "Remove saved",
  isRemoving = false,
}) {
  const image = resolveImageUrl(place?.images?.[0]);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-emerald-300 hover:shadow-lg">
      <Link to={`/places/${place._id}`} className="block">
        <div className="h-48 w-full overflow-hidden bg-slate-100">
          {image ? (
            <img
              src={image}
              alt={place.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
              No photo yet
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 break-words text-lg font-semibold text-slate-900">
            <Link
              to={`/places/${place._id}`}
              className="transition hover:text-emerald-700"
            >
              {place.name}
            </Link>
          </h3>

          <CategoryBadge category={place.category} />
        </div>

        <p className="flex items-center gap-1.5 text-sm text-slate-500">
          <span aria-hidden="true">📍</span>
          <span>{place.location}</span>
        </p>

        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
          {place.description}
        </p>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <StarRating
            rating={place.averageRating}
            reviewCount={place.reviewCount}
          />

          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              to={`/places/${place._id}`}
              className="rounded-lg bg-emerald-700 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-800"
            >
              View details
            </Link>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(place)}
                disabled={isRemoving}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {removeLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}