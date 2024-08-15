"use client";
import { cn } from "@/lib/utils";
import React from "react";

import {
  colorVariants,
  DocumentTypeColor,
} from "../_utils/locationTypeUIConfig";

export function DashboardLabelChip({
  title,
  color,
  length = undefined,
}: {
  title: string;
  color: DocumentTypeColor;
  length?: number;
}) {
  return (
    <>
      <div
        className={cn(
          "w-fit flex flex-rol justify-center items-center space-x-2 px-2 py-0.5 rounded-lg",
          colorVariants[color].bgColor
        )}
      >
        <div
          className={cn(
            "w-[8px] h-[8px] rounded-full",
            colorVariants[color].leadingColor
          )}
        ></div>
        <p className={"text-sm font-semibold"}>{title}</p>
      </div>
      {length != undefined ? (
        <p className={cn("pl-4 text-md", colorVariants[color].textColor)}>
          {length}
        </p>
      ) : null}
    </>
  );
}

// export function AssetDataList({
//   className,
//   assetType,
//   assetSearchPath,
//   assetDataList,
// }: {
//   className?: string;
//   assetType: LocationType;
//   assetSearchPath: string[];
//   assetDataList: AssetLocationEntity[];
// }) {
//   const assetInfo = getLocationEntityUIConfig(assetType);
//   const tailwindColorClass = assetInfo.color;

//   const colorVariant = getLocationColor(assetType);
//   const queryPathService = useDataQueryRoute();
//   const assetId = queryPathService.dataId;

//   return (
//     <DashboardCard className={cn(className)}>
//       <DashboardCardHeaderTest
//         title={assetInfo.label}
//         titleComponent={(title: string) => (
//           <DashboardLabelChip
//             title={title}
//             color={tailwindColorClass}
//             length={assetDataList.length}
//           />
//         )}
//       ></DashboardCardHeaderTest>
//       <DashboardCardContent>
//         <div className={"w-full h-fit grid grid-cols-1 gap-4"}>
//           {assetDataList.map((data, index) => {
//             return (
//               <Link
//                 href={queryPathService.getNewDisplayURL(data.id ?? "")}
//                 key={data.id}
//               >
//                 <LocationDataCardView
//                   data={data}
//                   selected={data.id === assetId}
//                   key={data.name}
//                 />
//                 {index < assetDataList.length - 1 ? <Separator /> : null}
//               </Link>
//             );
//           })}
//         </div>
//         <CreateNewDataButton
//           className={cn(colorVariant.textColor)}
//           onClick={async () => {
//             queryPathService.createNewAsset(assetType, assetSearchPath);
//           }}
//           label={`${assetInfo.label}`}
//         />
//       </DashboardCardContent>
//     </DashboardCard>
//   );
// }

// export const LocationDataCardView = memo(function AssetLocDataListView({
//   data,
//   selected = false,
// }: {
//   data: AssetLocationEntity;
//   selected?: boolean;
// }) {
//   const colorVariant = getLocationColor(data.type);
//   return (
//     <div
//       className={cn(
//         "w-full flex flex-row justify-between items-center p-2 rounded-md",
//         "hover:cursor-pointer hover:bg-secondary"
//       )}
//     >
//       <div
//         className={cn(
//           "flex-grow w-full h-fit grid grid-cols-1 gap-2 py-2 rounded-md"
//         )}
//       >
//         <h1 className={cn("font-semibold text-md", colorVariant.textColor)}>
//           {data.name}
//         </h1>
//         <p className={cn("text-sm")}>{data.description}</p>
//       </div>
//       {selected ? (
//         <div
//           className={cn(
//             "flex flex-col justify-center items-center",
//             "rounded-full p-0.5",
//             colorVariant.leadingColor
//           )}
//         >
//           <LuCheck size={16} className={"text-white"} />
//         </div>
//       ) : null}
//     </div>
//   );
// });

