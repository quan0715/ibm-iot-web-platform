import { DocumentGroupType, DocumentObject } from "@/domain/entities/Document";
import { createContext, use, useContext, useEffect, useState } from "react";
import React from "react";
import { DocumentTree } from "@/domain/entities/Document";
// interface DocumentTree {
//   path: string;
//   documents: {
//     [key: string]: DocumentObject;
//   };
// }

interface DocumentContextType {
  type: DocumentGroupType;
  documents: DocumentTree;
  isInit: boolean;
  setDocuments: React.Dispatch<React.SetStateAction<DocumentTree>>;
}

export const DocumentContext = createContext<DocumentContextType>({
  type: DocumentGroupType.Unknown,
  documents: {} as DocumentTree,
  isInit: false,
  setDocuments: () => {},
});

export function useDocumentTree() {
  const context = useContext(DocumentContext);

  if (context === undefined) {
    throw new Error(
      "useDocumentTree must be used within a DocumentTreeProvider",
    );
  }

  function getPathData(path: string) {
    const dataPath = context.documents.get(path);
    if (dataPath === undefined) {
      return [];
    }
    return Array.from(dataPath.values());
  }

  function getAncestorData(ancestorPath: string): DocumentObject[] {
    const ancestorPathList = ancestorPath.split(",");
    // let ancestorData = [];
    return ancestorPathList
      .map((ancestorId) => getDocumentData(ancestorId))
      .filter((doc) => doc !== undefined) as DocumentObject[];
  }

  function getChildrenData(parentPath: string, dataIndex: string) {
    const searchPath =
      parentPath === "" ? dataIndex : [parentPath, dataIndex].join(",");
    const childrenMap = context.documents.get(searchPath);

    if (!childrenMap) {
      return [];
    }

    return Array.from(childrenMap.values()).sort((a, b) => {
      return a.type < b.type ? -1 : a.type > b.type ? 1 : 0;
    });
  }

  function getDocumentData(docId: string) {
    for (let path of Array.from(context.documents.keys())) {
      let value =
        context.documents.get(path) ?? new Map<string, DocumentObject>();
      if (value.has(docId)) {
        return value.get(docId);
      }
    }
    return undefined;
  }
  function updateDocumentTree(data: DocumentTree) {
    context.setDocuments(data);
  }

  function updatePath(path: string, data: DocumentObject[]) {
    const newDocuments = new Map<string, DocumentObject>();
    data.forEach((doc) => {
      newDocuments.set(doc.id!, doc);
    });
    context.setDocuments(context.documents.set(path, newDocuments));
  }

  function updateDocument(data: DocumentObject) {
    const newDocuments =
      context.documents.get(data.ancestors) ??
      new Map<string, DocumentObject>();
    newDocuments.set(data.id!, data);
    context.setDocuments(context.documents.set(data.ancestors, newDocuments));
  }

  function deleteDocument(docId: string) {
    for (let path of Array.from(context.documents.keys())) {
      let value =
        context.documents.get(path) ?? new Map<string, DocumentObject>();
      if (value.has(docId)) {
        value.delete(docId);
        context.setDocuments(context.documents.set(path, value));
        break;
      }
    }
  }

  return {
    type: context.type,
    documents: context.documents,
    isInit: context.isInit,
    getPathData,
    getDocumentData,
    getChildrenData,
    getAncestorData,
    updatePath,
    updateDocumentTree,
    updateDocument,
    deleteDocument,
  };
}
