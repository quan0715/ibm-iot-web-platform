import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "@/app/globals.css";
import React from "react";
import { Providers } from "@/app/provider";
import { cn } from "@/lib/utils";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "IBM ESG PLATFORM",
  description: "The Next gen IOT Dashboard power by IBM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen h-screen overflow-x-hidden bg-background font-sans antialiased",
          notoSansTC.variable,
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
