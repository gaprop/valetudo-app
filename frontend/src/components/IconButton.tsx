import type { ReactNode } from "react";

type IconButtonProps = {
  label: string;
  title?: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

export function IconButton({
  label,
  title,
  disabled,
  onClick,
  children,
}: IconButtonProps) {
  return (
    <button
      className="flex h-9 w-9 items-center justify-center rounded border border-neutral-700 bg-neutral-950 text-neutral-300 transition hover:border-primary-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      type="button"
      aria-label={label}
      title={title || label}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
