import { NextResponse } from "next/server";

import { readAppState, updateAppState } from "@/lib/blob-store";
import { handleRouteError } from "@/lib/route-errors";
import { readActionItemInput } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET() {
  try {
    const state = await readAppState();
    return NextResponse.json(state.actionItems);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = readActionItemInput(await request.json());
    const actionItem = {
      id: crypto.randomUUID(),
      description: payload.description,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    await updateAppState((state) => ({
      ...state,
      actionItems: [actionItem, ...state.actionItems],
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json(actionItem, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
