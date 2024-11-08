import { DocumentGroupType, DocumentObject } from "@/domain/entities/Document";
import React, { useEffect, useState } from "react";
import { useDocumentReference } from "@/app/dashboard/management/location_and_asset/_hooks/useDocument";
import { DocumentContext } from "@/app/dashboard/management/location_and_asset/_hooks/useDocumentContext";
import { DocumentTree } from "@/domain/entities/Document";

export function DocumentSearchTreeProvider({
  children,
  type,
}: {
  type: DocumentGroupType;
  children: React.ReactNode;
}) {
  const [documents, setDocuments] = useState<DocumentTree>(
    new Map<string, Map<string, DocumentObject>>(),
  );

  const { isFetchingData, documentList } = useDocumentReference(type);
  const initPath = "";

  useEffect(() => {
    console.log("DocumentTreeProvider init", type);
    if (isFetchingData) return;
    if (documentList) {
      console.log("DocumentTreeProvider init", documentList);
      const pathMap = new Map<string, Map<string, DocumentObject>>();
      documentList.forEach((doc) => {
        let newDocumentsMap =
          pathMap.get(doc.ancestors) ?? new Map<string, DocumentObject>();
        newDocumentsMap.set(doc.id!, doc);
        pathMap.set(doc.ancestors, newDocumentsMap);
      });
      //     newDocuments.set(initPath, new Map<string, DocumentObject>());
      console.log("DocumentTreeProvider init", pathMap);
      setDocuments(pathMap);
    }
  }, [documentList, isFetchingData, type]);

  return (
    <DocumentContext.Provider
      value={{ type, documents, setDocuments, isInit: isFetchingData }}
    >
      {children}
    </DocumentContext.Provider>
  );
}
