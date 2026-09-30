import {
  formatAbsoluteDate,
  formatDisplayDate,
} from "@/lib/format-display-date";

describe("formatDisplayDate", () => {
  const now = new Date("2026-04-15T10:00:00.000Z");

  it("uses relative time for dates within seven days", () => {
    expect(formatDisplayDate("2026-04-15T09:55:00.000Z", now)).toBe("5 分鐘前");
    expect(formatDisplayDate("2026-04-14T10:00:00.000Z", now)).toBe("昨天");
    expect(formatDisplayDate("2026-04-08T10:00:00.000Z", now)).toBe("7 天前");
  });

  it("uses an absolute date after seven days", () => {
    const value = "2026-04-08T09:59:59.999Z";

    expect(formatDisplayDate(value, now)).toBe(formatAbsoluteDate(value));
  });

  it("handles future dates within seven days", () => {
    expect(formatDisplayDate("2026-04-16T10:00:00.000Z", now)).toBe("明天");
  });

  it("returns a stable label for invalid dates", () => {
    expect(formatDisplayDate("not-a-date", now)).toBe("日期無效");
    expect(formatAbsoluteDate("not-a-date")).toBe("日期無效");
  });
});
