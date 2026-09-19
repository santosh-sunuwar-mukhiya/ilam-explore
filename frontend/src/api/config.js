// Central place for everything that describes where the backend lives.
// The backend mounts every resource under /api/v1 (see backend/src/app.js).

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
).replace(/\/+$/, "");

export const API_PREFIX = "/api/v1";

// Absolute API root, e.g. http://localhost:8000/api/v1
export const API_URL = `${API_BASE_URL}${API_PREFIX}`;

// Seeded place photos are returned as absolute URLs already, but uploads or
// future relative paths (/static/foo.jpg) should still resolve correctly.
export const resolveImageUrl = (url) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
};
