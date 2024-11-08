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

export function PropertyValueField({
  property,
  index,
  view = "page",
  form,
}: {
  property: Property;
  index?: number;
  view?: "page" | "table";
  form?: string;
}) {
  if (property === undefined) {
    return null;
  }
  switch (property.type as PropertyType) {
    case PropertyType.text:
      return (
        <InputPropField
          isRequired={property.required}
          name={`properties.${index}.value`}
          isDisabled={property.readonly}
          form={form}
        />
      );
    case PropertyType.number:
      return (
        // <InfoBlock label={property.name} orientation={orientation}>
        <InputPropField
          isRequired={property.required}
          name={`properties.${index}.value`}
          isDisabled={property.readonly}
          inputType="text"
          form={form}
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
          form={form}
        />
        // </InfoBlock>
      );
    case PropertyType.reference:
      return (
        // <InfoBlock label={property.name} orientation={orientation}>
        <DocumentReferenceField
          // isRequired={property.required}
          name={`properties.${index}.value`}
          isDisabled={property.readonly}
          limit={(property as DocumentReferenceProperty).limit}
          referenceGroup={
            (property as DocumentReferenceProperty).referenceGroup
          }
          view={view}
          form={form}
        />
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
            },
          )}
          isDisabled={property.readonly}
          form={form}
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
          form={form}
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
          form={form}
        />
        // </InfoBlock>
      );
    default:
      return null;
  }
}
