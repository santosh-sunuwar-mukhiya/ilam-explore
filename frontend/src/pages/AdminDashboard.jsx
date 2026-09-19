import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

// Placeholder only. The admin dashboard UI (stats from GET /api/v1/admin/dashboard,
// place/review management) is intentionally NOT built in this phase.
export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-2xl font-bold text-slate-900">Admin dashboard</h1>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">Signed in as</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">{user?.name}</p>
        <p className="text-sm text-slate-500">
          {user?.email} · role: {user?.role}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h2 className="text-base font-semibold text-amber-900">
          Dashboard UI is not built yet
        </h2>
        <p className="mt-2 text-sm text-amber-800">
          The backend already exposes <code>GET /api/v1/admin/dashboard</code>
          with total users, active users, admins, places and reviews. The
          frontend dashboard, place management and review moderation screens
          will be implemented in the next phase.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Log out
        </button>
        <Link
          to="/places"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800"
        >
          View public places
        </Link>
      </div>
    </div>
  );
}