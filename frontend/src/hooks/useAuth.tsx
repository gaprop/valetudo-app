import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import { errorMessage } from "../api";
import { authService } from "../services";
import type { AuthUser, LoginRequest } from "../types";

type AuthStatus = "checking" | "authenticated" | "unauthenticated" | "unknown";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  status: AuthStatus;
  error: string;
  refreshCurrentUser: () => Promise<void>;
  login: (input: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [error, setError] = useState("");

  function isConfirmedUnauthenticated(error: unknown) {
    return axios.isAxiosError(error) && error.response?.status === 401;
  }

  const loadCurrentUser = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUser(await authService.me());
      setStatus("authenticated");
    } catch (err) {
      if (isConfirmedUnauthenticated(err)) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }

      setStatus((current) =>
        current === "authenticated" ? "authenticated" : "unknown"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCurrentUser();
  }, [loadCurrentUser]);

  useEffect(() => {
    function refreshWhenVisible() {
      if (document.visibilityState === "visible") {
        void loadCurrentUser();
      }
    }

    window.addEventListener("focus", loadCurrentUser);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.removeEventListener("focus", loadCurrentUser);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadCurrentUser]);

  async function login(input: LoginRequest) {
    setLoading(true);
    setError("");
    try {
      setUser(await authService.login(input));
      setStatus("authenticated");
      return true;
    } catch (err) {
      setUser(null);
      setStatus("unauthenticated");
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
      setStatus("unauthenticated");
      setLoading(false);
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      status,
      error,
      refreshCurrentUser: loadCurrentUser,
      login,
      logout,
    }),
    [user, loading, status, error, loadCurrentUser]
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
