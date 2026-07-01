import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from "./LoginPage";

const login = jest.fn();

jest.mock("../hooks", () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    error: "",
    login,
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    login.mockReset();
  });

  it("submits credentials and navigates after successful login", async () => {
    login.mockResolvedValue(true);
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/training-log" element={<p>Training log page</p>} />
        </Routes>
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Username"), "admin");
    await user.type(screen.getByLabelText("Password"), "password");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(login).toHaveBeenCalledWith({ username: "admin", password: "password" });
    expect(await screen.findByText("Training log page")).toBeInTheDocument();
  });
});
