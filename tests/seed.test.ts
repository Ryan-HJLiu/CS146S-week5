import seedData from "@/data/seed/app-state.json";
import { cloneSeedState } from "@/lib/seed";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("cloneSeedState", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shifts starter dates relative to the current time", () => {
    vi.setSystemTime(new Date("2026-04-15T10:00:00.000Z"));

    const state = cloneSeedState();
    const originalUpdatedAt = Date.parse(seedData.updatedAt);
    const shiftedNoteOne = state.notes.find((note) => note.id === "note-1");

    expect(state.updatedAt).toBe("2026-04-15T10:00:00.000Z");
    expect(state.notes[0]?.id).toBe("note-15");
    expect(shiftedNoteOne).toBeDefined();
    expect(
      Date.parse(shiftedNoteOne!.createdAt) - Date.parse(state.updatedAt),
    ).toBe(Date.parse(seedData.notes[0]!.createdAt) - originalUpdatedAt);
  });
});
