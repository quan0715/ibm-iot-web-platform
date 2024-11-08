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
import {
  TableCell,
  TableRow,
} from "@/app/dashboard/management/location_and_asset/_blocks/document_view/TableView";

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

  // const tabWidth = "300px";
  const depth = useContext(LayerContext) ?? 0;
  const paddingStyle = {
    paddingLeft: `${depth}rem`,
    // width: tabWidth,
  };
  const uuid = Math.random().toString(36).substring(7);
  const cssGroup = `document-${uuid}`;
  const groupHover = `group-[.${cssGroup}]-hover:block`;
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleToggle}
      className={cn("w-full bg-transparent", className)}
    >
      <TableRow className={cn("relative group")}>
        <div
          className={cn(
            "w-5 h-5 bg-white rounded-sm border-2 absolute -left-6 hidden",
            "group-hover:block",
          )}
        ></div>
        <TableCell className={"w-64"}>
          <CollapsibleTrigger
            style={paddingStyle}
            className={cn("w-full h-fit flex flex-row items-center py-1 group")}
          >
            <AnimationChevron
              className={cn(
                "p-2 rounded-md opacity-0 bg-transparent",
                isOpen ? "opacity-100" : "opacity-100 md:opacity-0",
                "group-hover:cursor-pointer group-hover:opacity-100",
              )}
              isExpanded={isOpen ?? false}
            />
            {trigger}
          </CollapsibleTrigger>
        </TableCell>
        {children}
      </TableRow>
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
