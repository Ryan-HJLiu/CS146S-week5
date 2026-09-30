import { NextResponse } from "next/server";

import { updateAppState } from "@/lib/blob-store";
import { NotFoundError } from "@/lib/errors";
import { handleRouteError } from "@/lib/route-errors";
import { readActionItemUpdate } from "@/lib/validators";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const payload = readActionItemUpdate(await request.json());
    let updatedItem:
      | {
          id: string;
          description: string;
          completed: boolean;
          createdAt: string;
        }
      | null = null;

    await updateAppState((state) => {
      const nextActionItems = state.actionItems.map((actionItem) => {
        if (actionItem.id !== id) {
          return actionItem;
        }

        updatedItem = {
          ...actionItem,
          completed: payload.completed,
        };

        return updatedItem;
      });

      if (!updatedItem) {
        throw new NotFoundError("找不到這筆待辦事項。");
      }

      return {
        ...state,
        actionItems: nextActionItems,
        updatedAt: new Date().toISOString(),
      };
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    return handleRouteError(error);
  }
}
