import userEvent from "@testing-library/user-event";
import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { HomeClient } from "@/components/home-client";
import * as apiClient from "@/lib/api-client";
import { createHomeApiFake } from "@/tests/fakes/home-api";

vi.mock("@/lib/api-client", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api-client")>(
    "@/lib/api-client",
  );

  return {
    ...actual,
    createNote: vi.fn(),
    createActionItem: vi.fn(),
    listNotes: vi.fn(),
    listActionItems: vi.fn(),
    updateActionItem: vi.fn(),
  };
});

describe("HomeClient interactions", () => {
  function installApiFake(options?: {
    notes?: Parameters<typeof createHomeApiFake>[0]["notes"];
    actionItems?: Parameters<typeof createHomeApiFake>[0]["actionItems"];
  }) {
    const fake = createHomeApiFake(options);

    vi.mocked(apiClient.listNotes).mockImplementation(fake.listNotes);
    vi.mocked(apiClient.listActionItems).mockImplementation(fake.listActionItems);
    vi.mocked(apiClient.createNote).mockImplementation(fake.createNote);
    vi.mocked(apiClient.createActionItem).mockImplementation(fake.createActionItem);
    vi.mocked(apiClient.updateActionItem).mockImplementation(fake.updateActionItem);

    return fake;
  }

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("creates a note with the in-memory API fake and reloads the list", async () => {
    const user = userEvent.setup();
    const listNotesMock = vi.mocked(apiClient.listNotes);
    const createNoteMock = vi.mocked(apiClient.createNote);
    installApiFake();

    render(
      <HomeClient
        initialData={{
          notes: [],
          actionItems: [],
        }}
      />,
    );

    await user.type(screen.getByLabelText("筆記標題"), "補 README");
    await user.type(
      screen.getByLabelText("筆記內容"),
      "把 Blob token 的步驟寫清楚。",
    );
    await user.click(screen.getByRole("button", { name: "新增筆記" }));

    await waitFor(() => {
      expect(createNoteMock).toHaveBeenCalledWith({
        title: "補 README",
        content: "把 Blob token 的步驟寫清楚。",
      });
    });

    await waitFor(() => {
      expect(listNotesMock).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText("補 README")).toBeInTheDocument();
  });

  it("creates an action item with the in-memory API fake", async () => {
    const user = userEvent.setup();
    const createActionItemMock = vi.mocked(apiClient.createActionItem);
    installApiFake();

    render(
      <HomeClient
        initialData={{
          notes: [],
          actionItems: [],
        }}
      />,
    );

    await user.type(screen.getByLabelText("待辦描述"), "整理 writeup");
    await user.click(screen.getByRole("button", { name: "新增待辦" }));

    await waitFor(() => {
      expect(createActionItemMock).toHaveBeenCalledWith({
        description: "整理 writeup",
      });
    });

    expect(screen.getByText("整理 writeup")).toBeInTheDocument();
  });

  it("reloads and reorders action items after toggling a checkbox", async () => {
    const user = userEvent.setup();
    const updateActionItemMock = vi.mocked(apiClient.updateActionItem);
    installApiFake({
      actionItems: [
        {
          id: "action-1",
          description: "先完成這項",
          completed: false,
          createdAt: "2026-03-30T10:00:00.000Z",
        },
        {
          id: "action-2",
          description: "另一項待辦",
          completed: false,
          createdAt: "2026-03-29T10:00:00.000Z",
        },
      ],
    });

    render(
      <HomeClient
        initialData={{
          notes: [],
          actionItems: [
            {
              id: "action-1",
              description: "先完成這項",
              completed: false,
              createdAt: "2026-03-30T10:00:00.000Z",
            },
            {
              id: "action-2",
              description: "另一項待辦",
              completed: false,
              createdAt: "2026-03-29T10:00:00.000Z",
            },
          ],
        }}
      />,
    );

    await user.click(screen.getByLabelText("切換待辦：先完成這項"));

    await waitFor(() => {
      expect(updateActionItemMock).toHaveBeenCalledWith("action-1", {
        completed: true,
      });
    });

    await waitFor(() => {
      const descriptions = screen
        .getAllByText(/先完成這項|另一項待辦/)
        .map((element) => element.textContent);

      expect(descriptions).toEqual(["另一項待辦", "先完成這項"]);
      expect(screen.getByLabelText("切換待辦：先完成這項")).toBeChecked();
    });
  });

  it("shows a visible error when note creation fails", async () => {
    const user = userEvent.setup();
    const createNoteMock = vi.mocked(apiClient.createNote);
    installApiFake();
    createNoteMock.mockRejectedValueOnce(new Error("新增筆記失敗。"));

    render(
      <HomeClient
        initialData={{
          notes: [],
          actionItems: [],
        }}
      />,
    );

    await user.type(screen.getByLabelText("筆記標題"), "補 README");
    await user.type(screen.getByLabelText("筆記內容"), "補上部署說明");
    await user.click(screen.getByRole("button", { name: "新增筆記" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("新增筆記失敗。");
    expect(screen.queryByText("補 README")).not.toBeInTheDocument();
  });

  it("shows a visible error when action item creation fails", async () => {
    const user = userEvent.setup();
    const createActionItemMock = vi.mocked(apiClient.createActionItem);
    installApiFake();
    createActionItemMock.mockRejectedValueOnce(new Error("新增待辦失敗。"));

    render(
      <HomeClient
        initialData={{
          notes: [],
          actionItems: [],
        }}
      />,
    );

    await user.type(screen.getByLabelText("待辦描述"), "整理部署驗證");
    await user.click(screen.getByRole("button", { name: "新增待辦" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("新增待辦失敗。");
    expect(screen.queryByText("整理部署驗證")).not.toBeInTheDocument();
  });

  it("shows a visible error and preserves state when toggle fails", async () => {
    const user = userEvent.setup();
    const updateActionItemMock = vi.mocked(apiClient.updateActionItem);
    installApiFake({
      actionItems: [
        {
          id: "action-1",
          description: "保留原狀態",
          completed: false,
          createdAt: "2026-03-30T10:00:00.000Z",
        },
      ],
    });
    updateActionItemMock.mockRejectedValueOnce(new Error("更新待辦失敗。"));

    render(
      <HomeClient
        initialData={{
          notes: [],
          actionItems: [
            {
              id: "action-1",
              description: "保留原狀態",
              completed: false,
              createdAt: "2026-03-30T10:00:00.000Z",
            },
          ],
        }}
      />,
    );

    const checkbox = screen.getByLabelText("切換待辦：保留原狀態");
    await user.click(checkbox);

    expect(await screen.findByRole("alert")).toHaveTextContent("更新待辦失敗。");
    expect(checkbox).not.toBeChecked();
  });
});
