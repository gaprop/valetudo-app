import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PageNavigation } from "./PageNavigation";

describe("PageNavigation", () => {
  it("renders links for the primary pages", () => {
    render(
      <MemoryRouter initialEntries={["/training-log"]}>
        <PageNavigation />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Training log" })).toHaveAttribute(
      "href",
      "/training-log"
    );
    expect(screen.getByRole("link", { name: "Workout plan" })).toHaveAttribute(
      "href",
      "/workout-plan"
    );
    expect(screen.getByRole("link", { name: "Recipes" })).toHaveAttribute(
      "href",
      "/recipes"
    );
  });

  it("marks the current route as active", () => {
    render(
      <MemoryRouter initialEntries={["/recipes"]}>
        <PageNavigation />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Recipes" })).toHaveClass(
      "text-primary-100"
    );
  });
});
