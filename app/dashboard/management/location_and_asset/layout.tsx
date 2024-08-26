"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import React, { ReactNode, Suspense, use, useEffect } from "react";
import { DashboardPageHeader } from "@/app/dashboard/_components/DashboardPageHeader";
import { useSearchParams, useRouter } from "next/navigation";
import { useDataQueryRoute } from "./_hooks/useQueryRoute";
import { useRootData } from "./_hooks/useDocument";
import { getDocumentGroupTypeFromString } from "@/domain/entities/Document";
import { getAssetSibling } from "./_actions/DocumentAction";
// import {
//   Menubar,
//   MenubarContent,
//   MenubarItem,
//   MenubarMenu,
//   MenubarSeparator,
//   MenubarShortcut,
//   MenubarTrigger,
// } from "@/components/ui/menubar"

type TabsString = "Location" | "Asset" | "Meter" | "GHG" | "MeterReading";

interface TabConfig {
  index: string;
  title: string;
  // content: ReactNode;
}

export default function Layout({
  children,
  // asset,
  // location,
}: {
  children: React.ReactNode;
  // asset: React.ReactNode;
  // location: React.ReactNode;
}) {
  const tabConfig: Record<TabsString, TabConfig> = {
    Location: {
      index: "Location",
      title: "位置主檔",
      // content: location,
    },
    Asset: {
      index: "Asset",
      title: "資產主檔",
      // content: asset,
    },
    Meter: {
      index: "Meter",
      title: "Meter 主檔",
    },
    GHG: {
      index: "GHG",
      title: "GHG 主檔",
    },
    MeterReading: {
      index: "MeterReading",
      title: "Meter Reading 主檔",
    },
  };

  return (
    <Suspense>
      <TabListWidget tabConfig={tabConfig}>{children}</TabListWidget>
    </Suspense>
  );
}

function TabListWidget({
  tabConfig,
  children,
}: {
  children?: React.ReactNode;
  tabConfig: Record<TabsString, TabConfig>;
}) {
  const defaultPage = tabConfig["Location"];
  const searchParams = useSearchParams();
  const queryPath = useDataQueryRoute();
  const subPage = searchParams.get("page") || defaultPage.index;
  const router = useRouter();

  const rootData = useRootData(getDocumentGroupTypeFromString(queryPath.page));

  useEffect(() => {
    console.log("TabListWidget useEffect", searchParams.get("page"));
    if (!searchParams.get("page")) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set("page", defaultPage.index);
      newSearchParams.set("data", "");
      newSearchParams.set("mode", "display");
      router.push("?" + newSearchParams.toString());
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    if (value === subPage) return;
    const newSearchParams = new URLSearchParams();
    newSearchParams.set("page", value);
    newSearchParams.set("data", "");
    newSearchParams.set("mode", "display");
    console.log("change page", value);
    router.prefetch("?" + newSearchParams.toString());
    router.push("?" + newSearchParams.toString());
  };

  return (
    <div className="w-full h-fit flex flex-col flex-grow justify-start items-center ">
      <DashboardPageHeader
        title={"基本資料"}
        subTitle={tabConfig[subPage as TabsString].title}
      />
      <Separator />
      <Tabs
        value={subPage}
        defaultValue={subPage}
        className="w-full h-full"
        onValueChange={handleTabChange}
      >
        <TabsList className="flex w-full p-2 justify-start items-center bg-background h-fit overflow-x-auto">
          {Object.keys(tabConfig).map((key) => {
            const tab = tabConfig[key as TabsString];
            return (
              <TabsTrigger key={tab.index + "trigger"} value={tab.index}>
                {tab.title}
              </TabsTrigger>
            );
          })}
        </TabsList>
        <Separator />
        <div className="w-full h-full bg-secondary">{children}</div>
      </Tabs>
    </div>
  );
}
