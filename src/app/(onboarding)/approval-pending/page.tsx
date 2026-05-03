import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import { LogoutButton } from "@/components/auth/logout-button";
import { BrandMark } from "@/components/ui/brand-mark";
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
    <main className="min-h-screen bg-[#f6f1e8] px-6 py-6 text-[#111111] sm:px-8 lg:px-10">
      <header className="mx-auto flex w-full max-w-[1360px] items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <BrandMark className="h-[43px] w-[47px] sm:h-[48px] sm:w-[52px]" priority />
          <div className="flex min-w-0 items-baseline gap-2 font-black text-[#111111]">
            <span className="text-[36px] leading-none sm:text-[40px]">DURE</span>
            <span className="text-[24px] leading-none sm:text-[28px]">: 두레</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2 pt-1 text-right">
          <p className="max-w-[48vw] truncate text-[15px] font-medium leading-6 text-black sm:max-w-none sm:text-[16px]">
            {email}{" "}
            <span className="font-semibold text-[#386665]">({roleLabel})</span>
          </p>
          <div className="w-[75px] border-t-2 border-[#555555]" />
          <LogoutButton email={email} variant="compact" />
        </div>
      </header>

      <div className="mx-auto mt-6 flex min-h-[calc(100vh-134px)] w-full max-w-[1360px] flex-col items-center rounded-[50px] bg-[#fffdf8] px-4 pb-12 pt-10 shadow-[0_0_10px_rgba(255,253,248,0.75)] sm:px-8 lg:pt-12">
        <div className="flex items-center justify-center gap-4">
          <Image
            src="/figma-assets/approval-footsteps.png"
            alt=""
            width={60}
            height={60}
            className="size-[50px] object-contain sm:size-[60px]"
            priority
          />
          <h1 className="text-[28px] font-extrabold leading-tight text-black sm:text-[35px]">
            두레<span className="text-[20px] sm:text-[25px]">로</span> 가는 길
          </h1>
        </div>

        <section className="mt-9 w-full max-w-[674px] rounded-[22px] border border-[#555555] bg-[#fffdf8] px-2 pb-3 pt-3 sm:rounded-[30px]">
          <h2 className="px-3 text-[20px] font-bold leading-8 text-black sm:text-[25px]">
            기존 기관으로 참여하기
          </h2>
          <div className="mt-2 border-t border-[#555555]/45 px-2 pt-5 sm:px-3">
            <div>
              <p className="text-[16px] font-semibold leading-7 text-black sm:text-[20px]">
                기관 이름
              </p>
              <div className="mt-3 flex min-h-[42px] items-center rounded-[12px] border border-[#f3eadd] bg-white px-3 sm:min-h-[60px] sm:rounded-[15px] sm:px-4">
                <p className="truncate text-[20px] font-bold leading-8 text-black sm:text-[25px]">
                  {organizationName}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[16px] font-semibold leading-7 text-black sm:text-[20px]">
                상태
              </p>
              <div className="mt-3 flex min-h-[42px] items-center rounded-[12px] border border-[#f3eadd] bg-white px-3 sm:min-h-[60px] sm:rounded-[15px] sm:px-4">
                <p className="text-[20px] font-bold leading-8 text-black sm:text-[25px]">
                  승인 대기 중..
                </p>
              </div>
            </div>

            <Link
              href="/approval-pending"
              className="mt-6 flex min-h-[46px] w-full items-center justify-center rounded-full bg-[#ffec1d] px-5 text-[18px] font-extrabold leading-none text-black shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition hover:bg-[#fee500] focus:outline-none focus:ring-2 focus:ring-[#c5a100] focus:ring-offset-2 focus:ring-offset-[#fffdf8] sm:min-h-[60px] sm:text-[25px]"
            >
              상태 새로 보기
            </Link>
          </div>
        </section>

        <p className="mt-3 w-full max-w-[674px] text-[18px] font-medium leading-8 text-[#c5a100] sm:text-[25px]">
          해당 기관 운영자가 승인할 때까지 잠시만 기다려주세요.
        </p>
      </div>
    </main>
  );
}
