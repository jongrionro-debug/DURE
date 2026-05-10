import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { LogoutButton } from "@/components/auth/logout-button";
import { getDb } from "@/lib/db/client";
import { organizationMemberships, organizations } from "@/lib/db/schema";
import { getServerAuthState } from "@/lib/auth/supabase-server";

const roleLabels = {
  platform_admin: "플랫폼 관리자",
  organization_admin: "운영자",
  teacher: "강사",
} as const;

async function getPendingMembershipDisplay(userId: string) {
  const db = getDb();
  const [membership] = await db
    .select({
      organizationName: organizations.name,
      role: organizationMemberships.role,
    })
    .from(organizationMemberships)
    .innerJoin(
      organizations,
      eq(organizationMemberships.organizationId, organizations.id),
    )
    .where(eq(organizationMemberships.userId, userId))
    .limit(1);

  return membership ?? null;
}

export default async function ApprovalPendingPage() {
  const authState = await getServerAuthState();

  if (!authState.isAuthenticated) {
    redirect("/login");
  }

  if (!authState.hasMembership) {
    redirect("/organization");
  }

  if (authState.membershipApproved) {
    redirect("/dashboard");
  }

  const pendingMembership = authState.user
    ? await getPendingMembershipDisplay(authState.user.id)
    : null;
  const organizationName = pendingMembership?.organizationName ?? "소속 기관";
  const roleLabel = pendingMembership ? roleLabels[pendingMembership.role] : "강사";
  const email = authState.user?.email ?? "로그인된 사용자";

  return (
    <main className="min-h-screen bg-[var(--color-background)] px-5 py-6 text-[var(--color-text-primary)] sm:px-7">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5">
        <header className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-[18px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <p className="max-w-full truncate text-[12px] font-bold text-[var(--color-text-primary)]">
                {email}
              </p>
              <span className="inline-flex rounded-full bg-[var(--color-accent-surface)] px-3 py-1 text-[10px] font-bold text-[var(--color-accent)]">
                {roleLabel}
              </span>
              <LogoutButton email={email} tone="accent" variant="compact" />
            </div>
          </div>
        </header>

        <section className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-[18px]">
          <p className="text-[11px] font-bold text-[var(--color-warning)]">
            승인 대기
          </p>
          <div className="mt-2 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
            <div>
              <h1 className="text-[22px] font-extrabold leading-tight text-[var(--color-text-primary)]">
                기관 운영자의 승인을 기다리고 있습니다.
              </h1>
              <p className="mt-2 max-w-xl text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
                승인이 완료되면 같은 계정으로 로그인 후 대시보드와 수업 일정 화면에
                접근할 수 있습니다.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/approval-pending"
                  className="rounded-[10px] bg-[var(--color-accent)] px-[14px] py-2 text-[13px] font-bold text-white"
                >
                  상태 새로 보기
                </Link>
                <Link
                  href="/organization"
                  className="rounded-[10px] border border-[var(--color-border)] bg-white px-[14px] py-2 text-[13px] font-bold text-[var(--color-text-primary)]"
                >
                  온보딩으로 돌아가기
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[10px] bg-[var(--color-surface-alt)] px-4 py-3">
                <p className="text-[11px] font-bold text-[var(--color-text-secondary)]">
                  기관
                </p>
                <p className="mt-1 truncate text-[16px] font-bold text-[var(--color-text-primary)]">
                  {organizationName}
                </p>
              </div>
              <div className="rounded-[10px] bg-[var(--color-surface-alt)] px-4 py-3">
                <p className="text-[11px] font-bold text-[var(--color-text-secondary)]">
                  상태
                </p>
                <p className="mt-1 text-[16px] font-bold text-[var(--color-text-primary)]">
                  승인 대기 중
                </p>
              </div>
              <p className="rounded-[10px] border border-[var(--color-border)] bg-white px-4 py-3 text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
                해당 기관 운영자가 승인할 때까지 잠시만 기다려주세요.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
