"use client";
import { Separator } from "@/components/ui/separator";
import React, { ReactNode, Suspense, use, useEffect } from "react";
import { DashboardPageHeader } from "@/app/dashboard/_components/DashboardPageHeader";
import { useDataQueryRoute } from "./_hooks/useQueryRoute";
import {
  documentConfig,
  getDocumentTypeLayer,
} from "@/domain/entities/DocumentConfig";
import { getDocumentGroupTypeFromString } from "@/domain/entities/Document";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <HeaderField>{children}</HeaderField>
    </Suspense>
  );
}

function HeaderField({ children }: { children: ReactNode }) {
  const defaultViews = documentConfig[0].views[0].group;
  const queryPath = useDataQueryRoute();
  const subPage = queryPath.page || defaultViews;
  const dbType = getDocumentGroupTypeFromString(subPage);
  const views = documentConfig
    .map((config) => config.views)
    .flat()
    .find((view) => view.group === subPage);
  return (
    // <Suspense>
    // max-h-fit
    <div className="w-svw min-h-[100%] flex flex-col justify-start items-start ">
      <DashboardPageHeader
        title={"基本資料"}
        subTitle={views?.viewName ?? ""}
      />
      <Separator />
      <div className="w-full flex-1 flex flex-col bg-secondary">{children}</div>
    </div>
    // </Suspense>
  );
}
