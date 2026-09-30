import dotenv from "dotenv";

import { resetAppState } from "@/lib/blob-store";

dotenv.config({ path: ".env.local" });
dotenv.config();

async function main() {
  const nextState = await resetAppState();

  console.log("已重設 Blob store 內的示範資料。");
  console.log(`notes: ${nextState.notes.length}`);
  console.log(`actionItems: ${nextState.actionItems.length}`);
  console.log("提醒：本機與部署共用同一份資料，遠端頁面也會看到這次重設。");
}

main().catch((error) => {
  console.error("重設失敗。");

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});
