import { formatDdMmYyyyDate, parseDdMmYyyyDate } from "./dateFormatting";

describe("date formatting", () => {
  it("formats ISO dates as dd/mm/yyyy dates", () => {
    expect(formatDdMmYyyyDate("2026-08-11")).toBe("11/08/2026");
  });

  it("parses dd/mm/yyyy dates as ISO dates", () => {
    expect(parseDdMmYyyyDate("11/08/2026")).toBe("2026-08-11");
  });

  it("rejects invalid dd/mm/yyyy dates", () => {
    expect(parseDdMmYyyyDate("31/02/2026")).toBeNull();
    expect(parseDdMmYyyyDate("2026-08-11")).toBeNull();
  });
});
