import {
  formatDdMmYyyyDate,
  parseDdMmYyyyDate,
  toApiDate,
} from "./dateFormatting";

describe("date formatting", () => {
  it("formats ISO dates as dd/mm/yyyy dates", () => {
    expect(formatDdMmYyyyDate("2026-08-11")).toBe("11/08/2026");
  });

  it("parses dd/mm/yyyy dates as ISO dates", () => {
    expect(parseDdMmYyyyDate("11/08/2026")).toBe("2026-08-11");
    expect(parseDdMmYyyyDate("1/8/2026")).toBe("2026-08-01");
    expect(parseDdMmYyyyDate(" 11/08/2026 ")).toBe("2026-08-11");
  });

  it("rejects invalid dd/mm/yyyy dates", () => {
    expect(parseDdMmYyyyDate("31/02/2026")).toBeNull();
    expect(parseDdMmYyyyDate("2026-08-11")).toBeNull();
  });

  it("normalizes display dates for API requests", () => {
    expect(toApiDate("11/08/2026")).toBe("2026-08-11");
    expect(toApiDate("2026-08-11")).toBe("2026-08-11");
  });
});
