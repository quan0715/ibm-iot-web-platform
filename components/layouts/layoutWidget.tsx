import React from "react";
import { cn } from "@/lib/utils";

type LayoutWidgetProps = {
  className?: string;
  children: React.ReactNode;
};
function MobileOnly({ className, children }: LayoutWidgetProps) {
  return (
    <div className={cn("flex md:hidden", className ?? "")}>
      {children ?? "mobile only block"}
    </div>
  );
}

function DesktopOnly({ className, children }: LayoutWidgetProps) {
  return (
    <div className={cn("hidden md:flex", className ?? "")}>
      {children ?? "desktop only block"}
    </div>
  );
}

export { MobileOnly, DesktopOnly };
