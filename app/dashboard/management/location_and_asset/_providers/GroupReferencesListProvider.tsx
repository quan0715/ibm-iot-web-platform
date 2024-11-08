import {
  DocumentGroupType,
  DocumentObject,
  Property,
} from "@/domain/entities/Document";
import React, { createContext, useEffect, useState } from "react";
import { DocumentReferenceProperty } from "@/domain/entities/DocumentProperty";
import { getDocuments } from "@/app/dashboard/management/location_and_asset/_actions/DocumentAction";

interface ReferenceGroupContextType {
  group: DocumentGroupType;
  data: DocumentObject[];
}
export const ReferenceGroupContext = createContext<ReferenceGroupContextType[]>(
  [],
);

export function ReferenceGroupProvider({
  children,
  references,
}: React.PropsWithChildren<{ references: Property[] }>) {
  const [referenceGroupData, setReferenceGroupData] = useState<
    ReferenceGroupContextType[]
  >([]);

  useEffect(() => {
    references.forEach((reference) => {
      const group = (reference as DocumentReferenceProperty).referenceGroup;
      getDocuments(group).then((data) => {
        console.log("reference data", data);
        setReferenceGroupData((prevState) => [
          ...prevState,
          { group, data } as ReferenceGroupContextType,
        ]);
      });
    });
  }, [references]);

  return (
    <ReferenceGroupContext.Provider value={referenceGroupData}>
      {children}
    </ReferenceGroupContext.Provider>
  );
}
