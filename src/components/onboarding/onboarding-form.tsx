"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { LogoutButton } from "@/components/auth/logout-button";
import { PreDashboardShell } from "@/components/ui/pre-dashboard-shell";
import {
  type OnboardingActionState,
  acceptInviteOnboardingAction,
  createOrganizationOnboardingAction,
} from "@/server/actions/onboarding";

const panelClassName =
  "rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-[18px]";
const inputClassName =
  "h-9 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-[13px] font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[rgba(81,123,246,0.15)]";
const primaryButtonClassName =
  "rounded-[10px] bg-[var(--color-accent)] px-[14px] py-2 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButtonClassName =
  "rounded-[10px] border border-[var(--color-border)] bg-white px-[14px] py-2 text-[13px] font-bold text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-50";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full ${primaryButtonClassName}`}
    >
      {pending ? "기관 생성 중..." : "기관 만들기"}
    </button>
  );
}

function InviteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={secondaryButtonClassName}
    >
      {pending ? "초대 확인 중..." : "기존 기관 참여"}
    </button>
  );
}

const initialState: OnboardingActionState = {};

export function OnboardingForm({ email }: { email?: string | null }) {
  const [state, formAction] = useActionState<OnboardingActionState, FormData>(
    createOrganizationOnboardingAction,
    initialState,
  );
  const [inviteState, inviteAction] = useActionState<
    OnboardingActionState,
    FormData
  >(
    acceptInviteOnboardingAction,
    initialState,
  );

  return (
    <PreDashboardShell
      sidebarLabel="운영자 온보딩"
      navItems={[
        { label: "기관 생성", active: true },
        { label: "첫 마을 등록" },
        { label: "대시보드 진입" },
      ]}
      sidebarContent={
        <div className="px-2">
          <p className="text-[11px] font-bold leading-5 text-white">
            온보딩 단계
          </p>
          <div className="mt-3 grid gap-2">
            {["기관 생성", "첫 마을 등록", "대시보드 진입"].map(
              (step, index) => (
                <div
                  key={step}
                  className="flex items-center gap-2 text-[11px] font-medium text-[var(--color-sidebar-ink)]"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-[rgba(255,255,255,0.12)] text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                  {step}
                </div>
              ),
            )}
          </div>
        </div>
      }
      footer={
        <div className="px-2">
          <div className="flex items-center gap-2">
            <div className="size-[26px] rounded-full bg-[rgba(255,255,255,0.16)]" />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold text-white">
                로그인 사용자
              </p>
              <p className="truncate text-[10px] text-[var(--color-sidebar-ink)]">
                {email ?? "이메일 없음"}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <LogoutButton email={null} tone="accent" variant="compact" />
          </div>
        </div>
      }
    >
      <header className={panelClassName}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-bold text-[var(--color-text-secondary)]">
              운영자 온보딩
            </p>
            <h1 className="mt-2 text-[22px] font-extrabold leading-tight text-[var(--color-text-primary)]">
              운영 시작 설정
            </h1>
            <p className="mt-2 max-w-xl text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
              기관과 첫 마을을 등록하면 대시보드에서 수업 일정을 만들 수 있습니다.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end md:hidden">
            <p className="max-w-full truncate text-[12px] font-bold text-[var(--color-text-primary)]">
              {email ?? "로그인 사용자"}
            </p>
            <LogoutButton email={null} tone="accent" variant="compact" />
          </div>
        </div>
      </header>

        <section className={panelClassName}>
          <div className="mt-2 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
            <div>
              <p className="text-[11px] font-bold text-[var(--color-text-secondary)]">
                온보딩 단계
              </p>
              <h2 className="mt-2 text-[16px] font-bold text-[var(--color-text-primary)]">
                대시보드 진입 전 필요한 기본값
              </h2>
              <p className="mt-2 max-w-xl text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
                기관은 사용자와 권한의 기준이 되고, 첫 마을은 수업 일정과 참여자 명단의 시작점이 됩니다.
              </p>
              <div className="mt-5 grid gap-3">
                {["기관 생성", "첫 마을 등록", "대시보드 진입"].map(
                  (step, index) => (
                    <div
                      key={step}
                      className="flex items-center gap-3 rounded-[10px] bg-[var(--color-surface-alt)] px-3 py-2"
                    >
                      <span className="flex size-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[var(--color-text-secondary)]">
                        {index + 1}
                      </span>
                      <span className="text-[13px] font-bold text-[var(--color-text-primary)]">
                        {step}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[14px] border border-[var(--color-border)] bg-white px-4 py-4">
                <div>
                  <p className="text-[16px] font-bold text-[var(--color-text-primary)]">
                    새 기관 만들기
                  </p>
                  <p className="mt-1 text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
                    운영 콘솔에서 사용할 기관과 기본 마을을 먼저 만듭니다.
                  </p>
                </div>

                <form action={formAction} className="mt-4 grid gap-3">
                  <label className="grid gap-1.5 text-[12px] font-bold text-[var(--color-text-primary)]">
                    기관 이름
                    <input
                      type="text"
                      name="organizationName"
                      className={inputClassName}
                      placeholder="예: 다도리인 교육 센터"
                      required
                    />
                    {state.fieldErrors?.organizationName ? (
                      <p className="text-[12px] font-medium text-[var(--color-danger)]">
                        {state.fieldErrors.organizationName.join(" ")}
                      </p>
                    ) : null}
                  </label>

                  <label className="grid gap-1.5 text-[12px] font-bold text-[var(--color-text-primary)]">
                    첫 번째 마을 이름
                    <input
                      type="text"
                      name="firstVillageName"
                      className={inputClassName}
                      placeholder="예: 다도리"
                      required
                    />
                    {state.fieldErrors?.firstVillageName ? (
                      <p className="text-[12px] font-medium text-[var(--color-danger)]">
                        {state.fieldErrors.firstVillageName.join(" ")}
                      </p>
                    ) : null}
                  </label>

                  {state.message ? (
                    <p className="rounded-[10px] bg-[var(--color-surface-alt)] px-3 py-2 text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
                      {state.message}
                    </p>
                  ) : null}

                  <SubmitButton />
                </form>
              </div>

              <details className="group rounded-[14px] border border-[var(--color-border)] bg-white px-4 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[16px] font-bold text-[var(--color-text-primary)] marker:content-none">
                  기존 기관 참여
                  <span className="text-[13px] text-[var(--color-text-secondary)] transition group-open:rotate-90">
                    ›
                  </span>
                </summary>

                <form
                  action={inviteAction}
                  className="mt-4 grid gap-3 border-t border-[var(--color-border)] pt-4"
                >
                  <label className="grid gap-1.5 text-[12px] font-bold text-[var(--color-text-primary)]">
                    초대 토큰
                    <input
                      type="text"
                      name="inviteToken"
                      className={inputClassName}
                      placeholder="초대 링크 또는 토큰"
                      required
                    />
                    {inviteState.fieldErrors?.inviteToken ? (
                      <p className="text-[12px] font-medium text-[var(--color-danger)]">
                        {inviteState.fieldErrors.inviteToken.join(" ")}
                      </p>
                    ) : null}
                  </label>

                  {inviteState.message ? (
                    <p className="rounded-[10px] bg-[var(--color-surface-alt)] px-3 py-2 text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
                      {inviteState.message}
                    </p>
                  ) : null}

                  <div>
                    <InviteSubmitButton />
                  </div>
                </form>
              </details>
            </div>
          </div>
        </section>
    </PreDashboardShell>
  );
}
