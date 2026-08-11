import type { ReactNode } from "react";
import { PageNavigation } from "./PageNavigation";

type PageHeaderProps = {
  title: string;
  aside?: ReactNode;
};

export function PageHeader({ title, aside }: PageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 border-b border-neutral-800 pb-4 sm:flex-row sm:items-end sm:justify-between sm:pb-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-400">
          Valetudo
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white sm:mt-2 sm:text-4xl">
          {title}
        </h1>
        <PageNavigation />
      </div>
      {aside}
    </header>
  );
}
