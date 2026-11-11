import { createContext, use, useCallback, useMemo, useState } from "react";

import type { ReactNode } from "react";

const USER = { name: "Valentin", email: "vdrenkov@example.com" };
const AuthContext = createContext<
  | {
      user: typeof USER | null;
      isAuthenticated: boolean;
      login: (email: string, password: string) => boolean;
      logout: () => void;
    }
  | undefined
>(undefined);

function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const login = useCallback((email: string, password: string) => {
    const valid = email.trim() === USER.email && password === "qwerty";
    setIsAuthenticated(valid);
    return valid;
  }, []);
  const logout = useCallback(() => setIsAuthenticated(false), []);
  const value = useMemo(
    () => ({
      user: isAuthenticated ? USER : null,
      isAuthenticated,
      login,
      logout,
    }),
    [isAuthenticated, login, logout],
  );
  return <AuthContext value={value}>{children}</AuthContext>;
}

function useAuth() {
  const context = use(AuthContext);

  if (context === undefined) {
    throw new Error("AuthContext was used outside AuthProvider.");
  }

  return context;
}

export { AuthProvider, useAuth };
