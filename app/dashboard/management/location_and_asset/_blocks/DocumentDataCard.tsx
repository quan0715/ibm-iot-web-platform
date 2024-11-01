"use client";
import {
  DashboardCard,
  DashboardCardActionList,
  DashboardCardContent,
  DashboardCardHeader,
  DashboardCardHeaderContent,
  DashboardCardHeaderDescription,
  DashboardCardHeaderTitle,
} from "@/app/dashboard/_components/DashboardCard";
import {
  DocumentGroupType,
  DocumentObject,
  DocumentObjectType,
  Property,
} from "@/domain/entities/Document";
import { motion } from "framer-motion";
import { CreateNewDataButton, DeleteDialog } from "./DataCRUDTrigger";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  colorVariants,
  getDocumentTypeColor,
} from "../_utils/documentTypeUIConfig";
import { useContext, createContext, useState, use, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LuLink, LuLoader2, LuLock, LuUnlock } from "react-icons/lu";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { useDataQueryRoute } from "../_hooks/useQueryRoute";
import {
  useDocumentData,
  useDocumentWithSearchPath,
} from "../_hooks/useDocument";
import { DesktopOnly, MobileOnly } from "@/components/layouts/layoutWidget";
import { PropertyValueField } from "./DocuemntFormPropertyField";
import {
  getDocumentChildrenTypeOptions,
  getDocumentTypeLayer,
} from "@/domain/entities/DocumentConfig";
import { DocumentNavigateMenuDialog } from "./DocumentNavigationMenu";
import { DocumentReferencePropertyView } from "./DocumentDataDisplayUI";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingWidget } from "@/components/blocks/LoadingWidget";
import { createNewDocument } from "@/domain/entities/DocumentTemplate";
import { InputPropField } from "./property_field/InputPropField";
import { useDocumentTree } from "../_hooks/useDocumentContext";
// import { InfoBlock } from "./DocumentDataCard";

type DocumentDataCardProps = {
  data: DocumentObject;
  className?: string;
};

const ThemeContext = createContext(colorVariants["blue"]);

export function DocumentDataPageForm({
  data,
  className,
}: DocumentDataCardProps) {
  const documentTree = useDocumentTree();
  const dbType = documentTree.type;
  const queryPathService = useDataQueryRoute();
  const isCreatingNewData = queryPathService.mode === "create";

  const dataQueryService = useDocumentData(data.id ?? "", dbType);
  // const menu = useDocumentWithSearchPath(data.ancestors, dbType.type);
  const children = documentTree.getChildrenData(data.ancestors, data.id ?? "");

  const colorTheme = getDocumentTypeColor(
    data.type ?? DocumentObjectType.unknown
  );

  const form = useForm<DocumentObject>({
    defaultValues: data,
  });

  const propsField = useFieldArray({
    name: "properties",
    control: form.control,
  });

  async function onSubmit(values: DocumentObject) {
    // console.log("submit");
    let newData = {
      ...values,
      updateAt: new Date(),
      updateBy: "admin",
    } as DocumentObject;

    if (isCreatingNewData) {
      const newDataId = await dataQueryService.createNewDocument(newData);
      if (newDataId) {
        documentTree.updateDocument({
          ...newData,
          id: newDataId,
        });

        queryPathService.setAssetId(newDataId);
      }
      return;
    } else {
      await dataQueryService.updateDocument(newData);
      documentTree.updateDocument(newData);

      form.reset({
        ...newData,
      });
      queryPathService.refresh();
    }
  }

  async function onDelete() {
    try {
      await dataQueryService.deleteDocument(data.id ?? "");
      let path = documentTree.getPathData(data.ancestors);
      let index = path.findIndex((doc) => doc.id === data.id);
      if (!index || index === 0) {
        // backToParent
        let ancestor: DocumentObject[] =
          documentTree.getAncestorData(data.ancestors) ?? [];
        if (ancestor !== undefined && ancestor.length > 0) {
          queryPathService.setAssetId(ancestor[ancestor.length - 1].id ?? "");
        } else {
          queryPathService.moveBack();
        }
      } else {
        queryPathService.setAssetId(path[index - 1].id ?? "");
      }
      documentTree.deleteDocument(data.id ?? "");
    } catch (e) {
      console.error("presentation: deleteData error", e);
    }
  }

  const reset = () => {
    if (isCreatingNewData) {
      queryPathService.moveBack();
    } else {
      form.reset(data);
    }
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <ThemeContext.Provider value={colorTheme}>
            <DashboardCard className="shadow-sm w-full min-h-screen ">
              <DashboardCardHeader>
                <DashboardCardHeaderContent>
                  <InputPropField
                    name="title"
                    placeholder={`${getDocumentTypeLayer(data.type).name} 名稱`}
                    isRequired={true}
                    textCss={cn("text-xl font-semibold", colorTheme.textColor)}
                  ></InputPropField>
                  <InputPropField
                    name="description"
                    textCss={cn("text-md font-semibold")}
                  ></InputPropField>
                  {isCreatingNewData ? null : (
                    <DesktopOnly>
                      <div className="flex flex-row items-center justify-start space-x-2 px-2">
                        <StaticAttrChip
                          label="上次編輯時間"
                          value={
                            data.updateAt.toLocaleDateString() +
                            " " +
                            data.updateAt.toLocaleTimeString()
                          }
                        />
                        <Separator
                          orientation="vertical"
                          className="h-6 hidden md:block"
                        />

                        <StaticAttrChip
                          label="上次修改者"
                          value={data!.updateBy}
                        />
                      </div>
                    </DesktopOnly>
                  )}
                </DashboardCardHeaderContent>
                <DashboardCardActionList>
                  {!isCreatingNewData && data!.id ? (
                    <DeleteDialog
                      onDelete={onDelete}
                      isDisabled={children.length > 0}
                      isDeleting={dataQueryService.isDeletingData}
                    />
                  ) : null}
                </DashboardCardActionList>
              </DashboardCardHeader>
              <Separator />
              <DashboardCardContent className="flex flex-col space-y-2">
                <div className="w-full grid grid-cols-1 justify-between h-fit gap-2">
                  {propsField.fields.map((field, index) => {
                    return (
                      <div
                        className="w-full flex flex-row flex-1"
                        key={field.id}
                      >
                        <InfoBlock label={field.name}>
                          <PropertyValueField
                            property={form.watch().properties[index]}
                            index={index}
                          />
                        </InfoBlock>
                      </div>
                    );
                  })}
                </div>
                <Separator />
                <div
                  className={"flex flex-row justify-end items-center space-x-2"}
                >
                  <Button
                    disabled={
                      isCreatingNewData
                        ? false
                        : form.formState.isSubmitting || !form.formState.isDirty
                    }
                    type="button"
                    size="lg"
                    variant={"outline"}
                    onClick={reset}
                  >
                    {isCreatingNewData ? "取消" : "重設"}
                  </Button>
                  <Button
                    disabled={
                      form.formState.isSubmitting || !form.formState.isDirty
                    }
                    type="submit"
                    variant={"outline"}
                    className={cn(colorTheme.textColor)}
                    size="lg"
                  >
                    <div>
                      {!isCreatingNewData ? "更新" : "新增"}
                      {form.formState.isSubmitting ? (
                        <LuLoader2 className="animate-spin" />
                      ) : null}
                    </div>
                  </Button>
                </div>
              </DashboardCardContent>
            </DashboardCard>
          </ThemeContext.Provider>
        </form>
      </Form>
    </motion.div>
  );
}

