import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ClockPage } from "./ClockPage";

jest.mock("../hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    logout: jest.fn(),
  }),
}));

describe("ClockPage", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-08-11T10:15:30"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders an analog clock page", () => {
    render(
      <MemoryRouter initialEntries={["/clock"]}>
        <ClockPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Clock" })).toBeInTheDocument();
    expect(screen.getByLabelText("Analog clock")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clock" })).toHaveAttribute(
      "href",
      "/clock"
    );
  });
});
