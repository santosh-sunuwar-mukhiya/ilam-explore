import StarRating from "../common/StarRating";
import { formatDate } from "../../utils/format";
import { resolveImageUrl } from "../../api/config";

// One review as returned by GET /api/v1/reviews/place/:placeId
// (user is populated with { name, avatar }).
export default function ReviewCard({ review }) {
  const avatar = resolveImageUrl(review?.user?.avatar);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={review.user?.name || "User"}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800">
            {(review?.user?.name || "?").charAt(0).toUpperCase()}
          </span>
        )}

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {review?.user?.name || "Deleted user"}
            </p>
            <span className="text-xs text-slate-400">
              {formatDate(review?.createdAt)}
            </span>
          </div>

          <StarRating rating={review?.rating} className="mt-1" />

          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {review?.comment}
          </p>
        </div>
      </div>
    </article>
  );
}