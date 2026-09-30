import seedData from "@/data/seed/app-state.json";
import type { AppState } from "@/lib/types";
import { normalizeAppState, parseAppState } from "@/lib/types";

function readTimestamp(value: string): number {
  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    throw new Error("Seed 內含無效日期，請檢查 data/seed/app-state.json。");
  }

  return timestamp;
}

function shiftTimestamp(value: string, offsetMs: number): string {
  return new Date(readTimestamp(value) + offsetMs).toISOString();
}

function shiftSeedStateToNow(state: AppState, referenceTime: number): AppState {
  const offsetMs = referenceTime - readTimestamp(state.updatedAt);

  return {
    notes: state.notes.map((note) => ({
      ...note,
      createdAt: shiftTimestamp(note.createdAt, offsetMs),
    })),
    actionItems: state.actionItems.map((actionItem) => ({
      ...actionItem,
      createdAt: shiftTimestamp(actionItem.createdAt, offsetMs),
    })),
    updatedAt: shiftTimestamp(state.updatedAt, offsetMs),
  };
}

export function cloneSeedState(referenceTime = Date.now()): AppState {
  const parsedSeedState = parseAppState(structuredClone(seedData));

  return normalizeAppState(
    shiftSeedStateToNow(parsedSeedState, referenceTime),
  );
}
