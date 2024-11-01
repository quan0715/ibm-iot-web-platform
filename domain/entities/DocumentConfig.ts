import { DocumentGroupType, DocumentObjectType } from "./Document";

export const getDocumentGroupTypeFromObject = (type: DocumentObjectType) => {
  let views = documentConfig
    .map((config) => config.views)
    .flat()
    .find((view) => view.layers.some((layer) => layer.type === type));
  if (views) {
    return views.group;
  } else {
    return DocumentGroupType.Unknown;
  }
};

// group / type to children layer option
export const getDocumentChildrenTypeOptions = (
  type: DocumentObjectType,
  group: DocumentGroupType
) => {
  let views = documentConfig
    .map((config) => config.views)
    .flat()
    .find((view) => view.group === group);
  if (views) {
    let options = views.layers.filter(
      (layer) =>
        layer.parent === type && layer.type !== DocumentObjectType.unknown
    );
    return options ? options.map((layer) => layer.type) : [];
  }
  return [];
};

// group to type option list
export const getDocumentGroupTypeList = (group?: DocumentGroupType) => {
  let views = documentConfig.map((config) => config.views).flat();
  let groupView = views.find((view) => view.group === group);
  if (groupView) {
    return groupView.layers.map((layer) => layer.type);
  }
  return [];
};

// group to default type
export const getGroupDefaultType = (group: DocumentGroupType) => {
  let views = documentConfig
    .map((config) => config.views)
    .flat()
    .find((view) => view.group === group);
  if (views) {
    let defaultView = views.layers.find(
      (layer) => layer.parent === DocumentObjectType.unknown
    );
    return defaultView ? defaultView.type : DocumentObjectType.unknown;
  }
  return DocumentObjectType.unknown;
};

export function getDocumentTypeLayerDepth(type: DocumentObjectType): number {
  let view = documentConfig
    .map((config) => config.views)
    .flat()
    .find((view) => view.layers.some((layer) => layer.type === type));
  if (view) {
    let targetLayer = view.layers.find((layer) => layer.type === type);
    if (targetLayer) {
      return 1 + getDocumentTypeLayerDepth(targetLayer.parent);
    }
    return 0;
  }
  return 0;
}

export function getDocumentTypeLayer(type: DocumentObjectType) {
  let depth = getDocumentTypeLayerDepth(type);
  let view = documentConfig
    .map((config) => config.views)
    .flat()
    .find((view) => view.layers.some((layer) => layer.type === type));
  if (view) {
    let targetLayer = view.layers.find((layer) => layer.type === type);
    if (targetLayer) {
      return {
        ...targetLayer,
        depth: depth,
      };
    }
    return {
      name: "Unknown",
      type: DocumentObjectType.unknown,
      parent: DocumentObjectType.unknown,
      depth: depth,
    };
  }
  return {
    name: "Unknown",
    type: DocumentObjectType.unknown,
    parent: DocumentObjectType.unknown,
    depth: depth,
  };
}

export interface DocumentLayer {
  dirName: string;
  views: {
    group: DocumentGroupType;
    isDefault?: boolean;
    viewName: string;
    layers: Layer[];
  }[];
}

interface Layer {
  name: string;
  type: DocumentObjectType;
  parent: DocumentObjectType;
}

export const documentConfig = [
  {
    dirName: "Location",
    views: [
      {
        group: DocumentGroupType.Location,
        isDefault: true,
        viewName: "位置主檔",
        layers: [
          {
            name: "組織",
            type: DocumentObjectType.organization,
            parent: DocumentObjectType.unknown,
          },
          {
            name: "Phase",
            type: DocumentObjectType.phase,
            parent: DocumentObjectType.organization,
          },
          {
            name: "廠區",
            type: DocumentObjectType.site,
            parent: DocumentObjectType.phase,
          },
          {
            name: "部門",
            type: DocumentObjectType.department,
            parent: DocumentObjectType.site,
          },
          {
            name: "系統",
            type: DocumentObjectType.system,
            parent: DocumentObjectType.department,
          },
          {
            name: "Route",
            type: DocumentObjectType.route,
            parent: DocumentObjectType.department,
          },
          {
            name: "Operation",
            type: DocumentObjectType.operation,
            parent: DocumentObjectType.route,
          },
          {
            name: "子系統",
            type: DocumentObjectType.subSystem,
            parent: DocumentObjectType.system,
          },
        ],
      },
      {
        group: DocumentGroupType.Asset,
        isDefault: false,
        viewName: "資產主檔",
        layers: [
          {
            name: "資產",
            type: DocumentObjectType.tool,
            parent: DocumentObjectType.unknown,
          },
          {
            name: "資產",
            type: DocumentObjectType.tool,
            parent: DocumentObjectType.tool,
          },
          {
            name: "元件",
            type: DocumentObjectType.component,
            parent: DocumentObjectType.tool,
          },
        ],
      },
    ],
  },
  {
    dirName: "讀數主檔",
    views: [
      {
        group: DocumentGroupType.Meter,
        isDefault: true,
        viewName: "Meter 主檔",
        layers: [
          {
            name: "Meter",
            type: DocumentObjectType.meter,
            parent: DocumentObjectType.unknown,
          },
        ],
      },
      {
        group: DocumentGroupType.GHG,
        isDefault: false,
        viewName: "GHG 主檔",
        layers: [
          {
            name: "GHG",
            type: DocumentObjectType.ghg,
            parent: DocumentObjectType.unknown,
          },
        ],
      },
      {
        group: DocumentGroupType.MeterReading,
        isDefault: false,
        viewName: "Meter Reading 主檔",
        layers: [
          {
            name: "Meter 讀數",
            type: DocumentObjectType.meterReading,
            parent: DocumentObjectType.unknown,
          },
        ],
      },
    ],
  },
  {
    dirName: "test",
    views: [
      {
        group: DocumentGroupType.testGroup,
        isDefault: false,
        viewName: "test",
        layers: [
          {
            name: "test",
            type: DocumentObjectType.testObject,
            parent: DocumentObjectType.unknown,
          },
        ],
      },
    ],
  },
] as DocumentLayer[];
