"use client";
import { cn } from "@/lib/utils";

import React, { memo, useEffect, useState } from "react";
import { DashboardCard } from "@/app/dashboard/_components/DashboardCard";

import { getDocumentTypeColor } from "../_utils/documentTypeUIConfig";

import { Separator } from "@/components/ui/separator";
import { LuPlus, LuMinus, LuArrowRight, LuChevronRight } from "react-icons/lu";

import Link from "next/link";
import { useDataQueryRoute } from "../_hooks/useQueryRoute";
import { CreateNewDataButton } from "./DataCRUDTrigger";
import { DashboardLabelChip } from "./DocumentLabelChip";
import { DocumentObject, DocumentObjectType } from "@/domain/entities/Document";
import { Button } from "@/components/ui/button";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  getDocumentChildrenTypeOptions,
  getDocumentTypeLayer,
} from "@/domain/entities/DocumentConfig";
import { useDocumentTree } from "../_hooks/useDocumentContext";
import { motion } from "framer-motion";
import { date } from "zod";
import { PropertyValueField } from "./DocuemntFormPropertyField";
import { DocumentFormTableColumn } from "./document_view/TableView";

export const DocumentDataTreeEntryView = memo(function DashboardColumnMin({
  data,
  onClick,
  className,
  depth = 0,
  onClose,
}: {
  onClick?: () => void;
  onClose?: () => void;
  className?: string;
  data: DocumentObject;
  depth?: number;
}) {
  const type = data.type;
  const documentTree = useDocumentTree();
  const docType = documentTree.type;
  const queryPathService = useDataQueryRoute();
  const children = documentTree.getChildrenData(
    data.ancestors ?? "",
    data.id ?? ""
  );
  const childrenTypeOptions = getDocumentChildrenTypeOptions(type, docType);
  const haveChildren = childrenTypeOptions.length;
  const targetDocument = documentTree.getDocumentData(queryPathService.dataId);
  const routePath = useDataQueryRoute();
  const isSelected = queryPathService.dataId === data.id;
  const [isOpen, setIsOpen] = useState(false);

  const uiConfig = {
    ...getDocumentTypeLayer(type),
    color: getDocumentTypeColor(type),
  };

  useEffect(() => {
    setIsOpen(targetDocument?.ancestors.includes(data.id ?? "") ?? false);
  }, [data.id, targetDocument]);

  const paddingStyle = { paddingLeft: `${depth * 1}rem` };
  const headerWidth = {
    width: `${60 - depth * 1}rem)`,
  };

  const getCollapseChildren = () => {
    return [
      ...children.map((child, index) => (
        <DocumentDataTreeEntryView
          data={child}
          onClick={() => {
            routePath.setAssetId(child.id!);
            onClose?.();
          }}
          onClose={onClose}
          key={child.id}
          depth={depth + 1}
        />
      )),
      ...childrenTypeOptions.map((type, index) => (
        <div
          key={type}
          className={cn(
            getDocumentTypeColor(type).hoveringColor,
            getDocumentTypeColor(type).textHoveringColor
          )}
        >
          <div style={{ paddingLeft: `${depth + 2.5}rem` }}>
            <CreateNewDataButton
              className={cn("text-gray-500 hover:bg-transparent")}
              onClick={async () => {
                queryPathService.createNewAsset(
                  type,
                  data.ancestors.length > 0
                    ? data.ancestors + "," + data.id
                    : data.id ?? ""
                );
                onClose?.();
              }}
              label={`${getDocumentTypeLayer(type).name}`}
            />
          </div>
        </div>
      )),
    ];
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "w-full rounded-md bg-background max-h-[500px] md:max-h-max overflow-y-scroll md:overflow-auto",
        className
      )}
    >
      <div
        style={paddingStyle}
        className={cn(uiConfig.color.hoveringColor, "h-fit")}
      >
        <DashboardCard className="h-fit bg-transparent w-full flex flex-row items-center py-1 px-1 group">
          <CollapsibleTrigger className="bg-transparent" asChild>
            <div
              className={cn(
                haveChildren ? "visible" : "invisible",
                "p-2 rounded-md opacity-0 bg-transparent",
                isOpen ? "opacity-100" : "opacity-100 md:opacity-0",
                "group-hover:cursor-pointer group-hover:opacity-100"
              )}
            >
              <motion.div
                initial={false}
                animate={{ rotate: isOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <LuChevronRight />
              </motion.div>
              {/* {isOpen ? <LuChevronDown /> : <LuChevronRight />} */}
            </div>
          </CollapsibleTrigger>
          <DocumentTreeNode
            data={data}
            isSelected={isSelected}
            onClick={() => {
              routePath.setAssetId(data.id!);
              setIsOpen(!isOpen);
              onClose?.();
            }}
            style={headerWidth}
          />
          {/* <DocumentFormTableView data={data} /> */}
        </DashboardCard>
      </div>
      <Separator className="w-full" />
      <CollapsibleContent className="w-full">
        {getCollapseChildren().map((child, index) => (
          <motion.div
            key={child.key}
            initial="initial"
            animate="animate"
            exit="exit"
            custom={index}
            variants={{
              initial: { opacity: 0, y: -20 },
              animate: (index) => ({
                opacity: 1,
                y: 0,
                transition: { duration: 0.3, delay: index * 0.03 },
              }),
              exit: { opacity: 0, y: 20 },
            }}
          >
            {child}
          </motion.div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
});

export const DocumentReferencePropertyView = memo(function DashboardColumnMin({
  data,
  onClick,
  mode = "display",
}: {
  onClick?: () => void;
  data: DocumentObject;
  mode: "selected" | "candidate" | "display";
}) {
  const type = data.type;
  const chipRef = React.useRef<HTMLDivElement>(null);

  const typeUIConfig = {
    ...getDocumentTypeLayer(type),
    color: getDocumentTypeColor(type),
  };
  const tailwindColorClass = getDocumentTypeColor(type);

  function getModeIcon() {
    switch (mode) {
      case "selected":
        return <LuMinus className={tailwindColorClass.textColor} />;
      case "candidate":
        return <LuPlus className={tailwindColorClass.textColor} />;
      case "display":
        return <LuArrowRight className={tailwindColorClass.textColor} />;
    }
  }
  return (
    <div
      ref={chipRef}
      className={cn(
        "w-full group flex-1 flex flex-row justify-start items-center",
        "hover:cursor-pointer"
      )}
      onClick={mode === "display" ? onClick : undefined}
    >
      <DashboardCard
        className={cn(
          "w-full rounded-md px-1 py-0.5",
          "flex flex-row items-center justify-start space-x-6",
          "group-hover:cursor-pointer group-hover:bg-secondary"
        )}
      >
        <div className="w-full flex flex-1 flex-row justify-start items-center space-x-2 h-9 relative">
          <DashboardLabelChip type={data.type} />
          <h1
            className={cn(
              "font-semibold text-sm",
              tailwindColorClass.textColor
            )}
          >
            {data.title}
          </h1>
          <Button
            type="button"
            className={cn(
              "absolute",
              "right-1 rounded-md p-1 h-9 w-9",
              "invisible group-hover:visible",
              "hover:bg-background hover:cursor-pointer"
            )}
            onClick={onClick}
            size={"icon"}
            variant={"outline"}
          >
            {getModeIcon()}
          </Button>
        </div>
      </DashboardCard>
    </div>
  );
});

export const DocumentTreeNode = memo(function DocumentTreeNode({
  data,
  isSelected,
  onClick,
  style,
}: {
  isSelected: boolean;
  onClick: () => void;
  data: DocumentObject;
  style?: React.CSSProperties;
}) {
  const color = getDocumentTypeColor(data.type);
  const chipRef = React.useRef<HTMLDivElement>(null);
  const typeUIConfig = {
    ...getDocumentTypeLayer(data.type),
    color: getDocumentTypeColor(data.type),
  };

  return (
    <div
      onClick={onClick}
      ref={chipRef}
      className={cn(
        "flex-1 flex flex-row justify-start items-center",
        "hover:cursor-pointer"
      )}
      style={style}
    >
      <div className="w-full flex flex-row justify-start items-center relative">
        <DashboardLabelChip type={data.type} />
        <h1
          className={cn(
            "pl-2 font-semibold text-sm",
            isSelected ? color.textColor : ""
          )}
        >
          {data.title}
        </h1>
        <Button
          type="button"
          className={cn(
            "absolute",
            "right-1 w-9 h-9 rounded-md",
            "invisible group-hover:visible",
            "hover:bg-background hover:cursor-pointer"
          )}
          onClick={onClick}
          size={"icon"}
          variant={"outline"}
        >
          <LuArrowRight className={color.textColor} />
        </Button>
      </div>
    </div>
  );
});
