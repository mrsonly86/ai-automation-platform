import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Automation Platform",
  description: "Hệ thống AI Automation Platform - Nền tảng tự động hóa với 8 AI agents chuyên biệt",
  keywords: ["AI", "automation", "platform", "artificial intelligence", "development"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
