import { BlobPreconditionFailedError } from "@vercel/blob";
import { NextResponse } from "next/server";

import { isMissingBlobTokenError } from "@/lib/blob-store";
import { InputError, NotFoundError } from "@/lib/errors";

export function handleRouteError(error: unknown): NextResponse {
  if (isMissingBlobTokenError(error)) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  if (error instanceof InputError) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (error instanceof NotFoundError) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  if (error instanceof BlobPreconditionFailedError) {
    return NextResponse.json(
      { message: "剛剛有人更新了同一份資料，請再試一次。" },
      { status: 409 },
    );
  }

  console.error(error);

  return NextResponse.json(
    { message: "系統暫時忙碌，請稍後再試。" },
    { status: 500 },
  );
}
