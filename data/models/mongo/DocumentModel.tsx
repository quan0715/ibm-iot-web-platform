import {
  DocumentObject,
  DocumentTypeString,
  getDocumentObjectTypeFromString,
  Property,
} from "@/domain/entities/Document";

// import { AssetType } from "@/domain/entities/LocationType";
import { ObjectId } from "mongodb";

export class MongoDocumentObjectModel {
  _id: ObjectId | undefined;
  title: string = "";
  description: string = "";
  type: DocumentTypeString = "unknown";
  ancestors: string = "";
  createAt: Date = new Date();
  updateAt: Date = new Date();
  createBy: string = "";
  updateBy: string = "";
  properties: Property[] = [];

  constructor(
    _id: ObjectId | undefined,
    title: string,
    description: string | undefined,
    type: DocumentTypeString,
    ancestors: string | undefined,
    createAt: Date,
    updateAt: Date,
    createBy: string,
    updateBy: string,
    properties: Property[]
  ) {
    this._id = _id;
    this.title = title;
    this.description = description ?? "";
    this.type = type ?? "unknown";
    this.ancestors = ancestors ?? "";
    this.createAt = createAt;
    this.updateAt = updateAt;
    this.createBy = createBy;
    this.updateBy = updateBy;
    this.properties = properties;
  }

  toEntity(): DocumentObject {
    return {
      id: this._id?.toHexString() ?? "",
      title: this.title,
      description: this.description ?? "",
      type: getDocumentObjectTypeFromString(this.type),
      ancestors: this.ancestors,
      createAt: this.createAt,
      updateAt: this.updateAt,
      createBy: this.createBy,
      updateBy: this.updateBy,
      properties: this.properties,
    };
  }
}
