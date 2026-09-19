import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

// Links available to everyone.
const publicLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/places", label: "Places" },
];

const linkClasses = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-emerald-50 text-emerald-800"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
  }`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthLoading, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate("/");
  };

  const links = [...publicLinks];
  const actionButton =
    "rounded-lg px-4 py-2 text-sm font-medium transition";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-lg text-white">
            ⛰️
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Ilam <span className="text-emerald-700">Explore</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={linkClasses}>
              {link.label}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink to="/admin" className={linkClasses}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthLoading ? (
            <span className="text-sm text-slate-400">Checking session...</span>
          ) : isAuthenticated ? (
            <>
              <span className="text-sm text-slate-600">
                Hi, <span className="font-medium text-slate-900">{user.name}</span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className={`${actionButton} border border-slate-200 text-slate-700 hover:bg-slate-50`}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`${actionButton} text-slate-700 hover:bg-slate-100`}
              >
                Log in
              </Link>
              <Link
                to="/register"
                className={`${actionButton} bg-emerald-700 text-white hover:bg-emerald-800`}
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
          className="rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden"
        >
          <span aria-hidden="true">{isOpen ? "✕" : "☰"}</span>
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={linkClasses}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}

            {isAdmin && (
              <NavLink to="/admin" className={linkClasses} onClick={() => setIsOpen(false)}>
                Admin
              </NavLink>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
            {isAuthLoading ? (
              <span className="text-sm text-slate-400">Checking session...</span>
            ) : isAuthenticated ? (
              <>
                <span className="text-sm text-slate-600">
                  Signed in as{" "}
                  <span className="font-medium text-slate-900">{user.name}</span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className={`${actionButton} border border-slate-200 text-center text-slate-700 hover:bg-slate-50`}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className={`${actionButton} border border-slate-200 text-center text-slate-700 hover:bg-slate-50`}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className={`${actionButton} bg-emerald-700 text-center text-white hover:bg-emerald-800`}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}