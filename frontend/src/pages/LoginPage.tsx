import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ActionButton } from "../components";
import { useAuth } from "../hooks";
import { appRoutes } from "../routes";

type LocationState = {
  from?: { pathname?: string };
};

export function LoginPage() {
  const { user, loading, error, login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname || appRoutes.trainingLog;

  if (user) {
    return <Navigate replace to={appRoutes.trainingLog} />;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const loggedIn = await login({ username, password });
    if (loggedIn) {
      navigate(redirectTo, { replace: true });
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-2rem)] place-items-center sm:min-h-[calc(100vh-4rem)]">
      <section className="w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-900 p-4 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-400">
          Valetudo
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white sm:mt-2 sm:text-3xl">
          Login
        </h1>

        <form className="mt-5 grid gap-3 sm:mt-6 sm:gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-semibold text-neutral-200">
            Username
            <input
              className="input"
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-neutral-200">
            Password
            <input
              className="input"
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && (
            <p className="rounded border border-primary-700 bg-primary-950 px-3 py-2 text-sm text-primary-100">
              {error}
            </p>
          )}

          <ActionButton className="w-full" disabled={loading} type="submit">
            {loading ? "Logging in..." : "Login"}
          </ActionButton>
        </form>
      </section>
    </div>
  );
}
