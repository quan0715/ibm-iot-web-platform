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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { useContext, createContext, useState, use, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LuLink, LuLoader2, LuLock, LuUnlock } from "react-icons/lu";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import { Form } from "@/components/ui/form";

import { DesktopOnly, MobileOnly } from "@/components/layouts/layoutWidget";
import {
  getDocumentChildrenTypeOptions,
  getDocumentTypeLayer,
  getGroupDefaultType,
} from "@/domain/entities/DocumentConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingWidget } from "@/components/blocks/LoadingWidget";
import { createNewDocument } from "@/domain/entities/DocumentTemplate";
import {
  colorVariants,
  getDocumentTypeColor,
} from "../../_utils/documentTypeUIConfig";
import { useDocumentTree } from "../../_hooks/useDocumentContext";
import { useDataQueryRoute } from "../../_hooks/useQueryRoute";
import { useDocumentData } from "../../_hooks/useDocument";
import { InputPropField } from "../property_field/InputPropField";
import { PropertyValueField } from "../DocuemntFormPropertyField";
import { InfoBlock } from "../DocumentDataCard";
import { useDocumentTemplate } from "../../_hooks/useDocumentTemplate";
import {
  TextProperty,
  TitleProperty,
} from "@/domain/entities/DocumentProperty";
import { config } from "process";
import { TableContext } from "./CollapsibleView";
import {
  DocumentReferencePropertyView,
  DocumentTreeNode,
} from "../DocumentDataDisplayUI";

export function DocumentFormTableView() {
  const rootPath = "";
  const documentTree = useDocumentTree();
  const queryRoute = useDataQueryRoute();
  const rootDataList = documentTree.getPathData(rootPath);
  const defaultType = getGroupDefaultType(documentTree.type);

  const { group, isLoadingTemplate, template } = useDocumentTemplate(
    documentTree.type
  );

  if (isLoadingTemplate || !template) {
    return <LoadingWidget />;
  }

  const color = getDocumentTypeColor(defaultType);

  const properties = [
    {
      name: "名稱",
      value: "",
    } as Property,
    {
      name: "敘述",
      value: "",
    } as Property,
    ...(template?.properties ?? ([] as Property[])),
  ];
  return (
    <div className="p-2 bg-background">
      <DocumentTableHeader props={properties} />
      <Separator />
      {rootDataList.map((data) => {
        return <DocumentFormTableColumn key={data.id} data={data} />;
      })}
    </div>
  );
}

function DocumentTableHeader({ props }: { props: Property[] }) {
  return (
    <div className="w-full flex flex-row justify-start items-center p-2">
      {props.map((prop) => {
        return <DocumentTableHeaderCell key={prop.name} prop={prop} />;
      })}
    </div>
  );
}

function DocumentTableHeaderCell({ prop }: { prop: Property }) {
  return (
    <div className="w-48 text-sm font-semibold text-gray-500">
      <p>{prop.name}</p>
    </div>
  );
}

type DocumentFormTableViewProps = {
  data: DocumentObject;
  className?: string;
};

const ThemeContext = createContext(colorVariants["blue"]);

export function DocumentFormTableColumn({
  data,
  className,
}: DocumentFormTableViewProps) {
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
  const config = useContext(TableContext);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <ThemeContext.Provider value={colorTheme}>
          <div className="flex flex-col">
            <DashboardCard className="shadow-sm flex flex-row justify-start items-start ">
              {/* <InfoBlock label={""} orientation={"horizontal"}>
                <DocumentReferencePropertyView
                  data={data}
                  mode="display"
                  onClick={() => queryPathService.setAssetId(data.id!)}
                />
              </InfoBlock> */}
              <InfoBlock label={""} orientation={"horizontal"}>
                <InputPropField
                  name="description"
                  textCss={cn(" font-semibold")}
                ></InputPropField>
              </InfoBlock>
              {propsField.fields.map((field, index) => {
                return (
                  <InfoBlock
                    key={field.id}
                    orientation="horizontal"
                    label={field.name}
                    className={
                      config.find((config) => config.name === field.name)
                        ?.width ?? "w-48"
                    }
                  >
                    <PropertyValueField
                      key={field.id}
                      property={form.watch().properties[index]}
                      index={index}
                      view="table"
                    />
                  </InfoBlock>
                );
              })}
            </DashboardCard>
            {form.formState.isDirty && (
              <div
                className={
                  "w-full flex flex-row justify-start items-center space-x-2 py-1"
                }
              >
                <Button
                  disabled={
                    isCreatingNewData
                      ? false
                      : form.formState.isSubmitting || !form.formState.isDirty
                  }
                  type="button"
                  size="sm"
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
                  size="sm"
                >
                  <div>
                    {!isCreatingNewData ? "更新" : "新增"}
                    {form.formState.isSubmitting ? (
                      <LuLoader2 className="animate-spin" />
                    ) : null}
                  </div>
                </Button>
              </div>
            )}
          </div>
        </ThemeContext.Provider>
      </form>
    </Form>
  );
}