// export const LocationDataAncestorView = memo(function DashboardColumnMin({
//   assetType,
//   assetData,
//   onClick,
// }: {
//   onClick?: () => void;
//   assetType: LocationType;
//   assetData: AssetLocationEntity;
// }) {
//   const tailwindColorClass = getLocationColor(assetType);
//   return (
//     <div onClick={onClick} className="w-full">
//       <DashboardCard
//         className={cn(
//           "flex flex-row items-center justify-between",
//           "shadow-sm w-full rounded-md px-2 py-2",
//           "hover:cursor-pointer hover:rounded-xl hover:animate-pulse"
//         )}
//       >
//         <DashboardLabelChip
//           title={getLocationEntityUIConfig(assetType).label}
//           color={getLocationEntityUIConfig(assetType).color}
//         />
//         <h1
//           className={cn("font-semibold text-sm", tailwindColorClass.textColor)}
//         >
//           {assetData.name}
//         </h1>
//       </DashboardCard>
//     </div>
//   );
// });

// export const LocationDataPageView = memo(function LocationDataPageView({
//   data,
//   isSuspense = false,
//   assetChildren = [],
// }: {
//   isSuspense?: boolean;
//   data: AssetLocationEntity;
//   assetChildren: AssetLocationEntity[];
// }) {
//   const queryRoute = useDataQueryRoute();
//   const deleteAssetHook = useAssetDataDelete();

//   const layoutConfig: layoutsConfigType = {
//     sections: [
//       {
//         rows: [
//           {
//             blocks: [
//               {
//                 label: "經緯度",
//                 value: `(${data.lat ?? "0"}, ${data.lon ?? "0"})`,
//               },
//               {
//                 label: "城市",
//                 value: (data.city ?? "無").length > 0 ? data.city : "無",
//               },
//               {
//                 label: "國家",
//                 value: (data.country ?? "無").length > 0 ? data.country : "無",
//               },
//               {
//                 label: "郵遞區號",
//                 value: (data.zip ?? "無").length > 0 ? data.zip : "無",
//               },
//             ],
//           },
//           {
//             blocks: [
//               {
//                 label: "地址1",
//                 value:
//                   (data.addressLine1 ?? "無").length > 0
//                     ? data.addressLine1
//                     : "無",
//               },
//               {
//                 label: "地址2",
//                 value:
//                   (data.addressLine2 ?? "無").length > 0
//                     ? data.addressLine2
//                     : "無",
//               },
//             ],
//           },
//         ],
//       },
//       {
//         rows: [
//           {
//             blocks: [
//               {
//                 label: "子項目",
//                 children: (
//                   <MultiChildrenLayout>
//                     {getLocationChildrenTypeOptions(data.type).map((type) => (
//                       <CreateNewDataButton
//                         key={type}
//                         className={cn(
//                           "w-full rounded-md border h-fit",
//                           getLocationColor(type).textColor
//                         )}
//                         onClick={async () => {
//                           let newAncestors = [...data.ancestors, data.id!];
//                           queryRoute.createNewAsset(type, newAncestors);
//                         }}
//                         label={getLocationEntityUIConfig(type).label}
//                       />
//                     ))}
//                     {assetChildren!.map((child) => (
//                       <ChildAttributeButton
//                         key={child.id}
//                         className="w-full h-fit"
//                         onClick={() => queryRoute.setAssetId(child.id ?? "")}
//                         label={child.name}
//                       />
//                     ))}
//                   </MultiChildrenLayout>
//                 ),
//               },
//             ],
//           },
//         ],
//       },
//     ],
//   };

//   const onEdit = () => queryRoute.setAssetId(data.id!, true);

//   const onDelete = async () => {
//     console.log("presentation: UI button clicked - delete data index", data.id);
//     try {
//       const returnIndex = await deleteAssetHook.onDelete(data.id!);
//       queryRoute.setAssetId(returnIndex);
//     } catch (e) {
//       console.error("presentation: deleteData error", e);
//     }
//   };

//   const colorVariant = getLocationColor(data.type);

//   return (
//     <DataCard
//       colorTheme={{
//         bgColor: colorVariant.bgColor,
//         leadingColor: colorVariant.leadingColor,
//         textColor: colorVariant.textColor,
//         borderColor: "border-gray-200",
//       }}
//       isSuspense={isSuspense}
//       title={data.name}
//       description={data.description ?? ""}
//       layoutConfig={layoutConfig}
//       withDelete={assetChildren.length === 0}
//       withEdit={true}
//       isDeleting={deleteAssetHook.isDeleting}
//       onDelete={onDelete}
//       onEdit={onEdit}
//     />
//   );
// });
