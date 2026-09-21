import axios from "axios";
import { API_URL } from "./config";
import { refreshAccessToken } from "./auth.api";

// Shared axios instance for the whole app.
// withCredentials is required: the backend authenticates with HttpOnly
// accessToken / refreshToken cookies (see backend auth.controller.js).
const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

// The backend always answers { statusCode, data, message, success }
// (ApiResponse) and errors as { statusCode, success: false, message, errors }.
export const unwrap = (response) => response?.data?.data ?? response?.data;

// Human readable message for any axios/backend failure.
export const getApiErrorMessage = (error) => {
  if (error?.code === "ERR_CANCELED") return "Request cancelled";

  if (!error?.response) {
    return `Cannot reach the backend at ${API_URL}. Make sure the server is running.`;
  }

  const { status, data } = error.response;
  const baseMessage = data?.message || error.message || "Something went wrong";
  const details = Array.isArray(data?.errors) ? data.errors.filter(Boolean) : [];

  if (details.length) return `${baseMessage} (${details.join(", ")})`;

  if (status === 401 && !error.config?.url?.includes("/auth/login")) {
    return "Your session has expired, please log in again";
  }
  if (status === 403) return "You do not have permission to do that";

  return baseMessage;
};

let refreshPromise = null;
let authFailureHandler = null;

export const setAuthFailureHandler = (handler) => {
  authFailureHandler = handler;

  return () => {
    if (authFailureHandler === handler) authFailureHandler = null;
  };
};

const shouldRefresh = (error) => {
  const requestUrl = error.config?.url || "";

  return (
    error.response?.status === 401 &&
    !error.config?._skipAuthRefresh &&
    !requestUrl.includes("/auth/login") &&
    !requestUrl.includes("/auth/register") &&
    !requestUrl.includes("/auth/refresh-token") &&
    !requestUrl.includes("/auth/logout")
  );
};

const refreshOnce = () => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

// Attaches a friendly message so pages can render error.message directly.
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (shouldRefresh(error) && !error.config._retry) {
      error.config._retry = true;

      try {
        await refreshOnce();
        return axiosClient(error.config);
      } catch (refreshError) {
        if ([401, 403].includes(refreshError.response?.status)) {
          authFailureHandler?.();
        }
      }
    }

    error.friendlyMessage = getApiErrorMessage(error);
    return Promise.reject(error);
  },
);

export default axiosClient;
