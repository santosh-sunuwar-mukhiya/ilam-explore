import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as authApi from "../api/auth.api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.forgotPassword({ email: normalizedEmail });
      setIsSubmitted(true);
    } catch (err) {
      setError(
        err.friendlyMessage ||
          err.message ||
          "Unable to send password reset code. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueToReset = () => {
    navigate("/reset-password", {
      state: { email: email.trim().toLowerCase() },
    });
  };

  const inputClasses =
    "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500";

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-2xl font-bold text-slate-900">Forgot password</h1>
      <p className="mt-2 text-sm text-slate-500">
        Enter your account email to receive a password reset code.
      </p>

      <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        {error && (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        {isSubmitted ? (
          <div className="space-y-4">
            <p
              className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
              role="status"
            >
              If an account with that email exists, a password reset code has
              been sent. Please check your inbox and spam folder.
            </p>

            <button
              type="button"
              onClick={handleContinueToReset}
              className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Enter reset code
            </button>

            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Try another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={inputClasses}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Sending reset code..." : "Send reset code"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-500">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
