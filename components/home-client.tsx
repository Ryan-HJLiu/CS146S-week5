"use client";

import { useEffect, useState } from "react";

import { ActionItemsPanel } from "@/components/action-items-panel";
import { NotesPanel } from "@/components/notes-panel";
import {
  createActionItem,
  createNote,
  listActionItems,
  listNotes,
  updateActionItem,
} from "@/lib/api-client";
import type { ActionItem, Note } from "@/lib/types";

type HomeClientProps = {
  initialData?: {
    notes: Note[];
    actionItems: ActionItem[];
  };
};

async function fetchHomeData() {
  const [notes, actionItems] = await Promise.all([listNotes(), listActionItems()]);

  return { notes, actionItems };
}

export function HomeClient({ initialData }: HomeClientProps) {
  const [notes, setNotes] = useState<Note[]>(initialData?.notes ?? []);
  const [actionItems, setActionItems] = useState<ActionItem[]>(
    initialData?.actionItems ?? [],
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBooting, setIsBooting] = useState(!initialData);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [isSubmittingActionItem, setIsSubmittingActionItem] = useState(false);
  const [pendingActionItemIds, setPendingActionItemIds] = useState<Set<string>>(
    () => new Set(),
  );

  async function refreshData() {
    try {
      const { notes: nextNotes, actionItems: nextActionItems } =
        await fetchHomeData();

      setNotes(nextNotes);
      setActionItems(nextActionItems);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "資料載入失敗，請先檢查 Blob token。",
      );
    } finally {
      setIsBooting(false);
    }
  }

  useEffect(() => {
    if (initialData) {
      return;
    }

    async function loadInitialData() {
      try {
        const { notes: nextNotes, actionItems: nextActionItems } =
          await fetchHomeData();

        setNotes(nextNotes);
        setActionItems(nextActionItems);
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "資料載入失敗，請先檢查 Blob token。",
        );
      } finally {
        setIsBooting(false);
      }
    }

    void loadInitialData();
  }, [initialData]);

  async function handleCreateNote(input: { title: string; content: string }) {
    setIsSubmittingNote(true);
    setErrorMessage(null);

    try {
      await createNote(input);
      await refreshData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "新增筆記失敗，請稍後再試。",
      );
      throw error;
    } finally {
      setIsSubmittingNote(false);
    }
  }

  async function handleCreateActionItem(input: { description: string }) {
    setIsSubmittingActionItem(true);
    setErrorMessage(null);

    try {
      await createActionItem(input);
      await refreshData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "新增待辦失敗，請稍後再試。",
      );
      throw error;
    } finally {
      setIsSubmittingActionItem(false);
    }
  }

  async function handleToggleActionItem(id: string, completed: boolean) {
    setPendingActionItemIds((current) => new Set(current).add(id));
    setErrorMessage(null);

    try {
      await updateActionItem(id, { completed });
      await refreshData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "更新待辦失敗，請稍後再試。",
      );
    } finally {
      setPendingActionItemIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <h1 className="page-title">我的笔记和TODO</h1>
      </header>

      {errorMessage ? (
        <p className="error-banner" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <div className="workspace-grid">
        <NotesPanel
          isLoading={isBooting}
          notes={notes}
          isSubmitting={isSubmittingNote}
          onCreate={handleCreateNote}
        />

        <ActionItemsPanel
          actionItems={actionItems}
          isLoading={isBooting}
          isSubmitting={isSubmittingActionItem}
          pendingIds={pendingActionItemIds}
          onCreate={handleCreateActionItem}
          onToggle={handleToggleActionItem}
        />
      </div>
    </main>
  );
}
