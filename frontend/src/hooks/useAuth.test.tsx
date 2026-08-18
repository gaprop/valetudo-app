import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider, useAuth } from "./useAuth";
import { authService } from "../services";

jest.mock("../services", () => ({
  authService: {
    me: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  },
}));

const mockedAuthService = jest.mocked(authService);

function axiosError(status?: number) {
  return {
    isAxiosError: true,
    response: status ? { status, data: { error: "auth failed" } } : undefined,
    message: "request failed",
  };
}

function AuthConsumer() {
  const { user, status, refreshCurrentUser, login } = useAuth();

  return (
    <div>
      <p>User: {user?.username || "none"}</p>
      <p>Status: {status}</p>
      <button
        type="button"
        onClick={() => void refreshCurrentUser()}
      >
        Refresh
      </button>
      <button
        type="button"
        onClick={() => void login({ username: "admin", password: "password" })}
      >
        Login
      </button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets the current user when /me succeeds", async () => {
    mockedAuthService.me.mockResolvedValue({ id: "user-id", username: "admin" });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(await screen.findByText("User: admin")).toBeInTheDocument();
    expect(screen.getByText("Status: authenticated")).toBeInTheDocument();
  });

  it("clears the current user when /me returns 401", async () => {
    mockedAuthService.me
      .mockResolvedValueOnce({ id: "user-id", username: "admin" })
      .mockRejectedValueOnce(axiosError(401));
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(await screen.findByText("User: admin")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Refresh" }));

    await waitFor(() => {
      expect(screen.getByText("User: none")).toBeInTheDocument();
    });
    expect(screen.getByText("Status: unauthenticated")).toBeInTheDocument();
  });

  it("keeps the current user when /me has a transient failure", async () => {
    mockedAuthService.me
      .mockResolvedValueOnce({ id: "user-id", username: "admin" })
      .mockRejectedValueOnce(axiosError(500));
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(await screen.findByText("User: admin")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Refresh" }));

    await waitFor(() => {
      expect(mockedAuthService.me).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByText("User: admin")).toBeInTheDocument();
    expect(screen.getByText("Status: authenticated")).toBeInTheDocument();
  });

  it("refreshes the current user when the page becomes visible", async () => {
    mockedAuthService.me.mockResolvedValue({ id: "user-id", username: "admin" });

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    expect(await screen.findByText("User: admin")).toBeInTheDocument();

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await waitFor(() => {
      expect(mockedAuthService.me).toHaveBeenCalledTimes(2);
    });
  });
});
