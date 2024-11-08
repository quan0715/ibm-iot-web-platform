import { Property } from "@/domain/entities/DocumentProperty";
import React, { createContext } from "react";
export type Column = {
  columnName: string;
  property: Property;
  width: number;
  isHidden?: boolean;
  isLocked?: boolean;
  isEditable?: boolean;
  isSortable?: boolean;
  isResizable?: boolean;
  sortDirection?: "asc" | "desc";
};

export type TableContext = {
  title: string;
  description: string;
  columns: [Column];
};

export const TableContext = createContext<TableContext>({} as TableContext);

type TableContextProviderProps = {
  table: TableContext;
  children: React.ReactNode;
};

export function TableProvider({ children, table }: TableContextProviderProps) {
  return (
    <TableContext.Provider value={table}>{children}</TableContext.Provider>
  );
}
