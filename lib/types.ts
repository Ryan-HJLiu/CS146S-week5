export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export type ActionItem = {
  id: string;
  description: string;
  completed: boolean;
  createdAt: string;
};

export type AppState = {
  notes: Note[];
  actionItems: ActionItem[];
  updatedAt: string;
};

export type CreateNoteInput = {
  title: string;
  content: string;
};

export type CreateActionItemInput = {
  description: string;
};

export type UpdateActionItemInput = {
  completed: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNote(value: unknown): value is Note {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.content === "string" &&
    typeof value.createdAt === "string"
  );
}

function isActionItem(value: unknown): value is ActionItem {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.description === "string" &&
    typeof value.completed === "boolean" &&
    typeof value.createdAt === "string"
  );
}

export function parseAppState(value: unknown): AppState {
  if (
    !isRecord(value) ||
    !Array.isArray(value.notes) ||
    !Array.isArray(value.actionItems) ||
    typeof value.updatedAt !== "string" ||
    !value.notes.every(isNote) ||
    !value.actionItems.every(isActionItem)
  ) {
    throw new Error("Blob 裡的資料格式不正確，請先執行 pnpm reset:data。");
  }

  return {
    notes: value.notes,
    actionItems: value.actionItems,
    updatedAt: value.updatedAt,
  };
}

export function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export function sortActionItems(actionItems: ActionItem[]): ActionItem[] {
  return [...actionItems].sort((left, right) => {
    if (left.completed !== right.completed) {
      return Number(left.completed) - Number(right.completed);
    }

    return right.createdAt.localeCompare(left.createdAt);
  });
}

export function normalizeAppState(state: AppState): AppState {
  return {
    notes: sortNotes(state.notes),
    actionItems: sortActionItems(state.actionItems),
    updatedAt: state.updatedAt,
  };
}
