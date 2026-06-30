import { slugifyLabel } from "./common";

describe("slugifyLabel", () => {
  it("normalizes text labels into lowercase slugs", () => {
    expect(slugifyLabel("Chicken Breast")).toBe("chicken-breast");
  });

  it("collapses non-alphanumeric characters", () => {
    expect(slugifyLabel("  Bench press / wide grip  ")).toBe(
      "bench-press-wide-grip"
    );
  });

  it("returns an empty string when no slug content exists", () => {
    expect(slugifyLabel("!!!")).toBe("");
  });
});
