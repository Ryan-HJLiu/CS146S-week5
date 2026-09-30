import { BlobPreconditionFailedError, get, put } from "@vercel/blob";

import { cloneSeedState } from "@/lib/seed";
import type { AppState } from "@/lib/types";
import { normalizeAppState, parseAppState } from "@/lib/types";

const APP_STATE_PATHNAME = "week5/app-state.json";
const WRITE_RETRY_LIMIT = 3;

type Snapshot = {
  state: AppState;
  etag: string | null;
};

export class MissingBlobTokenError extends Error {
  constructor() {
    super(
      "找不到 BLOB_READ_WRITE_TOKEN。請先依照作業第一步完成 Vercel 專案、Blob store 與 .env.local 設定。",
    );
  }
}

function requireBlobToken(): void {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new MissingBlobTokenError();
  }
}

async function readSnapshot(): Promise<Snapshot> {
  requireBlobToken();

  const result = await get(APP_STATE_PATHNAME, {
    access: "private",
    useCache: false,
  });

  if (!result) {
    return {
      state: cloneSeedState(),
      etag: null,
    };
  }

  const text = await new Response(result.stream).text();

  return {
    state: normalizeAppState(parseAppState(JSON.parse(text))),
    etag: result.blob.etag.replace(/^W\//, ""),
  };
}

async function writeSnapshot(state: AppState, etag: string | null): Promise<void> {
  requireBlobToken();

  await put(APP_STATE_PATHNAME, JSON.stringify(normalizeAppState(state), null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: etag !== null,
    ...(etag ? { ifMatch: etag } : {}),
    contentType: "application/json; charset=utf-8",
  });
}

export async function readAppState(): Promise<AppState> {
  const snapshot = await readSnapshot();

  if (snapshot.etag !== null) {
    return snapshot.state;
  }

  try {
    await writeSnapshot(snapshot.state, null);
    return snapshot.state;
  } catch {
    const latest = await readSnapshot();
    return latest.state;
  }
}

export async function resetAppState(): Promise<AppState> {
  const nextState = normalizeAppState(cloneSeedState());

  await put(APP_STATE_PATHNAME, JSON.stringify(nextState, null, 2), {
    access: "private",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json; charset=utf-8",
  });

  return nextState;
}

export async function updateAppState(
  updater: (state: AppState) => AppState | Promise<AppState>,
): Promise<AppState> {
  let lastError: unknown;

  for (let attempt = 0; attempt < WRITE_RETRY_LIMIT; attempt += 1) {
    const snapshot = await readSnapshot();
    const nextState = normalizeAppState(await updater(structuredClone(snapshot.state)));

    try {
      await writeSnapshot(nextState, snapshot.etag);
      return nextState;
    } catch (error) {
      lastError = error;

      if (error instanceof BlobPreconditionFailedError || snapshot.etag === null) {
        continue;
      }

      throw error;
    }
  }

  throw lastError ?? new Error("資料更新時發生衝突，請稍後再試一次。");
}

export function isMissingBlobTokenError(
  error: unknown,
): error is MissingBlobTokenError {
  return error instanceof MissingBlobTokenError;
}
