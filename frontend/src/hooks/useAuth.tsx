import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { errorMessage } from "../api";
import { authService } from "../services";
import type { AuthUser, LoginRequest } from "../types";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string;
  login: (input: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCurrentUser = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUser(await authService.me());
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCurrentUser();
  }, [loadCurrentUser]);

  async function login(input: LoginRequest) {
    setLoading(true);
    setError("");
    try {
      setUser(await authService.login(input));
      return true;
    } catch (err) {
      setUser(null);
      setError(errorMessage(err));
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    setError("");
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setLoading(false);
    }
  }

  const value = useMemo(
    () => ({ user, loading, error, login, logout }),
    [user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
