import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { resolveImageUrl } from "../../api/config";

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

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

function UserAvatar({ user, className = "h-8 w-8" }) {
  const [hasError, setHasError] = useState(false);
  const avatarUrl = resolveImageUrl(user?.avatar);
  const initials = getInitials(user?.name);

  if (avatarUrl && !hasError) {
    return (
      <img
        src={avatarUrl}
        alt={user?.name ? `${user.name}'s avatar` : "User avatar"}
        onError={() => setHasError(true)}
        className={`${className} shrink-0 rounded-full border border-slate-200 object-cover`}
      />
    );
  }

  return (
    <span
      className={`flex ${className} shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 text-xs font-semibold text-emerald-800`}
      aria-label={user?.name || "User initials"}
    >
      {initials}
    </span>
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const { user, isAuthLoading, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLogoutError("");

    try {
      await logout();
      setIsOpen(false);
      navigate("/");
    } catch (error) {
      setLogoutError(error.friendlyMessage || error.message);
    }
  };

  const links = [...publicLinks];
  const actionButton =
    "rounded-lg px-4 py-2 text-sm font-medium transition";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link
          to="/"
          className="flex items-center gap-2"
          onClick={() => setIsOpen(false)}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-lg text-white">
            ⛰️
          </span>
          <span className="text-lg font-semibold tracking-tight text-slate-900">
            Ilam <span className="text-emerald-700">Explore</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={linkClasses}
            >
              {link.label}
            </NavLink>
          ))}

          {isAuthenticated && (
            <>
              <NavLink to="/saved-places" className={linkClasses}>
                Saved Places
              </NavLink>
              <NavLink to="/my-trip" className={linkClasses}>
                My Trip
              </NavLink>
            </>
          )}

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
              {logoutError && (
                <span className="text-sm text-red-600">{logoutError}</span>
              )}
              <Link
                to="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-50"
                aria-label="Open your profile"
              >
                <UserAvatar key={user?.avatar || "avatar"} user={user} />
                <span className="text-sm text-slate-600">
                  Hi,{" "}
                  <span className="font-medium text-slate-900">
                    {user.name}
                  </span>
                </span>
              </Link>
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

            {isAuthenticated && (
              <>
                <NavLink
                  to="/saved-places"
                  className={linkClasses}
                  onClick={() => setIsOpen(false)}
                >
                  Saved Places
                </NavLink>
                <NavLink
                  to="/my-trip"
                  className={linkClasses}
                  onClick={() => setIsOpen(false)}
                >
                  My Trip
                </NavLink>
              </>
            )}

            {isAdmin && (
              <NavLink
                to="/admin"
                className={linkClasses}
                onClick={() => setIsOpen(false)}
              >
                Admin
              </NavLink>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
            {isAuthLoading ? (
              <span className="text-sm text-slate-400">
                Checking session...
              </span>
            ) : isAuthenticated ? (
              <>
                {logoutError && (
                  <span className="text-sm text-red-600">{logoutError}</span>
                )}
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-50"
                  aria-label="Open your profile"
                >
                  <UserAvatar key={user?.avatar || "avatar"} user={user} />
                  <span className="text-sm text-slate-600">
                    Signed in as{" "}
                    <span className="font-medium text-slate-900">
                      {user.name}
                    </span>
                  </span>
                </Link>
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