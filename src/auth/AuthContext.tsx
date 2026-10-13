import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { clearSession, getRole, getToken, setSession } from "../api/client";
import * as api from "../api/endpoints";

interface AuthState {
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getToken());
  const [role, setRole] = useState<string | null>(() => getRole());

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.login(username, password);
    setSession(res.access_token, res.role);
    setToken(res.access_token);
    setRole(res.role);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setRole(null);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ token, role, isAuthenticated: token !== null, login, logout }),
    [token, role, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
