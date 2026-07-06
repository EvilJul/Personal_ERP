import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { cn } from "@/lib/utils";
import { MobileNav } from "@/components/mobile-nav";
import { DbProvider } from "@/components/db-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal ERP",
  description: "个人生活管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={cn(GeistSans.variable, GeistMono.variable)}>
      <body className="font-sans antialiased">
        <DbProvider>
          {children}
          <MobileNav />
        </DbProvider>
      </body>
    </html>
  );
}
