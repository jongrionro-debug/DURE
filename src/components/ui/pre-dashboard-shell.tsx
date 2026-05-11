import Link from "next/link";
import type { ReactNode } from "react";

type PreDashboardShellProps = {
  children: ReactNode;
  navItems: Array<{
    href?: string;
    label: string;
    active?: boolean;
  }>;
  sidebarLabel: string;
  sidebarContent?: ReactNode;
  footer?: ReactNode;
};

export function PreDashboardShell({
  children,
  navItems,
  sidebarLabel,
  sidebarContent,
  footer,
}: PreDashboardShellProps) {
  return (
    <main className="flex min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <aside className="hidden w-[220px] shrink-0 flex-col bg-[var(--color-sidebar)] px-[10px] py-4 md:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-[30px] items-center justify-center rounded-[10px] bg-[var(--color-accent)] text-[13px] font-extrabold text-white">
            D
          </div>
          <div>
            <p className="text-[13px] font-extrabold leading-tight text-white">
              DURE
            </p>
            <p className="text-[10px] leading-tight text-[#8E9096]">
              운영 시스템
            </p>
          </div>
        </div>

        <span className="mx-2 mt-4 inline-flex w-fit rounded-full bg-[rgba(81,123,246,0.16)] px-3 py-1 text-[10px] font-bold text-white">
          {sidebarLabel}
        </span>

        <nav className="mt-5 flex flex-col gap-0.5" aria-label={sidebarLabel}>
          {navItems.map((item) => {
            const baseClassName =
              "flex items-center gap-3 rounded-[14px] px-3 py-[9px] text-[13px] font-medium transition-colors hover:bg-[rgba(142,144,150,0.12)]";
            const itemStyle = {
              background: item.active ? "#517BF6" : undefined,
              color: item.active ? "#ffffff" : "#8E9096",
            };

            if (!item.href) {
              return (
                <span key={item.label} className={baseClassName} style={itemStyle}>
                  <span className="w-5 text-center text-[15px]" aria-hidden="true">
                    ◈
                  </span>
                  {item.label}
                </span>
              );
            }

            return (
              <Link key={item.label} href={item.href} className={baseClassName} style={itemStyle}>
                <span className="w-5 text-center text-[15px]" aria-hidden="true">
                  ◈
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {sidebarContent ? (
          <div className="mt-5 border-t border-[rgba(142,144,150,0.2)] pt-4">
            {sidebarContent}
          </div>
        ) : null}

        {footer ? (
          <div className="mt-auto border-t border-[rgba(142,144,150,0.2)] pt-4">
            {footer}
          </div>
        ) : null}
      </aside>

      <section className="min-w-0 flex-1 px-5 py-5 sm:px-7 sm:py-6">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5">
          <header className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-[18px] md:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-[30px] shrink-0 items-center justify-center rounded-[10px] bg-[var(--color-accent)] text-[13px] font-extrabold text-white">
                  D
                </div>
                <div>
                  <p className="text-[13px] font-extrabold leading-tight text-[var(--color-text-primary)]">
                    DURE
                  </p>
                  <p className="text-[10px] leading-tight text-[var(--color-text-secondary)]">
                    운영 시스템
                  </p>
                </div>
              </div>
              <span className="inline-flex shrink-0 rounded-full bg-[var(--color-accent-surface)] px-3 py-1 text-[10px] font-bold text-[var(--color-accent)]">
                {sidebarLabel}
              </span>
            </div>
          </header>

          {children}
        </div>
      </section>
    </main>
  );
}
