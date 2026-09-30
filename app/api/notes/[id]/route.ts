import { NextResponse } from "next/server";

import { updateAppState } from "@/lib/blob-store";
import { NotFoundError } from "@/lib/errors";
import { handleRouteError } from "@/lib/route-errors";
import type { Note } from "@/lib/types";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    let deletedNote: Note | null = null;

    await updateAppState((state) => {
      deletedNote = state.notes.find((note) => note.id === id) ?? null;

      if (!deletedNote) {
        throw new NotFoundError("找不到這筆筆記。");
      }

      return {
        ...state,
        notes: state.notes.filter((note) => note.id !== id),
        updatedAt: new Date().toISOString(),
      };
    });

    return NextResponse.json(deletedNote);
  } catch (error) {
    return handleRouteError(error);
  }
}
