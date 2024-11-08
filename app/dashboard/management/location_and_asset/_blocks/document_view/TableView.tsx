"use client";
import {
  DocumentObject,
  DocumentObjectType,
  Property,
} from "@/domain/entities/Document";
import { cn } from "@/lib/utils";

import React, { createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { useFieldArray, useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";

import {
  colorVariants,
  getDocumentTypeColor,
} from "../../_utils/documentTypeUIConfig";
import { useDocumentTree } from "../../_hooks/useDocumentContext";
import { useDataQueryRoute } from "../../_hooks/useQueryRoute";
import { useDocumentData } from "../../_hooks/useDocument";
import { InputPropField } from "../property_field/InputPropField";
import { PropertyValueField } from "../DocuemntFormPropertyField";
import { useTable } from "@/app/dashboard/management/location_and_asset/_hooks/useTable";
import {
  Column,
  TableContext,
  TableProvider,
} from "@/app/dashboard/management/location_and_asset/_providers/TableContextProvider";
import { PropertyType } from "@/domain/entities/DocumentProperty";
import { IoTextOutline } from "react-icons/io5";
import { GoNumber } from "react-icons/go";
import { LuLoader2, LuLink2, LuCalendarDays } from "react-icons/lu";
import { CiHashtag } from "react-icons/ci";

type TableProps = {
  title?: string;
  description?: string;
  properties: Property[];
} & React.PropsWithChildren<{}> &
  React.HTMLAttributes<HTMLDivElement>;

type TableHeaderProps = {} & React.HTMLAttributes<HTMLDivElement>;

type TableHeaderCellProps = {
  column: Column;
} & React.HTMLAttributes<HTMLDivElement>;
type TableRowProps = {} & React.HTMLAttributes<HTMLTableRowElement>;
type TableBodyProps = {} & React.HTMLAttributes<HTMLTableSectionElement>;
type TableCellProps = {} & React.HTMLAttributes<HTMLTableCellElement>;
export function Table({
  title = "",
  description = "",
  properties,
  className,
  children,
}: TableProps) {
  const tableContext = {
    title: title ?? "",
    description: description ?? "",
    columns: properties.map((prop) => {
      return {
        columnName: prop.name,
        property: prop as Property,
        width: 100,
      };
    }),
  } as TableContext;
  const table = useTable();

  return (
    <TableProvider table={tableContext}>
      <div className={cn("flex flex-col justify-start items-start", className)}>
        {children}
      </div>
    </TableProvider>
  );
}

export function TableRow({ className, children }: TableRowProps) {
  return (
    <div
      className={cn(
        "flex flex-row justify-start items-center space-x-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TableHeader({ className, children }: TableHeaderProps) {
  const tableContext = useContext(TableContext);
  return <div className={className}>{children}</div>;
}

export function TableHeaderCell({ className, column }: TableHeaderCellProps) {
  const getHeaderIcon = (propertyType: PropertyType) => {
    switch (propertyType) {
      case PropertyType.text:
        return <IoTextOutline />;
      case PropertyType.number:
        return <GoNumber />;
      case PropertyType.status:
        return <CiHashtag />;
      case PropertyType.reference:
        return <LuLink2 />;
      case PropertyType.dateTime:
        return <LuCalendarDays />;
      default:
        return undefined;
    }
  };
  return (
    <div
      className={cn(
        "p-2 w-48 ",
        "border-b border-black/5 dark:border-white/10",
        className,
      )}
    >
      <div
        className={
          "flex flex-row justify-start items-center text-gray-500 space-x-2"
        }
      >
        {getHeaderIcon(column.property.type)}
        <p className={"text-sm font-normal "}>{column.columnName}</p>
      </div>
    </div>
  );
}

export function TableBody({ className, children }: TableBodyProps) {
  return <tbody className={cn(className)}>{children}</tbody>;
}

export function TableCell({ className, children }: TableRowProps) {
  return (
    <div
      className={cn(
        "w-48 h-11 flex flex-row justify-center items-center p-1",
        "border-collapse border-b border-r border-black/5 dark:border-white/10",
        className,
      )}
    >
      {children}
    </div>
  );
}

const ThemeContext = createContext(colorVariants["blue"]);

type DocumentFormTableViewProps = {
  data: DocumentObject;
  className?: string;
};

export function DocumentObjectTableRow({
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
    data.type ?? DocumentObjectType.unknown,
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={"flex flex-row relative"}
      >
        <ThemeContext.Provider value={colorTheme}>
          <TableCell>
            <InputPropField name="description" textCss={cn("font-semibold")} />
          </TableCell>
          {propsField.fields.map((field, index) => {
            return (
              <TableCell key={field.id}>
                <PropertyValueField
                  key={field.id}
                  property={form.watch().properties[index]}
                  index={index}
                  view="table"
                  form={"form"}
                />
              </TableCell>
            );
          })}
          {form.formState.isDirty && (
            <div
              className={
                "w-fit z-10 backdrop-blur bg-background flex flex-row justify-start items-center space-x-2 p-2 rounded-xl absolute top-[100%]"
              }
            >
              <TableCell>
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
              </TableCell>
            </div>
          )}
        </ThemeContext.Provider>
      </form>
    </Form>
  );
}
