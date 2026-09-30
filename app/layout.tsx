import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CS146S Week5 作業",
  description: "筆記與 todos。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant-TW">
      <body>{children}</body>
    </html>
  );
}
