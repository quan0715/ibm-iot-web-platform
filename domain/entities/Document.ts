import { Property } from "./DocumentProperty";

enum DocumentObjectType {
  organization = "organization",
  site = "site",
  department = "department",
  system = "system",
  subSystem = "subSystem",
  route = "route",
  operation = "operation",
  component = "component",
  tool = "tool",
  meter = "meter",
  ghg = "ghg",
  meterReading = "meterReading",
  unknown = "unknown",
}

interface DocumentObject {
  id: string | undefined;
  type: DocumentObjectType;
  ancestors: string;
  title: string;
  description: string;
  createAt: Date;
  updateAt: Date;
  createBy: string;
  updateBy: string;
  properties: Property[];
}

// example of a document

type DocumentTypeString = keyof typeof DocumentObjectType;

enum DocumentGroupType {
  Location = "Location",
  Asset = "Asset",
  Meter = "Meter",
  GHG = "GHG",
  Unknown = "Unknown",
  Root = "Root",
  MeterReading = "MeterReading",
}

type DocumentGroupTypeString = keyof typeof DocumentGroupType;

function getDocumentGroupTypeFromString(type: string): DocumentGroupType {
  if (!Object.keys(DocumentGroupType).includes(type)) {
    return DocumentGroupType.Unknown;
  }
  return DocumentGroupType[type as keyof typeof DocumentGroupType];
}

export type {
  DocumentObject,
  Property,
  DocumentTypeString,
  DocumentGroupTypeString,
};

export {
  DocumentGroupType,
  DocumentObjectType,
  getDocumentGroupTypeFromString,
};
