import { NextResponse } from "next/server";

import { readAppState, updateAppState } from "@/lib/blob-store";
import { handleRouteError } from "@/lib/route-errors";
import { readNoteInput } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET() {
  try {
    const state = await readAppState();
    return NextResponse.json(state.notes);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = readNoteInput(await request.json());
    const note = {
      id: crypto.randomUUID(),
      title: payload.title,
      content: payload.content,
      createdAt: new Date().toISOString(),
    };

    await updateAppState((state) => ({
      ...state,
      notes: [note, ...state.notes],
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
