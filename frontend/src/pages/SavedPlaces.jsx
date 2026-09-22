import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listSavedPlaces, unsavePlace } from "../api/places.api";
import PlaceCard from "../components/places/PlaceCard";
import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

export default function SavedPlaces() {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState("");
  const [removeError, setRemoveError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    listSavedPlaces()
      .then(({ places: savedPlaces }) => {
        if (!active) return;
        setPlaces(savedPlaces);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.friendlyMessage || err.message);
        setPlaces([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const retry = () => {
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  };

  const handleRemove = async (place) => {
    setRemovingId(place._id);
    setRemoveError("");

    try {
      await unsavePlace(place._id);
      setPlaces((currentPlaces) =>
        currentPlaces.filter((currentPlace) => currentPlace._id !== place._id),
      );
    } catch (err) {
      setRemoveError(err.friendlyMessage || err.message);
    } finally {
      setRemovingId("");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Saved Places</h1>
        <p className="mt-2 text-sm text-slate-500">
          Keep track of the Ilam destinations you want to visit.
        </p>
      </header>

      {isLoading && <Loader label="Loading saved places..." />}

      {!isLoading && error && (
        <ErrorState
          title="Could not load saved places"
          message={error}
          onRetry={retry}
          className="mt-8"
        />
      )}

      {!isLoading && !error && removeError && (
        <p
          className="mt-6 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {removeError}
        </p>
      )}

      {!isLoading && !error && places.length === 0 && (
        <div className="mt-8">
          <EmptyState title="You haven't saved any places yet.">
            <Link
              to="/places"
              className="inline-block rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
            >
              Explore Places
            </Link>
          </EmptyState>
        </div>
      )}

      {!isLoading && !error && places.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <PlaceCard
              key={place._id}
              place={place}
              onRemove={handleRemove}
              isRemoving={removingId === place._id}
              removeLabel={
                removingId === place._id ? "Removing..." : "Remove saved"
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
