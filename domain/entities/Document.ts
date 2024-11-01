import { Property } from "./DocumentProperty";

enum DocumentObjectType {
  organization = "organization",
  phase = "phase",
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
  testObject = "testObject",
  unknown = "unknown",
}

enum DocumentGroupType {
  Location = "Location",
  Asset = "Asset",
  Meter = "Meter",
  GHG = "GHG",
  Unknown = "Unknown",
  Root = "Root",
  testGroup = "testGroup",
  MeterReading = "MeterReading",
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

interface DocumentObjectTemplate {
  group: DocumentGroupType;
  properties: Property[];
}

type DocumentTypeString = keyof typeof DocumentObjectType;
type DocumentGroupTypeString = keyof typeof DocumentGroupType;

function getDocumentGroupTypeFromString(type: string): DocumentGroupType {
  if (!Object.keys(DocumentGroupType).includes(type)) {
    return DocumentGroupType.Unknown;
  }
  return DocumentGroupType[type as keyof typeof DocumentGroupType];
}

function getDocumentObjectTypeFromString(
  typeString: string
): DocumentObjectType {
  if (!Object.keys(DocumentObjectType).includes(typeString)) {
    return DocumentObjectType.unknown;
  }
  return DocumentObjectType[typeString as DocumentTypeString];
}

export type {
  DocumentObject,
  DocumentObjectTemplate,
  Property,
  DocumentTypeString,
  DocumentGroupTypeString,
};

export {
  DocumentGroupType,
  DocumentObjectType,
  getDocumentGroupTypeFromString,
  getDocumentObjectTypeFromString,
};
