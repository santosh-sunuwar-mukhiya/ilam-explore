import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import * as userApi from "../api/user.api";
import { resolveImageUrl } from "../api/config";

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

function ProfileAvatar({ user, size = "h-24 w-24" }) {
  const [hasError, setHasError] = useState(false);
  const avatarUrl = resolveImageUrl(user?.avatar);

  if (avatarUrl && !hasError) {
    return (
      <img
        src={avatarUrl}
        alt={`${user.name}'s avatar`}
        onError={() => setHasError(true)}
        className={`${size} rounded-full border-4 border-white object-cover shadow-sm`}
      />
    );
  }

  return (
    <span
      className={`flex ${size} items-center justify-center rounded-full border-4 border-white bg-emerald-100 text-2xl font-semibold text-emerald-800 shadow-sm`}
      aria-label="User initials"
    >
      {getInitials(user?.name)}
    </span>
  );
}

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);
  const [name, setName] = useState(user?.name || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const showError = (requestError, fallback) => {
    setError(requestError.friendlyMessage || requestError.message || fallback);
    setSuccess("");
  };

  const handleEditName = () => {
    setName(user?.name || "");
    setError("");
    setSuccess("");
    setIsEditingName(true);
  };

  const handleCancelNameEdit = () => {
    setName(user?.name || "");
    setError("");
    setSuccess("");
    setIsEditingName(false);
  };

  const handleNameSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Name cannot be empty.");
      setSuccess("");
      return;
    }

    setIsSavingName(true);
    setError("");
    setSuccess("");

    try {
      await userApi.updateProfile({ name: trimmedName });
      await refreshUser();
      setName(trimmedName);
      setIsEditingName(false);
      setSuccess("Your name was updated successfully.");
    } catch (requestError) {
      showError(requestError, "Unable to update your name. Please try again.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleAvatarChange = async (event) => {
    const avatar = event.target.files?.[0];
    event.target.value = "";
    if (!avatar) return;

    setIsUploadingAvatar(true);
    setError("");
    setSuccess("");

    try {
      await userApi.updateProfile({ avatar });
      await refreshUser();
      setSuccess("Your avatar was updated successfully.");
    } catch (requestError) {
      showError(
        requestError,
        "Unable to update your avatar. Please try again.",
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <p className="text-sm font-medium text-emerald-700">Account</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your personal information and account security.
        </p>
      </div>

      {(error || success) && (
        <p
          className={`mb-6 rounded-lg px-4 py-3 text-sm ${
            error ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-800"
          }`}
          role={error ? "alert" : "status"}
        >
          {error || success}
        </p>
      )}

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <ProfileAvatar user={user} />
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Profile photo
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose an image up to 5 MB.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/svg+xml"
                onChange={handleAvatarChange}
                className="sr-only"
                aria-label="Choose a new avatar"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="mt-3 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUploadingAvatar ? "Uploading..." : "Change avatar"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Personal information
          </h2>
          <div className="mt-5 space-y-5">
            <form onSubmit={handleNameSubmit}>
              <label
                htmlFor="profile-name"
                className="block text-sm font-medium text-slate-700"
              >
                Name
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  id="profile-name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  disabled={!isEditingName || isSavingName}
                  autoFocus={isEditingName}
                  maxLength={100}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:bg-slate-50 disabled:text-slate-600"
                />
                {isEditingName ? (
                  <span className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSavingName}
                      className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                    >
                      {isSavingName ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelNameEdit}
                      disabled={isSavingName}
                      className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleEditName}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                )}
              </div>
            </form>

            <div>
              <p className="text-sm font-medium text-slate-700">Email</p>
              <p className="mt-2 text-sm text-slate-900">{user?.email}</p>
              <p className="mt-1 text-xs text-slate-500">
                Email cannot be changed.
              </p>
            </div>

            {user?.isVerified !== undefined && (
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Email verification
                </p>
                <p
                  className={`mt-2 text-sm ${user.isVerified ? "text-emerald-700" : "text-amber-700"}`}
                >
                  {user.isVerified ? "Verified" : "Not verified"}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Security</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800">Password</p>
              <p className="mt-1 text-sm text-slate-500">
                Keep your account secure with a strong password.
              </p>
            </div>
            <Link
              to="/change-password"
              className="rounded-lg border border-emerald-200 px-4 py-2 text-center text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
            >
              Change password
            </Link>
          </div>
        </section>
      </div>

      <Link
        to="/"
        className="mt-8 inline-block text-sm font-medium text-emerald-700 hover:text-emerald-800"
      >
        Back to home
      </Link>
    </div>
  );
}
