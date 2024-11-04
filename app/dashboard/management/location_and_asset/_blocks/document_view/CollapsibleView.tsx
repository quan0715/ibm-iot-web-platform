"use client";
import { cn } from "@/lib/utils";

import React, {
  memo,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { DashboardCard } from "@/app/dashboard/_components/DashboardCard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { motion } from "framer-motion";
import { LuChevronRight } from "react-icons/lu";
import { Separator } from "@/components/ui/separator";
import { DocumentObject, Property } from "@/domain/entities/Document";
import { useDocumentTree } from "@/app/dashboard/management/location_and_asset/_hooks/useDocumentContext";
import { useDataQueryRoute } from "@/app/dashboard/management/location_and_asset/_hooks/useQueryRoute";
import {
  getDocumentChildrenTypeOptions,
  getDocumentTypeLayer,
  getGroupDefaultType,
} from "@/domain/entities/DocumentConfig";
import { getDocumentTypeColor } from "../../_utils/documentTypeUIConfig";
import {
  DocumentReferencePropertyView,
  DocumentTreeNode,
} from "../DocumentDataDisplayUI";
import { DocumentFormTableColumn } from "./TableView";
import { useDocumentTemplate } from "../../_hooks/useDocumentTemplate";
import {
  LoadingWidget,
  SuspenseWidget,
} from "@/components/blocks/LoadingWidget";
import { PropertyType } from "@/domain/entities/DocumentProperty";
import { CreateNewDataButton } from "../DataCRUDTrigger";
import { AnimationListContent } from "@/components/motion/AnimationListContent";
import { AnimationChevron } from "@/components/motion/AnimationChevron";
import { CollapsibleProps } from "@radix-ui/react-collapsible";
import { Skeleton } from "@nextui-org/react";
import {
  LayerContext,
  LevelCollapsibleWidget,
} from "@/components/blocks/CollapsibleWidget";

type CollapsibleDataTableTreeViewProps = {
  document: DocumentObject;
  expanded?: boolean;
  className?: string;
};

export function CollapsibleDataTableTreeEntryView({
  document,
  className,
  expanded,
}: CollapsibleDataTableTreeViewProps) {
  console.log("document", document.id, "reload");
  const [isOpen, setIsOpen] = useState(expanded);
  const documentTree = useDocumentTree();
  const documentGroupType = documentTree.type;
  const queryPathService = useDataQueryRoute();
  const children = documentTree.getChildrenData(
    document.ancestors ?? "",
    document.id ?? "",
  );

  const handleToggle = (open: boolean) => {
    setIsOpen(open);
  };

  const depth = useContext(LayerContext) ?? 0;
  const childrenTypeOptions = getDocumentChildrenTypeOptions(
    document.type,
    documentGroupType,
  );

  const getCollapseChildren = () => {
    const array = childrenTypeOptions.map((type, index) => {
      return [
        ...children
          .filter((document) => document.type == type)
          .map((doc) => {
            return (
              <CollapsibleDataTableTreeEntryView
                document={doc}
                expanded={isOpen}
                key={doc.id}
              />
            );
          }),
        <div
          key={type}
          className={cn(
            getDocumentTypeColor(type).hoveringColor,
            getDocumentTypeColor(type).textHoveringColor,
          )}
        >
          <div style={{ paddingLeft: `${depth + 1.5}rem` }}>
            <CreateNewDataButton
              className={cn("text-gray-500 hover:bg-transparent")}
              onClick={async () => {
                queryPathService.createNewAsset(
                  type,
                  document.ancestors.length > 0
                    ? document.ancestors + "," + document.id
                    : document.id ?? "",
                );
              }}
              label={`${getDocumentTypeLayer(type).name}`}
            />
          </div>
          <Separator className="w-full" />
        </div>,
      ];
    });
    return array.flat();
  };

  // useEffect(() => {
  //   let targetDocument = documentTree.getDocumentData(queryPathService.dataId);
  //   if (queryPathService.dataId !== "") {
  //     setIsOpen(queryPathService.dataId === document.id);
  //     // setIsOpen(targetDocument?.ancestors.includes(document.id ?? "") ?? false);
  //   }
  // }, [document.id, queryPathService.dataId]);

  function onDocumentSelect(docId: string) {
    queryPathService.setAssetId(docId);
    // setIsOpen(true);
  }
  return (
    <LevelCollapsibleWidget
      expanded={expanded}
      content={getCollapseChildren()}
      trigger={
        <DocumentReferencePropertyView
          data={document}
          onClick={() => {
            onDocumentSelect(document.id!);
          }}
          mode={"display"}
        />
      }
      className={cn(
        "rounded-md bg-background max-h-[500px] md:max-h-max",
        className,
      )}
    >
      <DocumentFormTableColumn data={document} />
    </LevelCollapsibleWidget>
  );
}
type TableConfig = {
  name: string;
  width: string;
};
export const TableContext = createContext<TableConfig[]>([]);

export function CollapsibleDataTableTreeView() {
  // make sure uit wrapped in document Tree Provider
  const documentTree = useDocumentTree();
  const root = documentTree.getPathData("");
  console.log("root", root);
  const defaultType = getGroupDefaultType(documentTree.type);

  const { group, isLoadingTemplate, template } = useDocumentTemplate(
    documentTree.type,
  );

  const properties = [
    {
      name: "敘述",
      value: "",
    } as Property,
    ...(template?.properties ?? ([] as Property[])),
  ];

  const tableColConfig = [
    {
      name: "主檔名稱",
      width: "300px",
    },
    ...properties.map((prop) => {
      if ((prop.type as PropertyType) === PropertyType.reference) {
        return {
          name: prop.name,
          width: "w-56",
        };
      }
      return {
        name: prop.name,
        width: "w-48",
      };
    }),
  ];

  return (
    <SuspenseWidget
      isSuspense={isLoadingTemplate || !template}
      fallback={
        <div className="w-screen h-svh flex flex-col justify-center items-center">
          <LoadingWidget />
        </div>
      }
    >
      <TableContext.Provider value={tableColConfig}>
        <div className="max-w-max p-2 bg-background">
          <div className="w-full bg-gray-50 ">
            <div className="w-full flex flex-row justify-start items-center p-2">
              <div
                style={{ width: tableColConfig[0].width }}
                className="text-sm font-semibold text-gray-500"
              >
                <p>主檔名稱</p>
              </div>
              {properties.map((prop) => {
                return (
                  <div
                    key={prop.name}
                    className={cn(
                      tableColConfig.find((config) => config.name === prop.name)
                        ?.width ?? "w-48",
                      "text-sm font-semibold text-gray-500",
                    )}
                  >
                    <div className="w-full flex flex-row">{prop.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
          {root.map((doc) => {
            return (
              <CollapsibleDataTableTreeEntryView
                document={doc}
                expanded={true}
                key={doc.id}
              />
            );
          })}
        </div>
      </TableContext.Provider>
    </SuspenseWidget>
  );
}
