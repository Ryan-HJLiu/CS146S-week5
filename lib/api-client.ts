import type {
  ActionItem,
  CreateActionItemInput,
  CreateNoteInput,
  Note,
  UpdateActionItemInput,
} from "@/lib/types";

async function requestJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, init);

  if (!response.ok) {
    let message = "請求失敗，請稍後再試。";

    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      // 保持預設訊息即可。
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function listNotes(): Promise<Note[]> {
  return requestJson<Note[]>("/api/notes");
}

export function createNote(input: CreateNoteInput): Promise<Note> {
  return requestJson<Note>("/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export function deleteNote(id: string): Promise<Note> {
  return requestJson<Note>(`/api/notes/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function listActionItems(): Promise<ActionItem[]> {
  return requestJson<ActionItem[]>("/api/action-items");
}

export function createActionItem(
  input: CreateActionItemInput,
): Promise<ActionItem> {
  return requestJson<ActionItem>("/api/action-items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}

export function updateActionItem(
  id: string,
  input: UpdateActionItemInput,
): Promise<ActionItem> {
  return requestJson<ActionItem>(`/api/action-items/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
}
