import { createContext } from "react";

// Kept in its own file so the provider component and the useAuth hook can be
// imported without breaking Vite's fast refresh rules.
export const AuthContext = createContext(null);
