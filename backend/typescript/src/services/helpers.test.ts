import { HttpError } from "../middleware/errors";
import {
  assertExists,
  assertNotExists,
  assertRowsAffected,
  firstRowOrNotFound,
  formatDate,
  loadChildrenForParents,
} from "./helpers";

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

describe("firstRowOrNotFound", () => {
  it("returns the first row", () => {
    expect(firstRowOrNotFound([{ id: "a" }], "missing")).toEqual({ id: "a" });
  });

  it("throws a 404 error when there are no rows", () => {
    expect(() => firstRowOrNotFound([], "missing")).toThrow(HttpError);
    try {
      firstRowOrNotFound([], "missing");
    } catch (error) {
      expect((error as HttpError).status).toBe(404);
      expect((error as HttpError).message).toBe("missing");
    }
  });
});

describe("assertRowsAffected", () => {
  it("does nothing when rows were affected", () => {
    expect(() => assertRowsAffected({ rowCount: 1 }, "missing")).not.toThrow();
  });

  it("throws a 404 error when no rows were affected", () => {
    expect(() => assertRowsAffected({ rowCount: 0 }, "missing")).toThrow(
      HttpError
    );
  });
});

describe("assertExists", () => {
  it("does nothing when the query returns true", async () => {
    const queryable = {
      query: jest.fn().mockResolvedValue({ rows: [{ exists: true }] }),
    };

    await expect(
      assertExists(queryable, "SELECT EXISTS", ["id"], "missing")
    ).resolves.toBeUndefined();
    expect(queryable.query).toHaveBeenCalledWith("SELECT EXISTS", ["id"]);
  });

  it("throws a 404 error when the query returns false", async () => {
    const queryable = {
      query: jest.fn().mockResolvedValue({ rows: [{ exists: false }] }),
    };

    await expect(
      assertExists(queryable, "SELECT EXISTS", ["id"], "missing")
    ).rejects.toMatchObject({ status: 404, message: "missing" });
  });
});

describe("assertNotExists", () => {
  it("does nothing when the query returns false", async () => {
    const queryable = {
      query: jest.fn().mockResolvedValue({ rows: [{ exists: false }] }),
    };

    await expect(
      assertNotExists(queryable, "SELECT EXISTS", ["id"], 400, "used")
    ).resolves.toBeUndefined();
    expect(queryable.query).toHaveBeenCalledWith("SELECT EXISTS", ["id"]);
  });

  it("throws the provided error when the query returns true", async () => {
    const queryable = {
      query: jest.fn().mockResolvedValue({ rows: [{ exists: true }] }),
    };

    await expect(
      assertNotExists(queryable, "SELECT EXISTS", ["id"], 400, "used")
    ).rejects.toMatchObject({ status: 400, message: "used" });
  });
});
