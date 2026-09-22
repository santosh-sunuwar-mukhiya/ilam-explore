import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { listPlaces } from "../api/places.api";
import PlaceCard from "../components/places/PlaceCard";
import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

export default function Places() {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedCategory = searchParams.get("category") || "";
  const urlSearch = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

  const [places, setPlaces] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Category list comes from the unfiltered places payload (one extra request).
  useEffect(() => {
    let active = true;

    listPlaces()
      .then(({ places: allPlaces }) => {
        if (!active) return;
        setCategories([...new Set(allPlaces.map((place) => place.category))]);
      })
      .catch(() => {
        // Non fatal: the filter bar simply stays empty.
      });

    return () => {
      active = false;
    };
  }, []);

  // Debounce the search box before hitting the API.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Real data from GET /api/v1/places?category=&search=
  useEffect(() => {
    let active = true;

    listPlaces({ category: selectedCategory, search: debouncedSearch })
      .then((result) => {
        if (!active) return;
        setPlaces(result.places);
        setTotal(result.total);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.friendlyMessage || err.message);
        setPlaces([]);
        setTotal(0);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedCategory, debouncedSearch, reloadKey]);

  // Loading is restarted from the interactions that change the filters.
  const startLoading = () => setIsLoading(true);

  const updateCategory = (category) => {
    startLoading();

    const next = new URLSearchParams(searchParams);

    if (category) next.set("category", category);
    else next.delete("category");

    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => {
    startLoading();
    setSearchInput("");
    setSearchParams({}, { replace: true });
  };

  const retry = () => {
    startLoading();
    setReloadKey((key) => key + 1);
  };

  const hasFilters = Boolean(selectedCategory || debouncedSearch);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">
          Places to visit in Ilam
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {isLoading
            ? "Loading destinations..."
            : `${total} destination${total === 1 ? "" : "s"} found`}
        </p>
      </header>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between">
        <label htmlFor="place-search" className="sr-only">
          Search places
        </label>
        <input
          id="place-search"
          type="search"
          value={searchInput}
          onChange={(event) => {
            startLoading();
            setSearchInput(event.target.value);
          }}
          placeholder="Search by name, location or description..."
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-800 outline-none focus:border-emerald-500 md:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => updateCategory("")}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              selectedCategory
                ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                : "border-emerald-600 bg-emerald-600 text-white"
            }`}
            aria-pressed={!selectedCategory}
          >
            All
          </button>

          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => updateCategory(category)}
              className={`rounded-full border px-3 py-1 text-sm transition ${
                selectedCategory === category
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
              aria-pressed={selectedCategory === category}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <Loader label="Loading places..." />}

      {!isLoading && error && (
        <ErrorState
          title="Could not load places"
          message={error}
          onRetry={retry}
          className="mt-8"
        />
      )}

      {!isLoading && !error && places.length === 0 && (
        <div className="mt-8">
          <EmptyState
            title="No places matched your filters"
            message="Try another category or a different search term."
          >
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
              >
                Clear filters
              </button>
            )}
          </EmptyState>
        </div>
      )}

      {!isLoading && !error && places.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <PlaceCard key={place._id} place={place} />
          ))}
        </div>
      )}
    </div>
  );
}