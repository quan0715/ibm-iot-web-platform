"use client";
import { getDocumentObjectTypeFromString } from "@/domain/entities/Document";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
interface QueryParams {
  selected?: string;
  mode?: string;
  page?: string;
}
export function useDataQueryRoute() {
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = searchParams.get("mode") || "display";
  const dataId = searchParams.get("data") || "";
  const page = searchParams.get("page") || "";
  const ancestors = searchParams.get("ancestors") ?? "";
  const dataType = getDocumentObjectTypeFromString(
    searchParams.get("type") ?? ""
  );

  function createQueryString({ selected, mode, page }: QueryParams): string {
    const params = new URLSearchParams();
    if (selected) {
      params.set("data", selected);
    }
    if (mode) {
      params.set("mode", mode);
    }
    if (page) {
      params.set("page", page);
    }
    return params.toString();
  }

  function getPath(queryPath: string) {
    return pathName + "?" + queryPath;
  }

  function refresh(): void {
    router.refresh();
  }
  function moveBack(): void {
    console.log("moveBack");
    router.back();
    router.refresh();
  }

  const createURL = getPath(
    createQueryString({
      selected: dataId,
      mode: "create",
      page: searchParams.get("page") || "Location",
    })
  );

  function createNewData(type: string, ancestors: string) {
    const params = new URLSearchParams();
    params.set("mode", "create");
    params.set("data", dataId);
    params.set("ancestors", ancestors);
    params.set("type", type);
    if (searchParams.get("page")) {
      params.set("page", searchParams.get("page") || "");
    }
    router.push(getPath(params.toString()));
  }

  function setPage(page: string) {
    const newRoute = createQueryString({
      selected: dataId,
      mode: "display",
      page: page,
    });
    router.push(getPath(newRoute));
  }

  function setDataId(selected: string, page?: string) {
    const newRoute = createQueryString({
      selected: selected,
      mode: "display",
      page: page ?? (searchParams.get("page") || "Location"),
    });
    router.push(getPath(newRoute));
    router.refresh();
  }

  return {
    pathName,
    searchParams,
    router,
    mode,
    page,
    dataId,
    ancestors,
    dataType,
    setPage,
    setAssetId: setDataId,
    createURL,
    createNewAsset: createNewData,
    moveBack,
    refresh,
  };
}
