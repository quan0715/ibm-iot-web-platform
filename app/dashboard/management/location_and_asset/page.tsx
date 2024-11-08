"use client";

import { Suspense, use, useEffect } from "react";
import {
  DocumentGroupType,
  getDocumentGroupTypeFromString,
} from "@/domain/entities/Document";
import { DatabasePage } from "./_blocks/DocumentPage";
import { useDataQueryRoute } from "./_hooks/useQueryRoute";
import { getAssetSibling } from "./_actions/DocumentAction";
import {
  DocumentLayer,
  getGroupDefaultType,
} from "@/domain/entities/DocumentConfig";
import {
  DocumentMenuListMobile,
  DocumentTreeMenu,
} from "./_blocks/DocumentNavigationMenu";
import { DocumentSearchTreeProvider } from "./_providers/DocumentSearchTreeProvider";
import { DesktopOnly, MobileOnly } from "@/components/layouts/layoutWidget";
import { Separator } from "@/components/ui/separator";
import { documentConfig } from "@/domain/entities/DocumentConfig";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { CollapsibleDataTableTreeView } from "./_blocks/document_view/CollapsibleView";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { TableToolBar } from "./_blocks/TableToolBar";

function TabListWidget() {
  const defaultViews = documentConfig[0].views[0].group;
  const queryPath = useDataQueryRoute();
  const subPage = queryPath.page || defaultViews;
  const handleTabChange = (value: string) => {
    if (value === subPage) return;
    console.log("change page", value);
    queryPath.setAssetId("", value);
  };

  function isSelectedDirectory(config: DocumentLayer) {
    return config.views.some((view) => view.group === subPage);
  }
  function getTriggerLabel(config: DocumentLayer) {
    let isSelectedDir = config.views.some((view) => view.group === subPage);
    if (!isSelectedDir) {
      return config.dirName;
    }
    return config.views.find((view) => view.group === subPage)?.viewName;
  }

  return (
    <div className="w-screen bg-background h-fit px-4">
      <div className="w-full flex flex-row justify-start items-center">
        {documentConfig.map((config) => {
          return (
            <DropdownMenu key={config.dirName}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={"ghost"}
                  className={cn(
                    !isSelectedDirectory(config) ? "text-gray-500" : "",
                    "flex flex-row justify-center items-center space-x-1",
                  )}
                >
                  {getTriggerLabel(config)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>{config.dirName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={subPage}
                  onValueChange={handleTabChange}
                >
                  {config.views.map((view) => {
                    return (
                      <DropdownMenuRadioItem
                        value={view.group}
                        key={view.group}
                      >
                        {view.viewName}
                      </DropdownMenuRadioItem>
                    );
                  })}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() {
  const queryRoute = useDataQueryRoute();
  const dbType = getDocumentGroupTypeFromString(queryRoute.page);

  useEffect(() => {
    if (queryRoute.page.length === 0) {
      queryRoute.setAssetId("", "Location");
      return;
    }
  }, [queryRoute]);

  return (
    <div>
      <TabListWidget />
      <Separator />
      <DocumentTreePage />
    </div>
  );
}

function DocumentTreePage() {
  const queryRoute = useDataQueryRoute();
  const dbType = getDocumentGroupTypeFromString(queryRoute.page);
  const isBlocking = queryRoute.mode === "display" && queryRoute.dataId === "";

  return (
    <DocumentSearchTreeProvider type={dbType}>
      <DesktopOnly className={"p-4 flex-1 flex flex-col "}>
        <TableToolBar />
        <ScrollArea className="w-full h-fit">
          {/*<div className={"h-[500px] w-[2000px] bg-red-100 "}>test</div>*/}
          <CollapsibleDataTableTreeView />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <Sheet
          open={queryRoute.dataId !== "" || queryRoute.mode === "create"}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              queryRoute.setAssetId("", queryRoute.page);
            }
          }}
        >
          <SheetContent side={"right"} className="w-full md:w-1/2">
            <DatabasePage
              key={dbType + queryRoute.dataId}
              selectedDocumentId={queryRoute.dataId}
            />
          </SheetContent>
        </Sheet>
      </DesktopOnly>
      <MobileOnly>
        <div className="w-full flex flex-col">
          <DocumentMenuListMobile />
          <Separator />
          <div className="col-span-9">
            <DatabasePage
              key={dbType + queryRoute.dataId}
              selectedDocumentId={queryRoute.dataId}
            />
          </div>
        </div>
      </MobileOnly>
    </DocumentSearchTreeProvider>
  );
}
