import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

let authState = {
  user: null as { id: string; username: string } | null,
  loading: false,
};

jest.mock("../hooks", () => ({
  useAuth: () => authState,
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    authState = { user: null, loading: false };
  });

  it("redirects unauthenticated users to login", () => {
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

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("renders protected pages for authenticated users", () => {
    authState = {
      user: { id: "user-id", username: "admin" },
      loading: false,
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
