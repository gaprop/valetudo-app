import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

let authState = {
  user: null as { id: string; username: string } | null,
  loading: false,
  status: "unauthenticated",
  refreshCurrentUser: jest.fn<Promise<void>, []>(() => Promise.resolve()),
};

jest.mock("../hooks", () => ({
  useAuth: () => authState,
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    authState = {
      user: null,
      loading: false,
      status: "unauthenticated",
      refreshCurrentUser: jest.fn<Promise<void>, []>(() => Promise.resolve()),
    };
  });

  it("redirects unauthenticated users to login", async () => {
    render(
      <MemoryRouter initialEntries={["/training-log"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/training-log" element={<p>Training log page</p>} />
          </Route>
          <Route path="/login" element={<p>Login page</p>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Login page")).toBeInTheDocument();
    expect(authState.refreshCurrentUser).toHaveBeenCalled();
  });

  it("renders protected pages for authenticated users", async () => {
    authState = {
      user: { id: "user-id", username: "admin" },
      loading: false,
      status: "authenticated",
      refreshCurrentUser: jest.fn<Promise<void>, []>(() => Promise.resolve()),
    };

    render(
      <MemoryRouter initialEntries={["/training-log"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/training-log" element={<p>Training log page</p>} />
          </Route>
          <Route path="/login" element={<p>Login page</p>} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText("Training log page")).toBeInTheDocument();
    expect(authState.refreshCurrentUser).toHaveBeenCalled();
  });

  it("keeps rendering protected pages for authenticated users while refreshing", () => {
    authState = {
      user: { id: "user-id", username: "admin" },
      loading: true,
      status: "authenticated",
      refreshCurrentUser: jest.fn<Promise<void>, []>(() => new Promise(() => undefined)),
    };

    render(
      <MemoryRouter initialEntries={["/training-log"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/training-log" element={<p>Training log page</p>} />
          </Route>
          <Route path="/login" element={<p>Login page</p>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Training log page")).toBeInTheDocument();
  });
});
