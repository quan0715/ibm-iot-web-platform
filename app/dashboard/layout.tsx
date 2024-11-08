import React from "react";
import { AppNavBar } from "@/app/dashboard/_components/AppNavBar";
import { Separator } from "@/components/ui/separator";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        "w-screen flex h-svh flex-col flex-grow items-start justify-start self-stretch"
      }
    >
      <AppNavBar />
      <Separator />
      {children}
    </div>
  );
}
