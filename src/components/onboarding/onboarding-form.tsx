"use client";

import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { LogoutButton } from "@/components/auth/logout-button";
import { BrandMark } from "@/components/ui/brand-mark";
import {
  type OnboardingActionState,
  acceptInviteOnboardingAction,
  createOrganizationOnboardingAction,
} from "@/server/actions/onboarding";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="h-[60px] w-full rounded-[30px] bg-[#ffec1d] text-[20px] font-extrabold text-black shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
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
      className="h-12 rounded-[24px] bg-[#ffec1d] px-6 text-[16px] font-extrabold text-black shadow-[0_3px_3px_rgba(0,0,0,0.2)] transition disabled:cursor-not-allowed disabled:opacity-70"
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
    <main className="min-h-screen bg-[#f6f1e8] px-4 pb-8 pt-3 text-[#111111] sm:px-8">
      <header className="mx-auto flex w-full max-w-[1360px] flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center">
          <BrandMark className="h-[48px] w-[52px] sm:h-[68px] sm:w-[74px]" priority />
          <h1 className="ml-2 flex items-baseline gap-2 whitespace-nowrap text-[42px] font-black leading-none sm:text-[60px]">
            <span
              style={{
                fontFamily:
                  "'Gemunu Libre', Impact, 'Arial Black', var(--font-ui), sans-serif",
              }}
            >
              DURE
            </span>
            <span className="text-[24px] font-black sm:text-[30px]">: 두레</span>
          </h1>
        </div>

        <div className="flex flex-col items-start text-[16px] leading-7 text-black sm:items-end sm:pt-4 sm:text-[20px]">
          <p>
            {email ?? "example1@gmail.com"}{" "}
            <span className="font-semibold text-[#386665]">(운영자)</span>
          </p>
          <div className="mt-1 w-[75px] border-t-2 border-[#555555]" />
          <LogoutButton email={null} tone="surface" variant="compact" />
        </div>
      </header>

      <section className="mx-auto mt-3 flex min-h-[calc(100vh-9rem)] w-full max-w-[1347px] flex-col rounded-[34px] bg-[#fffdf8] px-4 py-10 shadow-[0_0_16px_rgba(255,255,255,0.55)] sm:rounded-[50px] sm:px-8 lg:px-[clamp(5rem,14vw,12.5rem)]">
        <div className="flex items-center justify-center gap-4">
          <Image
            src="/figma-assets/organization-footsteps.png"
            alt=""
            width={60}
            height={60}
            className="size-[48px] sm:size-[60px]"
          />
          <h2 className="text-[28px] font-extrabold leading-none sm:text-[35px]">
            두레<span className="text-[22px] sm:text-[25px]">에서의</span> 첫 걸음
          </h2>
        </div>

        <div className="mx-auto mt-12 flex w-full max-w-[947px] flex-col gap-8">
          <div className="rounded-[30px] border border-[#555555] bg-[#fffdf8] px-3 py-3 shadow-[0_3px_3px_rgba(0,0,0,0.18)]">
            <div className="flex h-8 items-center gap-2 border-b border-[#bdb8af] px-1 pb-3">
              <Image
                src="/figma-assets/organization-chevron-down.png"
                alt=""
                width={35}
                height={35}
                className="size-[28px]"
              />
              <p className="text-[20px] font-extrabold sm:text-[25px]">
                새 기관 만들기
              </p>
            </div>

            <form action={formAction} className="mt-6 flex flex-col gap-6">
              <label className="flex flex-col gap-3">
                <span className="text-[18px] font-semibold text-black sm:text-[20px]">
                  기관 이름
                </span>
                <input
                  type="text"
                  name="organizationName"
                  className="h-[60px] rounded-[15px] border border-[#f3eadd] bg-white px-4 text-[20px] font-semibold text-black outline-none transition focus:border-[#555555] focus:ring-2 focus:ring-[#ffec1d] sm:text-[25px]"
                  placeholder="예시 기관"
                  required
                />
                {state.fieldErrors?.organizationName ? (
                  <p className="text-sm text-[var(--color-danger)]">
                    {state.fieldErrors.organizationName.join(" ")}
                  </p>
                ) : null}
              </label>

              <label className="flex flex-col gap-3">
                <span className="text-[18px] font-semibold text-black sm:text-[20px]">
                  첫 번째 마을 이름
                </span>
                <input
                  type="text"
                  name="firstVillageName"
                  className="h-[60px] rounded-[15px] border border-[#f3eadd] bg-white px-4 text-[20px] font-semibold text-black outline-none transition focus:border-[#555555] focus:ring-2 focus:ring-[#ffec1d] sm:text-[25px]"
                  placeholder="예시 마을"
                  required
                />
                {state.fieldErrors?.firstVillageName ? (
                  <p className="text-sm text-[var(--color-danger)]">
                    {state.fieldErrors.firstVillageName.join(" ")}
                  </p>
                ) : null}
              </label>

              {state.message ? (
                <p className="rounded-[18px] bg-[#f6f1e8] px-4 py-3 text-sm leading-6 text-[#555555]">
                  {state.message}
                </p>
              ) : null}

              <SubmitButton />
            </form>
          </div>

          <details className="group rounded-[30px] border border-[#555555] bg-[#fffdf8] px-4 py-3">
            <summary className="flex h-11 cursor-pointer list-none items-center gap-3 text-[20px] font-extrabold marker:content-none sm:text-[25px]">
              <Image
                src="/figma-assets/organization-chevron-right.png"
                alt=""
                width={35}
                height={35}
                className="size-[28px] transition group-open:rotate-90"
              />
              기존 기관으로 참여하기
            </summary>

            <form action={inviteAction} className="mt-5 flex flex-col gap-4 border-t border-[#bdb8af] pt-5">
              <label className="flex flex-col gap-3">
                <span className="text-[18px] font-semibold text-black">
                  초대 토큰
                </span>
                <input
                  type="text"
                  name="inviteToken"
                  className="h-[56px] rounded-[15px] border border-[#f3eadd] bg-white px-4 text-[18px] font-semibold text-black outline-none transition focus:border-[#555555] focus:ring-2 focus:ring-[#ffec1d]"
                  placeholder="c27da9ba-dc9a-494b-8742-8ad3e42671d3"
                  required
                />
                {inviteState.fieldErrors?.inviteToken ? (
                  <p className="text-sm text-[var(--color-danger)]">
                    {inviteState.fieldErrors.inviteToken.join(" ")}
                  </p>
                ) : null}
              </label>

              {inviteState.message ? (
                <p className="rounded-[18px] bg-[#f6f1e8] px-4 py-3 text-sm leading-6 text-[#555555]">
                  {inviteState.message}
                </p>
              ) : null}

              <div>
                <InviteSubmitButton />
              </div>
            </form>
          </details>
        </div>
      </section>
    </main>
  );
}
