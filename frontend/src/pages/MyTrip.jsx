import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyTrip, removePlaceFromTrip } from "../api/trip.api";
import PlaceCard from "../components/places/PlaceCard";
import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

export default function MyTrip() {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState("");
  const [removeError, setRemoveError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    getMyTrip()
      .then(({ places: tripPlaces }) => {
        if (!active) return;
        setPlaces(tripPlaces);
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
      const trip = await removePlaceFromTrip(place._id);
      setPlaces(trip.places);
    } catch (err) {
      setRemoveError(err.friendlyMessage || err.message);
    } finally {
      setRemovingId("");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">My Trip</h1>
        <p className="mt-2 text-sm text-slate-500">
          Plan the Ilam destinations you want to visit.
        </p>
      </header>

      {isLoading && <Loader label="Loading your trip..." />}

      {!isLoading && error && (
        <ErrorState
          title="Could not load your trip"
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
          <EmptyState title="My Trip is empty.">
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
              removeLabel="Remove from trip"
              onRemove={removingId === place._id ? undefined : handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
