import { useState } from "react";

import {
  formatAbsoluteDate,
  formatDisplayDate,
} from "@/lib/format-display-date";
import type { Note } from "@/lib/types";

type NotesPanelProps = {
  isLoading: boolean;
  notes: Note[];
  isSubmitting: boolean;
  onCreate: (input: { title: string; content: string }) => Promise<void>;
};

export function NotesPanel({
  isLoading,
  notes,
  isSubmitting,
  onCreate,
}: NotesPanelProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await onCreate({ title, content });
      setTitle("");
      setContent("");
    } catch {
      // 錯誤訊息由外層頁面統一顯示。
    }
  }

  return (
    <section className="panel" aria-labelledby="notes-title">
      <header className="panel-header">
        <h2 id="notes-title" className="panel-title">
          筆記
        </h2>
      </header>

      <form className="stack-form" onSubmit={(event) => void handleSubmit(event)}>
        <div className="field-row">
          <label className="sr-only" htmlFor="note-title">
            筆記標題
          </label>
          <input
            id="note-title"
            className="text-input"
            placeholder="標題"
            disabled={isLoading || isSubmitting}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="field-row">
          <label className="sr-only" htmlFor="note-content">
            筆記內容
          </label>
          <textarea
            id="note-content"
            className="text-area"
            placeholder="內容"
            disabled={isLoading || isSubmitting}
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </div>

        <button
          aria-label="新增筆記"
          className="primary-button"
          type="submit"
          disabled={isLoading || isSubmitting || !title.trim() || !content.trim()}
        >
          {isSubmitting ? "儲存中" : "新增"}
        </button>
      </form>

      {isLoading ? (
        <ul className="list" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <li key={index} className="loading-card note-card" />
          ))}
        </ul>
      ) : notes.length === 0 ? (
        <div className="list-empty" aria-hidden="true" />
      ) : (
        <ul className="list">
          {notes.map((note) => (
            <li key={note.id} className="note-card">
              <div className="note-title-row">
                <h3 className="note-title">{note.title}</h3>
                <span
                  className="note-time"
                  title={formatAbsoluteDate(note.createdAt)}
                >
                  {formatDisplayDate(note.createdAt)}
                </span>
              </div>
              <p className="note-content">{note.content}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
