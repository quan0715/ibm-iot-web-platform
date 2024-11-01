import {
  DocumentGroupType,
  DocumentObject,
  DocumentObjectTemplate,
  DocumentObjectType,
} from "./Document";
import { getDocumentGroupTypeFromObject } from "./DocumentConfig";
import { PropertyType } from "./DocumentProperty";

export function createNewDocument(
  template: DocumentObjectTemplate,
  type: DocumentObjectType,
  ancestors: string,
  user: string = ""
) {
  return {
    id: "",
    type: type,
    ancestors: ancestors,
    title: "",
    description: "",
    createAt: new Date(),
    updateAt: new Date(),
    createBy: user,
    updateBy: user,
    properties: template.properties,
  };
}
