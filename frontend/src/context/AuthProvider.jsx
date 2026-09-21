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
    const loginResponse = await authApi.login(credentials);
    const loggedInUser = loginResponse?.user;

    if (loggedInUser && !loggedInUser.isVerified) {
      await authApi.logout().catch(() => undefined);

      const verificationError = new Error(
        "Please verify your email before logging in.",
      );
      verificationError.friendlyMessage = verificationError.message;
      throw verificationError;
    }

    const currentUser = await authApi.getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  const register = useCallback(
    async (payload) => authApi.register(payload),
    [],
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
