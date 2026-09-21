import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import * as authApi from "../api/auth.api";

export default function VerifyEmail() {
  const location = useLocation();
  const [form, setForm] = useState({
    email: location.state?.email || "",
    otp: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleChange = (event) =>
    setForm((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setResendMessage("");
    setIsSubmitting(true);

    try {
      await authApi.verifyEmail(form);
      setIsVerified(true);
    } catch (err) {
      setError(
        err.friendlyMessage || err.message || "Unable to verify your email.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendMessage("");
    setIsResending(true);

    try {
      await authApi.resendVerification({ email: form.email });
      setResendMessage("Verification code sent. Check your email.");
    } catch (err) {
      setError(
        err.friendlyMessage ||
          err.message ||
          "Unable to resend verification code.",
      );
    } finally {
      setIsResending(false);
    }
  };

  const inputClasses =
    "mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500";

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-2xl font-bold text-slate-900">Verify your email</h1>
      <p className="mt-2 text-sm text-slate-500">
        We sent a verification code to your email address.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6"
      >
        {error && (
          <p
            className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        {resendMessage && (
          <p
            className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
            role="status"
          >
            {resendMessage}
          </p>
        )}

        {isVerified ? (
          <div className="space-y-4">
            <p
              className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
              role="status"
            >
              Email verified successfully. You can now log in.
            </p>
            <Link
              to="/login"
              replace
              className="block w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Go to login
            </Link>
          </div>
        ) : (
          <>
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
                value={form.email}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>

            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-slate-700"
              >
                Verification code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={form.otp}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Verifying..." : "Verify email"}
            </button>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || !form.email}
              className="w-full rounded-lg border border-emerald-700 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResending ? "Sending code..." : "Resend verification code"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
