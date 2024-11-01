import { createContext, useContext, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import React from "react";
import { cn } from "@/lib/utils";
import { DashboardCard } from "@/app/dashboard/_components/DashboardCard";
import { AnimationChevron } from "../motion/AnimationChevron";
import { AnimationListContent } from "../motion/AnimationListContent";
import { Separator } from "../ui/separator";

export const LayerContext = createContext<number>(0);

export function LevelCollapsibleWidget({
  className,
  expanded,
  trigger,
  children,
  content = [],
}: {
  className?: string;
  expanded?: boolean;
  trigger?: React.ReactNode;
  content?: React.ReactNode[];
  children?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(expanded);

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
  };

  const tabWidth = "300px";
  const depth = useContext(LayerContext) ?? 0;
  const paddingStyle = {
    paddingLeft: `${depth * 1}rem`,
    // width: tabWidth,
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleToggle}
      className={cn(
        "w-full rounded-md bg-background max-h-[500px] md:max-h-max",
        className
      )}
    >
      <div className="w-full flex flex-row">
        <DashboardCard
          style={{ width: tabWidth }}
          className="h-fit bg-transparent flex flex-row items-center group shadow-none"
        >
          <CollapsibleTrigger
            style={paddingStyle}
            className={cn("w-full h-fit flex flex-row items-center py-1 group")}
          >
            <AnimationChevron
              className={cn(
                "p-2 rounded-md opacity-0 bg-transparent",
                isOpen ? "opacity-100" : "opacity-100 md:opacity-0",
                "group-hover:cursor-pointer group-hover:opacity-100"
              )}
              isExpanded={isOpen ? true : false}
            />
            {trigger}
          </CollapsibleTrigger>
        </DashboardCard>
        {children}
      </div>
      <Separator className="w-full" />
      <CollapsibleContent className="w-full">
        {content.map((child, index) => (
          <AnimationListContent key={index} index={index}>
            <LayerContext.Provider value={depth + 1}>
              {child}
            </LayerContext.Provider>
          </AnimationListContent>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
