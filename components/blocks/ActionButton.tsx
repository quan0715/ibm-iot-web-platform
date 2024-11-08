import React from "react";
import { Button } from "@/components/ui/button";

type ActionButton = {
  label: string;
  tooltip?: string;
  icon?: React.ReactNode;
} & React.HTMLAttributes<HTMLButtonElement>;

export function ActionButton({ label, tooltip, icon, ...props }: ActionButton) {
  return (
    <Button
      variant={"ghost"}
      className="group flex flex-row items-center justify-center hover:space-x-2"
      title={tooltip || label}
      {...props}
    >
      {icon}
      <span
        className={
          "whitespace-nowrap overflow-hidden max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-300 ease-in-out"
        }
      >
        {label}
      </span>
    </Button>
  );
}
