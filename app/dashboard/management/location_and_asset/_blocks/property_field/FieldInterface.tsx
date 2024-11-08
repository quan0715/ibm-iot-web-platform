import { DocumentGroupType } from "@/domain/entities/Document";
import { InputHTMLAttributes } from "react";

interface BasicPropFieldProps {
  name: string;
  isHidden?: boolean;
  isDisabled?: boolean;
  isRequired?: boolean;
  textCss?: string;
  form?: string;
  view?: "table" | "page";
}

interface InputFieldProps extends BasicPropFieldProps {
  inputType?: InputHTMLAttributes<HTMLInputElement>["type"];
  placeholder?: string;
}

interface CheckBoxFieldProps extends BasicPropFieldProps {}

interface ReferenceFieldProps extends BasicPropFieldProps {
  referenceGroup: DocumentGroupType;
  limit?: boolean;
}

interface SelectionFieldProps extends BasicPropFieldProps {
  options: {
    key: string | number;
    value: string;
    component?: JSX.Element;
  }[];
}

interface DateTimeFieldProps extends BasicPropFieldProps {}

const focusSettings =
  "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-background focus-visible:shadow-lg";
const hoverSettings = "hover:bg-secondary";

export { focusSettings, hoverSettings };
export type {
  InputFieldProps,
  ReferenceFieldProps,
  CheckBoxFieldProps,
  SelectionFieldProps,
  DateTimeFieldProps,
};
