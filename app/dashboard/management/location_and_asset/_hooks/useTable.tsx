import React from "react";
import { TableContext } from "@/app/dashboard/management/location_and_asset/_providers/TableContextProvider";

export function useTable() {
  const tableContext = React.useContext(TableContext);
  if (!tableContext) {
    throw new Error("useTable.tsx must be used within a TableContextProvider");
  }

  const getColumn = (columnName: string) => {
    const column = tableContext.columns.find(
      (column) => column.columnName === columnName,
    );
    if (!column) {
      throw new Error(`Column ${columnName} not found`);
    }
    return column;
  };

  return {
    table: tableContext,
    getColumn,
  };
}
