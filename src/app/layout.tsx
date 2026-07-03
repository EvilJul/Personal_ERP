import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/mobile-nav";
import { seed } from "@/db/seed";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal ERP",
  description: "个人生活管理系统",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 应用启动时检查并写入种子数据（幂等，数据库非空时跳过）
  try {
    await seed()
  } catch {}

  return (
    <html lang="zh-CN" className={cn(GeistSans.variable, GeistMono.variable)}>
      <body className="font-sans antialiased">
        {children}
        <MobileNav />
      </body>
    </html>
  );
}
