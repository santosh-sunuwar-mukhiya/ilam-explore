import axiosClient, { unwrap } from "./axiosClient";

// POST /api/v1/auth/login -> { user }
// Authentication tokens are set as HttpOnly cookies by the backend.
export const login = async ({ email, password }) => {
  const response = await axiosClient.post("/auth/login", { email, password });
  return unwrap(response);
};

// POST /api/v1/auth/register (multipart because avatar is optional)
export const register = async ({ name, email, password, avatar }) => {
  const formData = new FormData();

  formData.append("name", name);
  formData.append("email", email);
  formData.append("password", password);
  if (avatar) formData.append("avatar", avatar);

  const response = await axiosClient.post("/auth/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return unwrap(response);
};

// POST /api/v1/auth/verify-email -> {}
export const verifyEmail = async ({ email, otp }) => {
  const response = await axiosClient.post("/auth/verify-email", { email, otp });
  return unwrap(response);
};

// POST /api/v1/auth/resend-verification -> {}
export const resendVerification = async ({ email }) => {
  const response = await axiosClient.post("/auth/resend-verification", { email });
  return unwrap(response);
};

// GET /api/v1/auth/get-me -> the logged in user (401 when not authenticated)
export const getCurrentUser = async () => {
  const response = await axiosClient.get("/auth/get-me");
  return unwrap(response);
};

// POST /api/v1/auth/logout -> clears the auth cookies
export const logout = async () => {
  const response = await axiosClient.post("/auth/logout");
  return unwrap(response);
};

// POST /api/v1/auth/refresh-token -> rotates the HttpOnly auth cookies
export const refreshAccessToken = async () => {
  const response = await axiosClient.post("/auth/refresh-token", null, {
    withCredentials: true,
    _skipAuthRefresh: true,
  });
  return unwrap(response);
};
// POST /api/v1/auth/forgot-password -> sends password reset OTP email
export const forgotPassword = async ({ email }) => {
  const response = await axiosClient.post("/auth/forgot-password", { email });
  return unwrap(response);
};

// POST /api/v1/auth/reset-password -> resets password with OTP
export const resetPassword = async ({
  email,
  otp,
  newPassword,
  confirmPassword,
}) => {
  const response = await axiosClient.post("/auth/reset-password", {
    email,
    otp,
    newPassword,
    confirmPassword,
  });
  return unwrap(response);
};

// POST /api/v1/auth/change-password -> {}
export const changePassword = async ({
  oldPassword,
  newPassword,
  confirmPassword,
}) => {
  const response = await axiosClient.post("/auth/change-password", {
    oldPassword,
    newPassword,
    confirmPassword,
  });
  return unwrap(response);
};

