import { useState } from "react";

import type { ActionItem } from "@/lib/types";

type ActionItemsPanelProps = {
  actionItems: ActionItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  pendingIds: Set<string>;
  onCreate: (input: { description: string }) => Promise<void>;
  onToggle: (id: string, completed: boolean) => Promise<void>;
};

export function ActionItemsPanel({
  actionItems,
  isLoading,
  isSubmitting,
  pendingIds,
  onCreate,
  onToggle,
}: ActionItemsPanelProps) {
  const [description, setDescription] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await onCreate({ description });
      setDescription("");
    } catch {
      // 錯誤訊息由外層頁面統一顯示。
    }
  }

  return (
    <section className="panel" aria-labelledby="action-items-title">
      <header className="panel-header">
        <h2 id="action-items-title" className="panel-title">
          待辦事項
        </h2>
      </header>

      <form className="stack-form" onSubmit={(event) => void handleSubmit(event)}>
        <div className="field-row">
          <label className="sr-only" htmlFor="action-description">
            待辦描述
          </label>
          <input
            id="action-description"
            className="text-input"
            placeholder="新增待辦"
            disabled={isLoading || isSubmitting}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <button
          aria-label="新增待辦"
          className="primary-button"
          type="submit"
          disabled={isLoading || isSubmitting || !description.trim()}
        >
          {isSubmitting ? "儲存中" : "新增"}
        </button>
      </form>

      {isLoading ? (
        <ul className="list" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, index) => (
            <li key={index} className="loading-card action-card" />
          ))}
        </ul>
      ) : actionItems.length === 0 ? (
        <div className="list-empty" aria-hidden="true" />
      ) : (
        <ul className="list">
          {actionItems.map((actionItem) => {
            const isPending = pendingIds.has(actionItem.id);

            return (
              <li key={actionItem.id} className="action-card">
                <div className="action-row" data-pending={isPending}>
                  <input
                    className="action-checkbox"
                    aria-label={`切換待辦：${actionItem.description}`}
                    type="checkbox"
                    checked={actionItem.completed}
                    disabled={isLoading || isPending}
                    onChange={(event) =>
                      void onToggle(actionItem.id, event.target.checked)
                    }
                  />

                  <div className="action-main">
                    <p
                      className="action-description"
                      data-completed={actionItem.completed}
                    >
                      {actionItem.description}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
