import { InputError } from "@/lib/errors";

function readText(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new InputError(`${fieldName}必須是文字。`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new InputError(`${fieldName}不可為空白。`);
  }

  return trimmed;
}

export function readNoteInput(payload: unknown): {
  title: string;
  content: string;
} {
  if (typeof payload !== "object" || payload === null) {
    throw new InputError("送出的筆記資料格式不正確。");
  }

  return {
    title: readText((payload as { title?: unknown }).title, "筆記標題"),
    content: readText((payload as { content?: unknown }).content, "筆記內容"),
  };
}

export function readActionItemInput(payload: unknown): {
  description: string;
} {
  if (typeof payload !== "object" || payload === null) {
    throw new InputError("送出的待辦資料格式不正確。");
  }

  return {
    description: readText(
      (payload as { description?: unknown }).description,
      "待辦描述",
    ),
  };
}

export function readActionItemUpdate(payload: unknown): {
  completed: boolean;
} {
  if (typeof payload !== "object" || payload === null) {
    throw new InputError("送出的更新資料格式不正確。");
  }

  const completed = (payload as { completed?: unknown }).completed;

  if (typeof completed !== "boolean") {
    throw new InputError("待辦完成狀態必須是 true 或 false。");
  }

  return { completed };
}
