import { Navigate, useLocation } from "react-router-dom";
import Loader from "../components/common/Loader";
import useAuth from "../hooks/useAuth";

// Sends visitors to /login when they are not authenticated and (optionally)
// blocks non-admins. The redirect target is remembered so /login can come back.
export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return <Loader label="Checking your session..." className="py-24" />;
  }

  if (!user) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
    );
  }

  if (requireAdmin && user.role !== "admin") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
          <h1 className="text-xl font-semibold text-amber-900">Admin access required</h1>
          <p className="mt-2 text-sm text-amber-800">
            Your account ({user.email}) does not have the admin role.
          </p>
        </div>
      </div>
    );
  }

  return children;
}