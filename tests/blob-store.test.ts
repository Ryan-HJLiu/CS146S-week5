/**
 * @vitest-environment node
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import { readAppState, resetAppState, updateAppState } from "@/lib/blob-store";

const { getMock, putMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  putMock: vi.fn(),
}));

vi.mock("@vercel/blob", () => ({
  BlobPreconditionFailedError: class BlobPreconditionFailedError extends Error {},
  get: getMock,
  put: putMock,
}));

function createBlobResult(payload: unknown, etag = "etag-1") {
  return {
    blob: {
      etag,
      pathname: "week5/app-state.json",
    },
    stream: new Response(JSON.stringify(payload)).body,
  };
}

describe("blob-store helpers", () => {
  beforeEach(() => {
    process.env.BLOB_READ_WRITE_TOKEN = "test-token";
    getMock.mockReset();
    putMock.mockReset();
  });

  it("seeds the blob with starter data when the file does not exist yet", async () => {
    getMock.mockResolvedValue(null);
    putMock.mockResolvedValue({});

    const state = await readAppState();

    expect(state.notes.length).toBeGreaterThan(0);
    expect(putMock).toHaveBeenCalledTimes(1);
  });

  it("writes updated data back to the same fixed pathname", async () => {
    getMock.mockResolvedValue(
      createBlobResult({
        notes: [],
        actionItems: [],
        updatedAt: "2026-03-30T00:00:00.000Z",
      }),
    );
    putMock.mockResolvedValue({});

    await updateAppState((state) => ({
      ...state,
      notes: [
        {
          id: "note-99",
          title: "新的筆記",
          content: "確認 updateAppState 會寫回同一個 Blob pathname。",
          createdAt: "2026-03-30T08:00:00.000Z",
        },
      ],
      updatedAt: "2026-03-30T08:00:00.000Z",
    }));

    expect(putMock).toHaveBeenCalledWith(
      "week5/app-state.json",
      expect.any(String),
      expect.objectContaining({
        access: "private",
        addRandomSuffix: false,
      }),
    );
  });

  it("resetAppState overwrites the store with seed data", async () => {
    putMock.mockResolvedValue({});

    const state = await resetAppState();

    expect(state.actionItems.length).toBeGreaterThan(0);
    expect(putMock).toHaveBeenCalledWith(
      "week5/app-state.json",
      expect.any(String),
      expect.objectContaining({
        allowOverwrite: true,
      }),
    );
  });
});
