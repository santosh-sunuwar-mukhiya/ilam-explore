import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createPlace,
  deletePlace,
  getDashboardStats,
  listActiveUsers,
  listAllReviews,
  listUsers,
  deleteUser,
  suspendUser,
  unsuspendUser,
  updatePlace,
} from "../api/admin.api";
import { deleteReview, updateReview } from "../api/reviews.api";
import { listPlaces } from "../api/places.api";
import { resolveImageUrl } from "../api/config";
import { formatDate } from "../utils/format";
import useAuth from "../hooks/useAuth";
import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";
import ReviewCard from "../components/reviews/ReviewCard";

const emptyPlace = {
  name: "",
  slug: "",
  description: "",
  location: "",
  category: "",
  bestTimeToVisit: "",
  entryFee: "",
  thingsToDo: "",
  images: "",
  imageFiles: [],
};

const statLabels = [
  ["totalUsers", "Total users"],
  ["activeUsers", "Active users"],
  ["totalAdmins", "Admins"],
  ["totalPlaces", "Places"],
  ["totalReviews", "Reviews"],
];

const getErrorMessage = (error) =>
  error?.friendlyMessage || error?.message || "Something went wrong";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);
  const [places, setPlaces] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [placeForm, setPlaceForm] = useState(emptyPlace);
  const [editingPlace, setEditingPlace] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: "5", comment: "" });
  const [editingReview, setEditingReview] = useState(null);
  const [mutation, setMutation] = useState("");
  const [logoutError, setLogoutError] = useState("");

  const fetchDashboard = useCallback(async () => {
    const [dashboard, allUsers, currentUsers, placeResult, reviewResult] =
      await Promise.all([
        getDashboardStats(),
        listUsers(),
        listActiveUsers(),
        listPlaces(),
        listAllReviews(),
      ]);

    return {
      dashboard,
      allUsers,
      currentUsers,
      placeResult,
      reviewResult,
    };
  }, []);

  const applyDashboard = ({
    dashboard,
    allUsers,
    currentUsers,
    placeResult,
    reviewResult,
  }) => {
    setStats(dashboard);
    setUsers(allUsers.items);
    setActiveUsers(currentUsers.items);
    setPlaces(placeResult.places);
    setReviews(reviewResult.items);
  };

  const loadDashboard = useCallback(async () => {
    setError("");

    try {
      const data = await fetchDashboard();
      applyDashboard(data);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [fetchDashboard]);

  useEffect(() => {
    let active = true;

    fetchDashboard()
      .then((data) => {
        if (active) applyDashboard(data);
      })
      .catch((loadError) => {
        if (active) setError(getErrorMessage(loadError));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fetchDashboard]);

  const handleLogout = async () => {
    setLogoutError("");

    try {
      await logout();
      navigate("/");
    } catch (logoutRequestError) {
      setLogoutError(getErrorMessage(logoutRequestError));
    }
  };

  const retry = () => {
    setIsLoading(true);
    loadDashboard();
  };

  const updatePlaceForm = (event) => {
    const { name, value, files } = event.target;
    setPlaceForm((previous) => ({
      ...previous,
      [name]: name === "imageFiles" ? Array.from(files || []) : value,
    }));
  };

  const startPlaceEdit = (place) => {
    setEditingPlace(place);
    setPlaceForm({
      name: place.name || "",
      slug: place.slug || "",
      description: place.description || "",
      location: place.location || "",
      category: place.category || "",
      bestTimeToVisit: place.bestTimeToVisit || "",
      entryFee: place.entryFee || "",
      thingsToDo: (place.thingsToDo || []).join(", "),
      images: (place.images || []).join(", "),
      imageFiles: [],
    });
    setTab("places");
  };

  const resetPlaceForm = () => {
    setEditingPlace(null);
    setPlaceForm(emptyPlace);
  };

  const submitPlace = async (event) => {
    event.preventDefault();
    setMutation("place");
    setError("");
    setNotice("");

    try {
      if (editingPlace) {
        await updatePlace(editingPlace._id, placeForm);
        setNotice("Place updated successfully.");
      } else {
        await createPlace(placeForm);
        setNotice("Place created successfully.");
      }
      resetPlaceForm();
      await loadDashboard();
    } catch (placeError) {
      setError(getErrorMessage(placeError));
    } finally {
      setMutation("");
    }
  };

  const removePlace = async (place) => {
    if (!window.confirm(`Delete ${place.name}? This also deletes its reviews.`))
      return;

    setMutation(`place-${place._id}`);
    setError("");
    setNotice("");

    try {
      await deletePlace(place._id);
      setNotice("Place deleted successfully.");
      await loadDashboard();
    } catch (placeError) {
      setError(getErrorMessage(placeError));
    } finally {
      setMutation("");
    }
  };

  const startReviewEdit = (review) => {
    setEditingReview(review);
    setReviewForm({
      rating: String(review.rating),
      comment: review.comment || "",
    });
    setNotice("");
    setError("");
  };

  const submitReview = async (event) => {
    event.preventDefault();
    setMutation("review");
    setError("");
    setNotice("");

    try {
      const savedReview = await updateReview(editingReview._id, {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim(),
      });
      setReviews((previous) =>
        previous.map((review) =>
          review._id === savedReview._id ? savedReview : review,
        ),
      );
      setEditingReview(null);
      setNotice("Review updated successfully.");
    } catch (reviewError) {
      setError(getErrorMessage(reviewError));
    } finally {
      setMutation("");
    }
  };

  const removeReview = async (review) => {
    if (!window.confirm("Delete this review?")) return;

    setMutation(`review-${review._id}`);
    setError("");
    setNotice("");

    try {
      await deleteReview(review._id);
      setReviews((previous) =>
        previous.filter((item) => item._id !== review._id),
      );
      setNotice("Review deleted successfully.");
      setStats((previous) =>
        previous
          ? {
              ...previous,
              totalReviews: Math.max(0, previous.totalReviews - 1),
            }
          : previous,
      );
    } catch (reviewError) {
      setError(getErrorMessage(reviewError));
    } finally {
      setMutation("");
    }
  };

  const updateManagedUser = (updatedUser) => {
    const wasActive = activeUsers.some(
      (listedUser) => listedUser._id === updatedUser._id,
    );

    setUsers((previous) =>
      previous.map((listedUser) =>
        listedUser._id === updatedUser._id ? updatedUser : listedUser,
      ),
    );
    setActiveUsers((previous) => {
      const withoutUpdatedUser = previous.filter(
        (listedUser) => listedUser._id !== updatedUser._id,
      );

      return updatedUser.isSuspended
        ? withoutUpdatedUser
        : [...withoutUpdatedUser, updatedUser];
    });
    setStats((previous) =>
      previous
        ? {
            ...previous,
            activeUsers: Math.max(
              0,
              previous.activeUsers +
                (updatedUser.isSuspended
                  ? wasActive
                    ? -1
                    : 0
                  : wasActive
                    ? 0
                    : 1),
            ),
          }
        : previous,
    );
  };

  const removeManagedUser = (userId) => {
    const wasActive = activeUsers.some(
      (listedUser) => listedUser._id === userId,
    );

    setUsers((previous) =>
      previous.filter((listedUser) => listedUser._id !== userId),
    );
    setActiveUsers((previous) =>
      previous.filter((listedUser) => listedUser._id !== userId),
    );
    setStats((previous) =>
      previous
        ? {
            ...previous,
            totalUsers: Math.max(0, previous.totalUsers - 1),
            activeUsers: Math.max(
              0,
              previous.activeUsers - (wasActive ? 1 : 0),
            ),
          }
        : previous,
    );
  };

  const manageUser = async (listedUser, action) => {
    const mutationKey = `user-${action}-${listedUser._id}`;

    if (action === "delete" && !window.confirm(`Delete ${listedUser.name}?`)) {
      return;
    }

    setMutation(mutationKey);
    setError("");
    setNotice("");

    try {
      if (action === "delete") {
        await deleteUser(listedUser._id);
        removeManagedUser(listedUser._id);
        setNotice("User deleted successfully.");
      } else {
        const updatedUser =
          action === "suspend"
            ? await suspendUser(listedUser._id)
            : await unsuspendUser(listedUser._id);
        updateManagedUser(updatedUser);
        setNotice(
          action === "suspend"
            ? "User suspended successfully."
            : "User unsuspended successfully.",
        );
      }
    } catch (userError) {
      setError(getErrorMessage(userError));
    } finally {
      setMutation("");
    }
  };

  if (isLoading)
    return <Loader label="Loading admin dashboard..." className="py-24" />;

  if (error && !stats) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <ErrorState
          title="Could not load admin dashboard"
          message={error}
          onRetry={retry}
        />
      </div>
    );
  }

  const tabs = [
    ["overview", "Overview"],
    ["places", "Places"],
    ["users", "Users"],
    ["reviews", "Reviews"],
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-emerald-700">
            Admin workspace
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">
            Signed in as {user?.name}{" "}
            <span className="font-medium text-emerald-700">(admin)</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/places"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white"
          >
            View public places
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Log out
          </button>
        </div>
      </div>

      {logoutError && (
        <p
          className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {logoutError}
        </p>
      )}
      {error && (
        <p
          className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
          role="status"
        >
          {notice}
        </p>
      )}

      <nav
        className="mt-8 flex gap-1 overflow-x-auto border-b border-slate-200"
        aria-label="Admin sections"
      >
        {tabs.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            aria-selected={tab === value}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium ${tab === value ? "border-emerald-600 text-emerald-700" : "border-transparent text-slate-500 hover:text-slate-900"}`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === "overview" && (
        <section className="mt-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {statLabels.map(([key, label]) => (
              <div
                key={key}
                className="rounded-xl border border-slate-200 bg-white p-5"
              >
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {stats?.[key] ?? 0}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <SummaryList
              title="Recent places"
              items={places.slice(0, 5)}
              empty="No places yet."
              renderItem={(place) => (
                <span>
                  {place.name}{" "}
                  <span className="text-slate-400">· {place.location}</span>
                </span>
              )}
            />
            <SummaryList
              title="Active users"
              items={activeUsers.slice(0, 5)}
              empty="No active users."
              renderItem={(activeUser) => (
                <span>
                  {activeUser.name}{" "}
                  <span className="text-slate-400">· {activeUser.email}</span>
                </span>
              )}
            />
          </div>
        </section>
      )}

      {tab === "places" && (
        <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Manage places
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {places.length} place{places.length === 1 ? "" : "s"}
                </p>
              </div>
              <button
                type="button"
                onClick={resetPlaceForm}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
              >
                New place
              </button>
            </div>
            <div className="mt-5 space-y-4">
              {places.length === 0 && (
                <EmptyState
                  title="No places yet"
                  message="Create the first destination from the form."
                />
              )}
              {places.map((place) => (
                <article
                  key={place._id}
                  className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row"
                >
                  <div className="h-28 w-full shrink-0 overflow-hidden rounded-lg bg-slate-100 sm:w-40">
                    {place.images?.[0] ? (
                      <img
                        src={resolveImageUrl(place.images[0])}
                        alt={place.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">
                      {place.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {place.location} · {place.category}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                      {place.description}
                    </p>
                    <div className="mt-3 flex gap-3">
                      <button
                        type="button"
                        onClick={() => startPlaceEdit(place)}
                        className="text-sm font-medium text-emerald-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={mutation === `place-${place._id}`}
                        onClick={() => removePlace(place)}
                        className="text-sm font-medium text-red-700 disabled:opacity-60"
                      >
                        {mutation === `place-${place._id}`
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
          <PlaceForm
            form={placeForm}
            editingPlace={editingPlace}
            mutation={mutation}
            onChange={updatePlaceForm}
            onSubmit={submitPlace}
            onCancel={resetPlaceForm}
          />
        </section>
      )}

      {tab === "users" && (
        <UserManagement
          users={users}
          activeUsers={activeUsers}
          currentUserId={user?._id}
          mutation={mutation}
          onManageUser={manageUser}
        />
      )}

      {tab === "reviews" && (
        <section className="mt-8">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Review moderation
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </p>
          </div>
          {editingReview && (
            <ReviewForm
              form={reviewForm}
              mutation={mutation}
              onChange={(event) =>
                setReviewForm((previous) => ({
                  ...previous,
                  [event.target.name]: event.target.value,
                }))
              }
              onSubmit={submitReview}
              onCancel={() => setEditingReview(null)}
            />
          )}
          {reviews.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                title="No reviews yet"
                message="There are no reviews to moderate."
              />
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {reviews.map((review) => (
                <ReviewCard
                  key={review._id}
                  review={review}
                  canManage
                  onEdit={startReviewEdit}
                  onDelete={removeReview}
                  isDeleting={mutation === `review-${review._id}`}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function SummaryList({ title, items, empty, renderItem }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item._id} className="py-3 text-sm text-slate-700">
              {renderItem(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function UserManagement({
  users,
  activeUsers,
  currentUserId,
  mutation,
  onManageUser,
}) {
  return (
    <section className="mt-8 grid gap-8 lg:grid-cols-2">
      <UserList
        title="All users"
        users={users}
        currentUserId={currentUserId}
        mutation={mutation}
        onManageUser={onManageUser}
      />
      <UserList
        title="Active users"
        users={activeUsers}
        currentUserId={currentUserId}
        mutation={mutation}
        onManageUser={onManageUser}
      />
    </section>
  );
}

function UserList({ title, users, currentUserId, mutation, onManageUser }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">{title}</h2>
        <span className="text-sm text-slate-500">{users.length}</span>
      </div>
      {users.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No users found.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {users.map((listedUser) => (
            <div
              key={listedUser._id}
              className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3"
            >
              <div className="min-w-0">
                <p className="wrap-break-word text-sm font-medium text-slate-900">
                  {listedUser.name}
                </p>
                <p className="wrap-break-word text-xs text-slate-500">
                  {listedUser.email}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <span
                  className={`text-xs font-medium ${listedUser.role === "admin" ? "text-emerald-700" : "text-slate-500"}`}
                >
                  {listedUser.role}
                </span>
                <p className="text-xs text-slate-400">
                  {formatDate(listedUser.createdAt)}
                </p>
                <p
                  className={`text-xs ${listedUser.isSuspended ? "text-red-600" : "text-emerald-600"}`}
                >
                  {listedUser.isSuspended ? "Suspended" : "Active"}
                </p>
                {listedUser.role !== "admin" &&
                  listedUser._id !== currentUserId && (
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={Boolean(mutation)}
                        onClick={() =>
                          onManageUser(
                            listedUser,
                            listedUser.isSuspended ? "unsuspend" : "suspend",
                          )
                        }
                        className="text-xs font-medium text-emerald-700 disabled:opacity-60"
                      >
                        {mutation ===
                        `user-${listedUser.isSuspended ? "unsuspend" : "suspend"}-${listedUser._id}`
                          ? listedUser.isSuspended
                            ? "Restoring..."
                            : "Suspending..."
                          : listedUser.isSuspended
                            ? "Unsuspend"
                            : "Suspend"}
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(mutation)}
                        onClick={() => onManageUser(listedUser, "delete")}
                        className="text-xs font-medium text-red-700 disabled:opacity-60"
                      >
                        {mutation === `user-delete-${listedUser._id}`
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlaceForm({
  form,
  editingPlace,
  mutation,
  onChange,
  onSubmit,
  onCancel,
}) {
  const fields = [
    ["name", "Name", true],
    ["slug", "Slug", false],
    ["location", "Location", true],
    ["category", "Category", true],
    ["bestTimeToVisit", "Best time to visit", false],
    ["entryFee", "Entry fee", false],
  ];

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-slate-200 bg-white p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-slate-900">
          {editingPlace ? "Edit place" : "Create place"}
        </h2>
        {editingPlace && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-slate-500 hover:text-slate-900"
          >
            Cancel
          </button>
        )}
      </div>
      <div className="mt-4 space-y-3">
        {fields.map(([name, label, required]) => (
          <label
            key={name}
            className="block text-sm font-medium text-slate-700"
          >
            {label}
            <input
              name={name}
              value={form[name]}
              onChange={onChange}
              required={required}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        ))}
        <label className="block text-sm font-medium text-slate-700">
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            required
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Things to do{" "}
          <span className="font-normal text-slate-400">(comma separated)</span>
          <textarea
            name="thingsToDo"
            value={form.thingsToDo}
            onChange={onChange}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Image URLs{" "}
          <span className="font-normal text-slate-400">(comma separated)</span>
          <textarea
            name="images"
            value={form.images}
            onChange={onChange}
            rows={2}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Upload images{" "}
          <input
            name="imageFiles"
            type="file"
            accept="image/*"
            multiple
            onChange={onChange}
            className="mt-1 w-full text-sm"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={mutation === "place"}
        className="mt-5 w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {mutation === "place"
          ? "Saving..."
          : editingPlace
            ? "Save changes"
            : "Create place"}
      </button>
    </form>
  );
}

function ReviewForm({ form, mutation, onChange, onSubmit, onCancel }) {
  return (
    <form
      onSubmit={onSubmit}
      className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-emerald-900">Edit review</h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm text-slate-600"
        >
          Cancel
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[8rem_1fr]">
        <label className="text-sm font-medium text-slate-700">
          Rating
          <select
            name="rating"
            value={form.rating}
            onChange={onChange}
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
            value={form.comment}
            onChange={onChange}
            required
            maxLength={2000}
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={mutation === "review"}
        className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {mutation === "review" ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
