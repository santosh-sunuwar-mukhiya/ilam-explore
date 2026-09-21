import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./authContext";
import * as authApi from "../api/auth.api";
import { setAuthFailureHandler } from "../api/axiosClient";

// Real authentication state backed by the existing backend endpoints.
// Cookies are HttpOnly, so the only way to know who is logged in is to ask
// GET /auth/get-me on startup.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch {
      // 401 simply means "not logged in" - that is not an app error.
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const unregisterAuthFailureHandler = setAuthFailureHandler(() => {
      setUser(null);
    });

    let active = true;

    const loadUser = async () => {
      try {
        const currentUser = await authApi.getCurrentUser();
        if (active) setUser(currentUser);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setIsAuthLoading(false);
      }
    };

    loadUser();

    return () => {
      active = false;
      unregisterAuthFailureHandler();
    };
  }, []);

  const login = useCallback(async (credentials) => {
    await authApi.login(credentials);
    const currentUser = await authApi.getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  const register = useCallback(
    async (payload) => {
      const createdUser = await authApi.register(payload);

      // The backend does not set cookies on register, so log in right after
      // to give the user a working session (never fakes a session).
      await login({ email: payload.email, password: payload.password });

      return createdUser;
    },
    [login],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthLoading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === "admin",
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isAuthLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
