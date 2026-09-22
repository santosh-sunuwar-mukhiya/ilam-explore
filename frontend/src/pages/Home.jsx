import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listPlaces } from "../api/places.api";
import { resolveImageUrl } from "../api/config";
import PlaceCard from "../components/places/PlaceCard";
import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";
import EmptyState from "../components/common/EmptyState";

// Generic tourism copy (not data) for the "why visit" section.
const highlights = [
  {
    icon: "🍃",
    title: "Tea gardens",
    text: "Ilam is Nepal's tea capital - green estates at Kanyam, Fikkal and the Ilam Tea Estate.",
  },
  {
    icon: "🌄",
    title: "Himalayan viewpoints",
    text: "Sunrise spots like Antu Danda look out over Kanchenjunga and the Terai plains.",
  },
  {
    icon: "🥾",
    title: "Trails and treks",
    text: "Rhododendron forests and high ridges on the way to Sandakpur and Chhintapu.",
  },
];

export default function Home() {
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  // Real data from GET /api/v1/places. State is only updated inside promise
  // callbacks, and `active` ignores results of a superseded request.
  useEffect(() => {
    let active = true;

    listPlaces()
      .then(({ places: fetchedPlaces }) => {
        if (!active) return;
        setPlaces(fetchedPlaces);
        setError("");
      })
      .catch((err) => {
        if (!active) return;
        setError(err.friendlyMessage || err.message);
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

  const categories = useMemo(
    () => [...new Set(places.map((place) => place.category))],
    [places],
  );

  const totalReviews = useMemo(
    () => places.reduce((sum, place) => sum + (place.reviewCount || 0), 0),
    [places],
  );

  const heroImage = resolveImageUrl(places[0]?.images?.[0]);
  const featuredPlaces = places.slice(0, 3);

  const stats = [
    { label: "Destinations", value: isLoading ? "—" : places.length },
    { label: "Categories", value: isLoading ? "—" : categories.length },
    { label: "Traveller reviews", value: isLoading ? "—" : totalReviews },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-900">
        {heroImage && (
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-emerald-900/60" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-100 ring-1 ring-white/20 ring-inset">
            Eastern Nepal · Ilam District
          </span>

          <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-tight text-white md:text-5xl">
            Discover the tea gardens, hills and Himalayan views of Ilam
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-200">
            Ilam Explore brings together the best places to visit in Ilam —
            viewpoints, tea estates, lakes, temples and trekking routes — with
            the details you need to plan a trip.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/places"
              className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
            >
              Explore places
            </Link>
            <a
              href="#featured"
              className="rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              See highlights
            </a>
          </div>

          <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs uppercase tracking-wide text-slate-300">
                  {stat.label}
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-white">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Categories derived from the real places payload */}
      {categories.length > 0 && (
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-5">
            <span className="mr-1 text-sm font-medium text-slate-500">
              Browse by category:
            </span>

            {categories.map((category) => (
              <Link
                key={category}
                to={`/places?category=${encodeURIComponent(category)}`}
                className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
              >
                {category}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured places - real data from GET /api/v1/places */}
      <section id="featured" className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Featured destinations
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Real places from our Ilam database.
            </p>
          </div>

          <Link
            to="/places"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            View all places →
          </Link>
        </div>

        {isLoading && <Loader label="Loading destinations..." />}

        {!isLoading && error && (
          <ErrorState
            title="Could not load destinations"
            message={error}
            onRetry={retry}
            className="mt-8"
          />
        )}

        {!isLoading &&
          !error &&
          (featuredPlaces.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredPlaces.map((place) => (
                <PlaceCard key={place._id} place={place} />
              ))}
            </div>
          ) : (
            <div className="mt-8">
              <EmptyState
                title="No featured places yet"
                message="Check back soon for destinations to explore in Ilam."
              />
            </div>
          ))}
      </section>

      {/* Why visit */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold text-slate-900">Why visit Ilam?</h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >
                <span aria-hidden="true" className="text-2xl">
                  {item.icon}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl bg-emerald-800 px-8 py-10 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Ready to plan your Ilam trip?
            </h2>
            <p className="mt-2 text-sm text-emerald-100">
              Browse every destination, see entry fees and the best time to
              visit.
            </p>
          </div>

          <Link
            to="/places"
            className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
          >
            Explore all places
          </Link>
        </div>
      </section>
    </div>
  );
}