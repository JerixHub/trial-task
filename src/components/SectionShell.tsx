import type { ReactNode } from 'react';

interface Props {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  filters?: ReactNode;
  children: ReactNode;
}

export function SectionShell({ id, eyebrow, title, subtitle, filters, children }: Props) {
  return (
    <section id={id} className="scroll-mt-20 py-10 sm:py-14">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-accent">{eyebrow}</div>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-text sm:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        {filters && <div className="sm:self-end">{filters}</div>}
      </div>
      <div className="flex flex-col gap-6">{children}</div>
    </section>
  );
}
