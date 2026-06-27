import type { ButtonHTMLAttributes, ReactNode } from "react";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function ActionButton({
  children,
  className = "",
  variant = "primary",
  ...props
}: ActionButtonProps) {
  const variantClass =
    variant === "primary"
      ? "bg-primary-600 text-white hover:bg-primary-500 disabled:bg-neutral-700"
      : "border border-neutral-700 text-neutral-300 hover:border-primary-500 hover:text-white disabled:opacity-50";

  return (
    <button
      className={`rounded px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
