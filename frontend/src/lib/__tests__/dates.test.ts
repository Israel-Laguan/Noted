import { describe, expect, it } from "vitest";
import { formatLastEdited, formatNoteDate } from "../dates";

describe("note date formatting", () => {
  const now = new Date(2026, 6, 22, 14, 30);

  it("uses today and yesterday for recent notes", () => {
    expect(formatNoteDate(new Date(2026, 6, 22, 8), now)).toBe("today");
    expect(formatNoteDate(new Date(2026, 6, 21, 23), now)).toBe("yesterday");
  });

  it("uses month and day without a year for older notes", () => {
    expect(formatNoteDate(new Date(2026, 5, 12, 8), now)).toBe("June 12");
  });

  it("formats a complete editor timestamp", () => {
    expect(formatLastEdited(new Date(2026, 6, 22, 8, 5), now)).toMatch(/^Last edited today at 8:05 AM$/);
  });
});

