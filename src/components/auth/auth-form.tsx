"use client";

import { startTransition, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PreDashboardShell } from "@/components/ui/pre-dashboard-shell";
import { getSupabaseBrowserClient } from "@/lib/auth/supabase-browser";
import { getDemoEnv } from "@/lib/env";

type AuthFormProps = {
  mode: "login" | "signup";
};

const modeCopy = {
  login: {
    submitLabel: "로그인",
    passwordHelp: "비밀번호 찾기",
    accountHelp: "아이디 찾기",
  },
  signup: {
    submitLabel: "회원가입",
    passwordHelp: "비밀번호 찾기",
    accountHelp: "아이디 찾기",
  },
} as const;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern =
  /^(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const panelClassName =
  "rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-[18px]";
const inputClassName =
  "h-9 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-[13px] font-medium text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[rgba(81,123,246,0.15)]";
const primaryButtonClassName =
  "rounded-[10px] bg-[var(--color-accent)] px-[14px] py-2 text-[13px] font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const secondaryLinkClassName =
  "rounded-[10px] border border-[var(--color-border)] bg-white px-[14px] py-2 text-[13px] font-bold text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-accent)]";

export function AuthForm({ mode }: AuthFormProps) {
  const copy = modeCopy[mode];
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoEnv = getDemoEnv();
  const isDemoLogin =
    mode === "login" && demoEnv.enabled && searchParams.get("demo") === "1";
  const [email, setEmail] = useState(isDemoLogin ? demoEnv.email ?? "" : "");
  const [password, setPassword] = useState("");
  const [rememberLogin, setRememberLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const hasEmailError = email.length > 0 && !emailPattern.test(email);
  const hasPasswordError =
    mode === "signup" && password.length > 0 && !passwordPattern.test(password);
  const alternateHref = mode === "login" ? "/signup" : "/login";
  const alternateLabel = mode === "login" ? "회원가입" : "로그인";
  const title = mode === "login" ? "로그인" : "회원가입";
  const description =
    mode === "login"
      ? "대시보드와 같은 운영 콘솔 환경으로 진입합니다."
      : "계정을 만든 뒤 기관 생성 온보딩으로 이어집니다.";
  const navItems = [
    { href: "/login", label: "로그인", active: mode === "login" },
    { href: "/signup", label: "회원가입", active: mode === "signup" },
  ];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || !password) {
      setFeedback("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    if (hasEmailError || hasPasswordError) {
      setFeedback("입력 형식을 확인해주세요.");
      return;
    }

    setIsPending(true);
    setFeedback(null);

    const supabase = getSupabaseBrowserClient();

    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (result.error) {
      setFeedback(result.error.message);
      setIsPending(false);
      return;
    }

    setFeedback(
      mode === "signup"
        ? "가입이 완료되었습니다. 바로 기관 생성 온보딩으로 이동합니다."
        : "로그인에 성공했습니다. 온보딩 또는 대시보드로 이동합니다.",
    );

    startTransition(() => {
      router.replace("/organization");
      router.refresh();
    });

    setIsPending(false);
  }

  return (
    <PreDashboardShell
      sidebarLabel="계정 접근"
      navItems={navItems}
      sidebarContent={
        <div className="px-2">
          <p className="text-[11px] font-bold leading-5 text-white">
            운영 콘솔 진입
          </p>
          <p className="mt-1 text-[11px] font-medium leading-5 text-[var(--color-sidebar-ink)]">
            계정 확인 후 온보딩 또는 대시보드로 이동합니다.
          </p>
        </div>
      }
    >
      <section className={panelClassName}>
        <div className="mx-auto w-full max-w-[360px]">

        <form
            className="rounded-[14px] border border-[var(--color-border)] bg-white px-4 py-4"
          onSubmit={handleSubmit}
          noValidate
        >
            <div>
              <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
                {title}
              </h2>
              <p className="mt-1 text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
                이메일과 비밀번호를 입력해주세요.
              </p>
            </div>

            <label className="mt-4 grid gap-1.5 text-[12px] font-bold text-[var(--color-text-primary)]">
              E-mail
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
                className={inputClassName}
                placeholder="dure@example.com"
              autoComplete="email"
              required
            />
              <span className="min-h-5 text-[12px] font-medium leading-5 text-[var(--color-danger)]">
              {hasEmailError ? "dure@example.com의 형식을 지켜주세요" : ""}
            </span>
          </label>

            <label className="mt-1 grid gap-1.5 text-[12px] font-bold text-[var(--color-text-primary)]">
              Password
              <span className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                  className={`${inputClassName} w-full pr-14`}
                  placeholder="비밀번호"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 flex h-7 -translate-y-1/2 items-center rounded-[8px] px-2 text-[11px] font-bold text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-alt)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                aria-label={
                  showPassword ? "비밀번호 숨기기" : "비밀번호 보이기"
                }
              >
                  {showPassword ? "숨김" : "보기"}
              </button>
            </span>
              <span className="min-h-5 text-[12px] font-medium leading-5 text-[var(--color-danger)]">
              {hasPasswordError
                ? "알파벳 소문자, 숫자, 특수문자를 모두 포함해주세요."
                : ""}
            </span>
          </label>

          {mode === "login" ? (
              <label className="mt-2 flex w-fit cursor-pointer items-center gap-2 text-[13px] font-medium text-[var(--color-text-secondary)]">
              <input
                type="checkbox"
                checked={rememberLogin}
                onChange={(event) => setRememberLogin(event.target.checked)}
                className="sr-only"
              />
                <span
                  className={`flex size-5 items-center justify-center rounded-[6px] border text-[12px] font-extrabold ${
                    rememberLogin
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                      : "border-[var(--color-border)] bg-white text-transparent"
                  }`}
                  aria-hidden="true"
                >
                {rememberLogin ? (
                    "✓"
                  ) : null}
              </span>
              <span>로그인 상태 유지</span>
            </label>
          ) : null}

          {feedback ? (
              <p className="mt-3 rounded-[10px] bg-[var(--color-surface-alt)] px-3 py-2 text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
              {feedback}
            </p>
          ) : null}

          {isDemoLogin ? (
              <p className="mt-3 rounded-[10px] bg-[var(--color-accent-surface)] px-3 py-2 text-[13px] font-medium leading-6 text-[var(--color-accent)]">
              데모 계정으로 제품 흐름을 바로 확인할 수 있습니다.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
              className={`mt-4 w-full ${primaryButtonClassName}`}
          >
            {isPending ? "진행 중..." : copy.submitLabel}
          </button>

            <nav className="mt-4 flex flex-wrap items-center justify-center gap-2 text-center">
              <button type="button" className={secondaryLinkClassName}>
              {copy.passwordHelp}
            </button>
              <button type="button" className={secondaryLinkClassName}>
              {copy.accountHelp}
            </button>
              <a href={alternateHref} className={secondaryLinkClassName}>
              {alternateLabel}
            </a>
          </nav>
        </form>
        </div>
      </section>
    </PreDashboardShell>
  );
}
