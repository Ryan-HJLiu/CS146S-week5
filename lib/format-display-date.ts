const sevenDaysInMilliseconds = 7 * 24 * 60 * 60 * 1000;

const absoluteDateFormatter = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

const relativeDateFormatter = new Intl.RelativeTimeFormat("zh-TW", {
  numeric: "auto",
});

const relativeUnits = [
  { unit: "day", milliseconds: 24 * 60 * 60 * 1000 },
  { unit: "hour", milliseconds: 60 * 60 * 1000 },
  { unit: "minute", milliseconds: 60 * 1000 },
  { unit: "second", milliseconds: 1000 },
] as const;

export function formatDisplayDate(
  value: string | Date,
  now = new Date(),
): string {
  const date = typeof value === "string" ? new Date(value) : value;
  const difference = date.getTime() - now.getTime();

  if (!Number.isFinite(difference)) {
    return "日期無效";
  }

  if (Math.abs(difference) > sevenDaysInMilliseconds) {
    return absoluteDateFormatter.format(date);
  }

  const selectedUnit =
    relativeUnits.find(({ milliseconds }) => Math.abs(difference) >= milliseconds) ??
    relativeUnits.at(-1)!;
  const amount = Math.round(difference / selectedUnit.milliseconds);

  return relativeDateFormatter.format(amount, selectedUnit.unit);
}

export function formatAbsoluteDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;

  return Number.isFinite(date.getTime())
    ? absoluteDateFormatter.format(date)
    : "日期無效";
}
