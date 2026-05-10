import Link from "next/link";
import type { ReactNode } from "react";

import { LogoutButton } from "@/components/auth/logout-button";

type AppShellProps = {
  role: "ops" | "teacher";
  email?: string | null;
  children: ReactNode;
};

const opsNav = [
  { href: "/dashboard", label: "대시보드", icon: "◈" },
  { href: "/records", label: "서류·기록", icon: "◎" },
  { href: "/settings", label: "운영 설정", icon: "◷" },
  { href: "/users", label: "사용자·권한", icon: "◑" },
];

const teacherNav = [{ href: "/sessions", label: "내 수업 일정", icon: "◈" }];

export function AppShell({ role, email, children }: AppShellProps) {
  const nav = role === "teacher" ? teacherNav : opsNav;
  const roleLabel = role === "teacher" ? "강사 영역" : "운영자 영역";

  return (
    <div className="flex min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <aside className="flex w-[220px] shrink-0 flex-col bg-[var(--color-sidebar)] px-[10px] py-4">
        <div className="flex items-center gap-3 px-2">
          <div className="flex size-[30px] items-center justify-center rounded-[10px] bg-[var(--color-accent)] text-[13px] font-extrabold text-white">
            D
          </div>
          <div>
            <p className="text-[13px] font-extrabold leading-tight text-white">
              DURE
            </p>
            <p className="text-[10px] leading-tight text-[var(--color-sidebar-ink)]">
              운영 시스템
            </p>
          </div>
        </div>

        <span className="mx-2 mt-4 inline-flex w-fit rounded-full bg-[rgba(81,123,246,0.16)] px-3 py-1 text-[10px] font-bold text-white">
          {roleLabel}
        </span>

        <nav className="mt-5 flex flex-col gap-0.5" aria-label="주요 메뉴">
          {nav.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className="flex items-center gap-3 rounded-[14px] px-3 py-[9px] text-[13px] font-medium text-[var(--color-sidebar-ink)] transition-colors hover:bg-[rgba(142,144,150,0.12)]"
            >
              <span className="w-5 text-center text-[18px]" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto border-t border-[rgba(142,144,150,0.2)] pt-4">
          <div className="flex items-center gap-2 px-2">
            <div className="size-[26px] rounded-full bg-[rgba(255,255,255,0.16)]" />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold text-white">
                {role === "teacher" ? "강사" : "운영자"}
              </p>
              <p className="truncate text-[10px] text-[var(--color-sidebar-ink)]">
                {email ?? "로그인 사용자"}
              </p>
            </div>
          </div>
          <div className="mt-3 px-2">
            <LogoutButton email={email} tone="accent" variant="compact" />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-7 py-6">{children}</main>
    </div>
  );
}
