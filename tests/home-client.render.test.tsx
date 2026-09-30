import { render, screen } from "@testing-library/react";

import { HomeClient } from "@/components/home-client";

describe("HomeClient", () => {
  it("renders starter data when initial data is provided", () => {
    render(
      <HomeClient
        initialData={{
          notes: [
            {
              id: "note-1",
              title: "整理 Part 1",
              content: "先從共用回應格式開始。",
              createdAt: "2026-03-30T08:00:00.000Z",
            },
          ],
          actionItems: [
            {
              id: "action-1",
              description: "補上首頁 loading 提示",
              completed: false,
              createdAt: "2026-03-30T09:00:00.000Z",
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole("heading", {
        name: "CS146S Week5 作業",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("整理 Part 1")).toBeInTheDocument();
    expect(screen.getByText("補上首頁 loading 提示")).toBeInTheDocument();
  });

  it("does not render created time for action items", () => {
    const actionItemCreatedTime = new Intl.DateTimeFormat("zh-TW", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date("2026-03-30T09:00:00.000Z"));

    render(
      <HomeClient
        initialData={{
          notes: [],
          actionItems: [
            {
              id: "action-1",
              description: "補上首頁 loading 提示",
              completed: false,
              createdAt: "2026-03-30T09:00:00.000Z",
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("補上首頁 loading 提示")).toBeInTheDocument();
    expect(screen.queryByText(actionItemCreatedTime)).not.toBeInTheDocument();
  });
});