export function InfoBlock({
  label,
  className,
  orientation = "vertical",
  children,
}: {
  label: string;
  className?: string;
  orientation?: "horizontal" | "vertical";
  children?: React.ReactNode;
}) {
  const colorTheme = useContext(ThemeContext);
  return orientation === "horizontal" ? (
    <div
      className={cn(
        "w-48 h-fit flex flex-col justify-start items-center p-1",
        className
      )}
    >
      {children}
    </div>
  ) : (
    <div
      className={cn(
        "w-full grid grid-cols-8 py-1 gap-2 grid-flow-col",
        className
      )}
    >
      <div
        className={cn(
          colorTheme.textColor,
          "col-span-2 flex flex-rol justify-between items-start text-md font-normal"
        )}
      >
        {label}
        <Separator orientation="vertical" className="min-h-1 hidden md:block" />
      </div>
      <div className="col-span-6 flex flex-col justify-start items-start">
        {children}
      </div>
    </div>
  );
}

// function MultiChildrenBlock<T extends DocumentObject>({
//   label,
//   child,
//   parent,
//   className,
// }: {
//   parent: DocumentObject;
//   label: string;
//   child: T[];
//   labelColor?: string;
//   className?: string;
// }) {
//   const queryPathService = useDataQueryRoute();
//   const layerRule = getDocumentTypeLayer(parent.type);
//   const childrenOptions = getDocumentChildrenTypeOptions(
//     parent.type,
//     layerRule.group
//   );
//   return (
//     <InfoBlock label={label} className={cn(className)}>
//       {queryPathService.mode === "create"
//         ? null
//         : childrenOptions.map((type) => (
//             <CreateNewDataButton
//               key={type}
//               className={cn(
//                 "w-fit rounded-md h-fit",
//                 getDocumentTypeColor(type).textColor
//               )}
//               onClick={async () => {
//                 let newAncestors =
//                   parent.ancestors.length > 0
//                     ? parent.ancestors + "," + parent.id
//                     : parent.id;
//                 if (newAncestors) {
//                   queryPathService.createNewAsset(type, newAncestors);
//                 }
//               }}
//               label={getDocumentEntityUIConfig(type).label}
//             />
//           ))}
//       <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0.5">
//         {child.map((child, index) => {
//           return (
//             <DocumentReferencePropertyView
//               key={child.id}
//               data={child}
//               onClick={() => queryPathService.setAssetId(child.id ?? "")}
//               mode={"display"}
//             />
//           );
//         })}
//         {childrenOptions.length === 0 && child.length === 0 ? (
//           <p className={"text-sm text-gray-500 font-semibold"}>無下層資料</p>
//         ) : null}
//       </div>
//     </InfoBlock>
//   );
// }

export function StaticAttrChip({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-row justify-between items-center pr-2 rounded-md"
      )}
    >
      <div>
        <p className={cn("flex-0 text-sm text-gray-400")}>{label}</p>
      </div>
      <div>
        <p className={cn("pl-2 text-sm text-gray-800 dark:text-gray-500")}>
          {value}
        </p>
      </div>
    </div>
  );
}
