import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <p className="text-base font-semibold text-slate-900">
            Ilam <span className="text-emerald-700">Explore</span>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            A tourism guide to Ilam district, eastern Nepal — tea gardens,
            viewpoints, trekking trails, lakes and temples.
          </p>
        </div>

        <div className="flex gap-10">
          <div>
            <p className="text-sm font-semibold text-slate-800">Explore</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-500">
              <li>
                <Link to="/" className="hover:text-emerald-700">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/places" className="hover:text-emerald-700">
                  All places
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-800">Account</p>
            <ul className="mt-2 space-y-1.5 text-sm text-slate-500">
              <li>
                <Link to="/login" className="hover:text-emerald-700">
                  Log in
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-emerald-700">
                  Register
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        Place photos are credited to their Wikimedia Commons authors.
      </div>
    </footer>
  );
}