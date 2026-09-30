import type { ActionItem, Note } from "@/lib/types";
import { sortActionItems, sortNotes } from "@/lib/types";

type HomeApiState = {
  notes: Note[];
  actionItems: ActionItem[];
};

type HomeApiFakeOptions = {
  notes?: Note[];
  actionItems?: ActionItem[];
};

function cloneState(state: HomeApiState): HomeApiState {
  return {
    notes: state.notes.map((note) => ({ ...note })),
    actionItems: state.actionItems.map((actionItem) => ({ ...actionItem })),
  };
}

function createId(prefix: string, nextNumber: number): string {
  return `${prefix}-${nextNumber}`;
}

export function createHomeApiFake(
  options: HomeApiFakeOptions = {},
): {
  listNotes: () => Promise<Note[]>;
  listActionItems: () => Promise<ActionItem[]>;
  createNote: (input: { title: string; content: string }) => Promise<Note>;
  deleteNote: (id: string) => Promise<Note>;
  createActionItem: (input: { description: string }) => Promise<ActionItem>;
  updateActionItem: (
    id: string,
    input: { completed: boolean },
  ) => Promise<ActionItem>;
} {
  const state: HomeApiState = cloneState({
    notes: options.notes ?? [],
    actionItems: options.actionItems ?? [],
  });

  let noteCounter = state.notes.length + 1;
  let actionItemCounter = state.actionItems.length + 1;

  return {
    async listNotes() {
      return sortNotes(state.notes).map((note) => ({ ...note }));
    },

    async listActionItems() {
      return sortActionItems(state.actionItems).map((actionItem) => ({
        ...actionItem,
      }));
    },

    async createNote(input) {
      const note: Note = {
        id: createId("note", noteCounter),
        title: input.title,
        content: input.content,
        createdAt: new Date(`2026-04-${String(noteCounter).padStart(2, "0")}T09:00:00.000Z`)
          .toISOString(),
      };

      noteCounter += 1;
      state.notes = sortNotes([note, ...state.notes]);

      return { ...note };
    },

    async deleteNote(id) {
      const target = state.notes.find((note) => note.id === id);

      if (!target) {
        throw new Error("找不到這筆筆記。");
      }

      state.notes = state.notes.filter((note) => note.id !== id);

      return { ...target };
    },

    async createActionItem(input) {
      const actionItem: ActionItem = {
        id: createId("action", actionItemCounter),
        description: input.description,
        completed: false,
        createdAt: new Date(
          `2026-04-${String(actionItemCounter).padStart(2, "0")}T10:00:00.000Z`,
        ).toISOString(),
      };

      actionItemCounter += 1;
      state.actionItems = sortActionItems([actionItem, ...state.actionItems]);

      return { ...actionItem };
    },

    async updateActionItem(id, input) {
      const target = state.actionItems.find((actionItem) => actionItem.id === id);

      if (!target) {
        throw new Error("找不到這筆待辦事項。");
      }

      const nextActionItem = {
        ...target,
        completed: input.completed,
      };

      state.actionItems = sortActionItems(
        state.actionItems.map((actionItem) =>
          actionItem.id === id ? nextActionItem : actionItem,
        ),
      );

      return { ...nextActionItem };
    },
  };
}
