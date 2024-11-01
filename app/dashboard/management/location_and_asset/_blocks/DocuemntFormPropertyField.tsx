import {
  DocumentReferenceProperty,
  OptionsProperty,
  Property,
  PropertyType,
} from "@/domain/entities/DocumentProperty";
// import { InfoBlock } from "./DocumentDataCard";
import { Status } from "@/domain/entities/Status";
import { StatusChip } from "@/components/blocks/chips";
import React from "react";
import { DocumentReferenceField } from "./property_field/ReferencePropField";
import { InputPropField } from "./property_field/InputPropField";
import { CheckBoxPropField } from "./property_field/CheckBoxPropField";
import { DashboardSelectionField } from "./property_field/SelectionPropField";
import { DateTimePickerField } from "./property_field/DateTimePropField";
import { DocumentTreeProvider } from "../_hooks/useDocumentContext";

export function PropertyValueField({
  property,
  index,
  view = "page",
}: {
  property: Property;
  index?: number;
  view?: "page" | "table";
}) {
  if (property === undefined) {
    return null;
  }
  const orientation = view == "page" ? "vertical" : "horizontal";
  switch (property.type as PropertyType) {
    case PropertyType.text:
      return (
        // <InfoBlock label={property.name} orientation={orientation}>
        <InputPropField
          isRequired={property.required}
          name={`properties.${index}.value`}
          isDisabled={property.readonly}
        />
        // </InfoBlock>
      );
    case PropertyType.number:
      return (
        // <InfoBlock label={property.name} orientation={orientation}>
        <InputPropField
          isRequired={property.required}
          name={`properties.${index}.value`}
          isDisabled={property.readonly}
          inputType="text"
        />
        // </InfoBlock>
      );
    case PropertyType.boolean:
      return (
        // <InfoBlock label={property.name} orientation={orientation}>
        <CheckBoxPropField
          isRequired={property.required}
          name={`properties.${index}.value`}
          isDisabled={property.readonly}
        />
        // </InfoBlock>
      );
    case PropertyType.reference:
      return (
        // <InfoBlock label={property.name} orientation={orientation}>
        <DocumentTreeProvider
          type={(property as DocumentReferenceProperty).referenceGroup}
        >
          <DocumentReferenceField
            // isRequired={property.required}
            name={`properties.${index}.value`}
            isDisabled={property.readonly}
            limit={(property as DocumentReferenceProperty).limit}
            referenceGroup={
              (property as DocumentReferenceProperty).referenceGroup
            }
            view={view}
          />
        </DocumentTreeProvider>

        // </InfoBlock>
      );
    case PropertyType.options:
      return (
        // <InfoBlock label={property.name} orientation={orientation}>
        <DashboardSelectionField
          isRequired={property.required}
          name={`properties.${index}.value`}
          options={(property as OptionsProperty).options.map(
            (option: string, index) => {
              return {
                key: index,
                value: option,
                component: <p>{option}</p>,
              };
            }
          )}
          isDisabled={property.readonly}
        />
        // </InfoBlock>
      );
    case PropertyType.dateTime:
      return (
        // <InfoBlock label={property.name} orientation={orientation}>
        <DateTimePickerField
          key={index + property.name}
          isRequired={property.required}
          name={`properties.${index}.value` as const}
          isDisabled={property.readonly}
        />
        // </InfoBlock>
      );
    case PropertyType.status:
      return (
        // <InfoBlock label={property.name} orientation={orientation}>
        <DashboardSelectionField
          isRequired={property.required}
          name={`properties.${index}.value`}
          isDisabled={property.readonly}
          options={Object.keys(Status).map((status: string, index) => {
            return {
              key: index,
              value: status,
              component: (
                <StatusChip status={Status[status as keyof typeof Status]} />
              ),
            };
          })}
        />
        // </InfoBlock>
      );
    default:
      return null;
  }
}
