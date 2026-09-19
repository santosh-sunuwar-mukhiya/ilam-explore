import { useContext } from "react";
import { AuthContext } from "../context/authContext";

// Access the real authentication state: { user, isAuthLoading,
// isAuthenticated, isAdmin, login, register, logout, refreshUser }.
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an <AuthProvider>");
  }

  return context;
};

export default useAuth;
