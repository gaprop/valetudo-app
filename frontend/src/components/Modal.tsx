import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";

type ModalProps = {
  title: string;
  closeLabel: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
};

export function Modal({
  title,
  closeLabel,
  children,
  footer,
  onClose,
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        aria-labelledby={titleId}
        aria-modal="true"
        className="grid max-h-[85vh] w-full max-w-lg gap-0 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 shadow-2xl shadow-black"
        role="dialog"
      >
        <header className="flex items-start justify-between gap-3 border-b border-neutral-800 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-white">
            {title}
          </h2>
          <IconButton label={closeLabel} title="Close" onClick={onClose}>
            <X aria-hidden="true" size={16} strokeWidth={2.25} />
          </IconButton>
        </header>

        <div className="overflow-y-auto p-5">{children}</div>

        {footer && (
          <footer className="border-t border-neutral-800 px-5 py-4">
            {footer}
          </footer>
        )}
      </section>
    </div>
  );
}
