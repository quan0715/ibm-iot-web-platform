"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";

import { Separator } from "@/components/ui/separator";
import {
  DocumentGroupType,
  DocumentObject,
  Property,
} from "@/domain/entities/Document";
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

import { useDocumentTemplate } from "../../_hooks/useDocumentTemplate";
import {
  LoadingWidget,
  SuspenseWidget,
} from "@/components/blocks/LoadingWidget";
import {
  DocumentReferenceProperty,
  PropertyType,
  TextProperty,
} from "@/domain/entities/DocumentProperty";
import { CreateNewDataButton } from "../DataCRUDTrigger";
import {
  LayerContext,
  LevelCollapsibleWidget,
} from "@/components/blocks/CollapsibleWidget";
import { ReferenceGroupProvider } from "../../_providers/GroupReferencesListProvider";
import {
  DocumentObjectTableRow,
  Table,
  TableRow,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableCell,
} from "./TableView";
type CollapsibleDataTableTreeViewProps = {
  document: DocumentObject;
  expanded?: boolean;
  className?: string;
};

function FullPageSuspense() {
  return (
    <div className="h-svh flex flex-col justify-center items-center bg-background">
      <LoadingWidget />
    </div>
  );
}

export function CollapsibleDataTableTreeEntryView({
  document,
  className,
  expanded,
}: CollapsibleDataTableTreeViewProps) {
  const [isOpen, setIsOpen] = useState(expanded);
  const documentTree = useDocumentTree();
  const documentGroupType = documentTree.type;
  const queryPathService = useDataQueryRoute();
  const children = documentTree.getChildrenData(
    document.ancestors ?? "",
    document.id ?? "",
  );
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
        <TableRow
          key={type}
          className={cn(
            getDocumentTypeColor(type).hoveringColor,
            getDocumentTypeColor(type).textHoveringColor,
          )}
        >
          <TableCell className={"w-full justify-start h-10"}>
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
          </TableCell>
        </TableRow>,
      ];
    });
    return array.flat();
  };

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
      className={cn("w-full md:max-h-max", className)}
    >
      <DocumentObjectTableRow data={document} />
    </LevelCollapsibleWidget>
  );
}

export function CollapsibleDataTableTreeView() {
  // make sure uit wrapped in document Tree Provider
  const documentTree = useDocumentTree();
  const root = documentTree.getPathData("");
  const defaultType = getGroupDefaultType(documentTree.type);

  const { group, isLoadingTemplate, template } = useDocumentTemplate(
    documentTree.type,
  );

  const properties = [
    {
      type: PropertyType.text,
      name: "主檔名稱",
    } as Property,
    {
      type: PropertyType.text,
      name: "敘述",
    } as Property,
    ...(template?.properties ?? ([] as Property[])),
  ];

  // 預先取得 reference 的 數值，避免重複計算
  const references =
    template?.properties?.filter(
      (prop) => prop.type === PropertyType.reference,
    ) ?? [];

  return (
    <SuspenseWidget
      isSuspense={isLoadingTemplate || !template}
      fallback={<FullPageSuspense />}
    >
      <Table properties={properties} className={"w-full bg-background pl-8"}>
        <TableHeader>
          <TableRow>
            {properties.map((prop, index) => {
              return (
                <TableHeaderCell
                  key={prop.name}
                  className={index == 0 ? "w-64" : ""}
                  column={{
                    columnName: prop.name,
                    property: prop as Property,
                    width: 100,
                  }}
                />
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          <ReferenceGroupProvider references={references}>
            {root.map((doc) => {
              return (
                <CollapsibleDataTableTreeEntryView
                  key={doc.id}
                  document={doc}
                  expanded={true}
                />
              );
            })}
          </ReferenceGroupProvider>
        </TableBody>
      </Table>
    </SuspenseWidget>
  );
}
