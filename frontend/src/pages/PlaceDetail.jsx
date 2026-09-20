import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPlaceById } from "../api/places.api";
import {
  createReview,
  deleteReview,
  listPlaceReviews,
  updateReview,
} from "../api/reviews.api";
import { resolveImageUrl } from "../api/config";
import { formatBestTime, formatEntryFee } from "../utils/format";
import CategoryBadge from "../components/common/CategoryBadge";
import StarRating from "../components/common/StarRating";
import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import ReviewCard from "../components/reviews/ReviewCard";
import useAuth from "../hooks/useAuth";

export default function PlaceDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();

  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(null);
  const [activeImage, setActiveImage] = useState(0);

  const [reviews, setReviews] = useState([]);
  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: "5", comment: "" });
  const [editingReview, setEditingReview] = useState(null);
  const [reviewMutation, setReviewMutation] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  // GET /api/v1/places/:id - real place data.
  useEffect(() => {
    let active = true;

    getPlaceById(id)
      .then((fetchedPlace) => {
        if (!active) return;
        setPlace(fetchedPlace);
        setActiveImage(0);
        setError("");
        setStatus(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.friendlyMessage || err.message);
        setStatus(err.response?.status ?? null);
        setPlace(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, reloadKey]);

  const retry = () => {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  // Reviews are a separate public endpoint - a failure here must not break the
  // page, so its state is kept separate from the place state.
  useEffect(() => {
    let active = true;

    listPlaceReviews(id)
      .then((result) => {
        if (!active) return;
        setReviews(result.reviews);
        setReviewsError("");
      })
      .catch((err) => {
        if (!active) return;
        setReviewsError(err.friendlyMessage || err.message);
        setReviews([]);
      })
      .finally(() => {
        if (active) setIsReviewsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const ownReview = reviews.find(
    (review) => String(review.user?._id) === String(user?._id),
  );

  const refreshPlace = () => {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  const handleReviewChange = (event) => {
    setReviewForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    setReviewMutation("saving");
    setReviewsError("");
    setReviewSuccess("");

    try {
      const payload = {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      };
      const savedReview = editingReview
        ? await updateReview(editingReview._id, payload)
        : await createReview({ place: id, ...payload });

      setReviews((previous) =>
        editingReview
          ? previous.map((review) =>
              review._id === savedReview._id ? savedReview : review,
            )
          : [savedReview, ...previous],
      );
      setEditingReview(null);
      setReviewForm({ rating: "5", comment: "" });
      setReviewSuccess(editingReview ? "Review updated." : "Review submitted.");
      refreshPlace();
    } catch (err) {
      setReviewsError(err.friendlyMessage || err.message);
    } finally {
      setReviewMutation("");
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({ rating: String(review.rating), comment: review.comment });
    setReviewSuccess("");
    setReviewsError("");
  };

  const handleDeleteReview = async (review) => {
    if (!window.confirm("Delete your review?")) return;

    setReviewMutation(`deleting-${review._id}`);
    setReviewsError("");
    setReviewSuccess("");

    try {
      await deleteReview(review._id);
      setReviews((previous) =>
        previous.filter((currentReview) => currentReview._id !== review._id),
      );
      if (editingReview?._id === review._id) {
        setEditingReview(null);
        setReviewForm({ rating: "5", comment: "" });
      }
      setReviewSuccess("Review deleted.");
      refreshPlace();
    } catch (err) {
      setReviewsError(err.friendlyMessage || err.message);
    } finally {
      setReviewMutation("");
    }
  };

  if (isLoading) {
    return <Loader label="Loading place details..." className="py-24" />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState
          title={status === 404 ? "Place not found" : "Could not load this place"}
          message={error}
          onRetry={status === 404 ? undefined : retry}
        />
        <div className="mt-6 text-center">
          <Link
            to="/places"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            ← Back to all places
          </Link>
        </div>
      </div>
    );
  }

  if (!place) return null;

  const images = place.images ?? [];
  const currentImage = resolveImageUrl(images[activeImage] ?? images[0]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="text-sm text-slate-500">
        <Link to="/places" className="hover:text-emerald-700">
          Places
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-700">{place.name}</span>
      </nav>

      <header className="mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-slate-900">{place.name}</h1>
          <CategoryBadge category={place.category} />
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <span aria-hidden="true">📍</span>
          <span>{place.location}</span>
        </p>

        {place.reviewCount > 0 && (
          <StarRating
            rating={place.averageRating}
            reviewCount={place.reviewCount}
            className="mt-3"
          />
        )}
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        {/* MAIN */}
        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl bg-slate-100">
            {currentImage ? (
              <img
                src={currentImage}
                alt={place.name}
                className="h-72 w-full object-cover md:h-96"
              />
            ) : (
              <div className="flex h-72 w-full items-center justify-center text-sm text-slate-400 md:h-96">
                No photo available
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    activeImage === index
                      ? "border-emerald-600"
                      : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <img
                    src={resolveImageUrl(image)}
                    alt={`${place.name} photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-slate-900">
              About this place
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {place.description}
            </p>
          </section>

          {place.thingsToDo?.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-semibold text-slate-900">
                Things to do
              </h2>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {place.thingsToDo.map((activity) => (
                  <li
                    key={activity}
                    className="flex items-start gap-2 text-sm text-slate-600"
                  >
                    <span aria-hidden="true" className="text-emerald-600">
                      •
                    </span>
                    <span>{activity}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-base font-semibold text-slate-900">
              Visit information
            </h2>

            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Entry fee</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {formatEntryFee(place.entryFee)}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Best time to visit</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {formatBestTime(place.bestTimeToVisit)}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Category</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {place.category}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Location</dt>
                <dd className="mt-0.5 font-medium text-slate-900">
                  {place.location}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="text-base font-semibold text-emerald-900">
              Traveller rating
            </h2>

            {place.reviewCount > 0 ? (
              <StarRating
                rating={place.averageRating}
                reviewCount={place.reviewCount}
                className="mt-3"
              />
            ) : (
              <p className="mt-2 text-sm text-emerald-800">
                No reviews yet — be the first to review this place.
              </p>
            )}
          </div>
        </aside>
      </div>

      {/* Reviews from GET /api/v1/reviews/place/:placeId (public read) */}
      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">
            Reviews
            {!isReviewsLoading && !reviewsError && (
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({reviews.length})
              </span>
            )}
          </h2>

          {isAuthenticated ? (
            <span className="text-sm text-slate-500">
              {ownReview
                ? "You have reviewed this place."
                : "Share your experience."}
            </span>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              Log in to write a review
            </Link>
          )}
        </div>

        {isAuthenticated && !ownReview && !editingReview && (
          <form
            onSubmit={handleReviewSubmit}
            className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5"
          >
            <h3 className="text-base font-semibold text-emerald-900">
              Write a review
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-[9rem_1fr]">
              <label className="text-sm font-medium text-slate-700">
                Rating
                <select
                  name="rating"
                  value={reviewForm.rating}
                  onChange={handleReviewChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} / 5
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Comment
                <textarea
                  name="comment"
                  value={reviewForm.comment}
                  onChange={handleReviewChange}
                  required
                  maxLength={2000}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  placeholder="What did you think of this place?"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={reviewMutation === "saving"}
              className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {reviewMutation === "saving" ? "Submitting..." : "Submit review"}
            </button>
          </form>
        )}

        {isAuthenticated && editingReview && (
          <form
            onSubmit={handleReviewSubmit}
            className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-emerald-900">
                Edit your review
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingReview(null);
                  setReviewForm({ rating: "5", comment: "" });
                }}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-[9rem_1fr]">
              <label className="text-sm font-medium text-slate-700">
                Rating
                <select
                  name="rating"
                  value={reviewForm.rating}
                  onChange={handleReviewChange}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} / 5
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">
                Comment
                <textarea
                  name="comment"
                  value={reviewForm.comment}
                  onChange={handleReviewChange}
                  required
                  maxLength={2000}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={reviewMutation === "saving"}
              className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {reviewMutation === "saving" ? "Saving..." : "Save changes"}
            </button>
          </form>
        )}

        {reviewSuccess && (
          <p
            className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
            role="status"
          >
            {reviewSuccess}
          </p>
        )}

        {!isReviewsLoading && reviewsError && (
          <p
            className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {reviewsError}
          </p>
        )}

        {isReviewsLoading && <Loader label="Loading reviews..." />}

        {!isReviewsLoading && reviewsError && (
          <ErrorState
            title="Could not load reviews"
            message={reviewsError}
            className="mt-4"
          />
        )}

        {!isReviewsLoading && !reviewsError && reviews.length === 0 && (
          <div className="mt-4">
            <EmptyState
              title="No reviews yet"
              message="This place has not been reviewed so far."
            />
          </div>
        )}

        {!isReviewsLoading && !reviewsError && reviews.length > 0 && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {reviews.map((review) => {
              const canManage = String(review.user?._id) === String(user?._id);

              return (
                <ReviewCard
                  key={review._id}
                  review={review}
                  canManage={canManage}
                  onEdit={handleEditReview}
                  onDelete={handleDeleteReview}
                  isDeleting={reviewMutation === `deleting-${review._id}`}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}