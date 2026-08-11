import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

type FieldSize = "default" | "compact";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  fieldSize?: FieldSize;
  labelClassName?: string;
};

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: ReactNode;
  fieldSize?: FieldSize;
  labelClassName?: string;
  children: ReactNode;
};

function inputClassName(fieldSize: FieldSize, className = "") {
  const sizeClass = fieldSize === "compact" ? "py-2" : "";
  return `input ${sizeClass} ${className}`.trim();
}

function labelClassName(className = "") {
  return `grid min-w-0 gap-2 text-sm font-medium text-neutral-300 ${className}`.trim();
}

export function TextField({
  label,
  fieldSize = "default",
  labelClassName: extraLabelClassName = "",
  className = "",
  ...props
}: TextFieldProps) {
  return (
    <label className={labelClassName(extraLabelClassName)}>
      {label}
      <input className={inputClassName(fieldSize, className)} {...props} />
    </label>
  );
}

export function NumberField(props: TextFieldProps) {
  return <TextField type="number" {...props} />;
}

export function SelectField({
  label,
  fieldSize = "default",
  labelClassName: extraLabelClassName = "",
  className = "",
  children,
  ...props
}: SelectFieldProps) {
  return (
    <label className={labelClassName(extraLabelClassName)}>
      {label}
      <select className={inputClassName(fieldSize, className)} {...props}>
        {children}
      </select>
    </label>
  );
}
