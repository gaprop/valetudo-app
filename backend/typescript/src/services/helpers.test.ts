import { formatDate, loadChildrenForParents } from "./helpers";

describe("formatDate", () => {
  it("formats dates as YYYY-MM-DD", () => {
    expect(formatDate(new Date("2026-06-30T13:45:00.000Z"))).toBe(
      "2026-06-30"
    );
  });
});

describe("loadChildrenForParents", () => {
  it("loads and assigns children for each parent in order", async () => {
    const parents = [
      { id: "a", children: [] as string[] },
      { id: "b", children: [] as string[] },
    ];

    await loadChildrenForParents(
      parents,
      async (parent) => [`${parent.id}-1`, `${parent.id}-2`],
      (parent, children) => {
        parent.children = children;
      }
    );

    expect(parents).toEqual([
      { id: "a", children: ["a-1", "a-2"] },
      { id: "b", children: ["b-1", "b-2"] },
    ]);
  });
});
