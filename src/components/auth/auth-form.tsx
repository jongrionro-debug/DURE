"use client";

import Image from "next/image";
import { startTransition, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { BrandMark } from "@/components/ui/brand-mark";
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
    <main className="flex min-h-screen flex-1 items-center justify-center bg-[#f6f1e8] px-4 py-8 text-[#111111]">
      <section className="flex min-h-[min(88vh,940px)] w-full max-w-[1347px] flex-col rounded-[34px] bg-[#fffdf8] px-5 py-12 shadow-[0_0_16px_rgba(255,255,255,0.6)] sm:rounded-[50px] sm:px-10 lg:px-[clamp(5rem,14vw,12.5rem)]">
        <header className="flex items-center justify-center gap-4">
          <BrandMark className="h-[48px] w-[52px]" priority />

          <h1 className="flex items-baseline gap-2 whitespace-nowrap text-[42px] font-black leading-none">
            <span
              style={{
                fontFamily:
                  "'Gemunu Libre', Impact, 'Arial Black', var(--font-ui), sans-serif",
              }}
            >
              DURE
            </span>
            <span className="text-[24px] font-black">: 두레</span>
          </h1>
        </header>

        <form
          className="mx-auto mt-20 flex w-full max-w-[947px] flex-col"
          onSubmit={handleSubmit}
          noValidate
        >
          <label className="flex flex-col">
            <span
              className="text-[26px] font-normal leading-none text-black"
              style={{
                fontFamily:
                  "'Gemunu Libre', var(--font-ui), 'Noto Sans KR', sans-serif",
              }}
            >
              E-mail
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-4 h-16 rounded-[30px] border border-[#555555] bg-[#fffdf8] px-7 text-[20px] text-black outline-none transition focus:border-black focus:ring-2 focus:ring-[#ffec1d]"
              placeholder="example1"
              autoComplete="email"
              required
            />
            <span className="mt-2 min-h-6 text-[16px] leading-6 text-red-600">
              {hasEmailError ? "dure@example.com의 형식을 지켜주세요" : ""}
            </span>
          </label>

          <label className="mt-5 flex flex-col">
            <span
              className="text-[26px] font-normal leading-none text-black"
              style={{
                fontFamily:
                  "'Gemunu Libre', var(--font-ui), 'Noto Sans KR', sans-serif",
              }}
            >
              Password
            </span>
            <span className="relative mt-4">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-16 w-full rounded-[30px] border border-[#555555] bg-[#fffdf8] px-7 pr-20 text-[20px] text-black outline-none transition focus:border-black focus:ring-2 focus:ring-[#ffec1d]"
                placeholder="******"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-6 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                aria-label={
                  showPassword ? "비밀번호 숨기기" : "비밀번호 보이기"
                }
              >
                <Image
                  src="/figma-assets/login-password-eye.png"
                  alt=""
                  width={39}
                  height={39}
                  className="size-[32px]"
                />
              </button>
            </span>
            <span className="mt-2 min-h-6 text-[16px] leading-6 text-red-600">
              {hasPasswordError
                ? "알파벳 소문자, 숫자, 특수문자를 모두 포함해주세요."
                : ""}
            </span>
          </label>

          {mode === "login" ? (
            <label className="mt-5 flex w-fit cursor-pointer items-center gap-2 text-[16px] font-medium text-[#555555]">
              <input
                type="checkbox"
                checked={rememberLogin}
                onChange={(event) => setRememberLogin(event.target.checked)}
                className="sr-only"
              />
              <span className="relative flex size-8 items-center justify-center rounded-full border border-transparent">
                {rememberLogin ? (
                  <Image
                    src="/figma-assets/login-remember-check.png"
                    alt=""
                    width={32}
                    height={32}
                    className="size-8"
                  />
                ) : (
                  <span className="size-6 rounded-full border-2 border-[#555555]" />
                )}
              </span>
              <span>로그인 상태 유지</span>
            </label>
          ) : null}

          {feedback ? (
            <p className="mt-5 rounded-[18px] bg-[#f6f1e8] px-5 py-3 text-[15px] leading-6 text-[#555555]">
              {feedback}
            </p>
          ) : null}

          {isDemoLogin ? (
            <p className="mt-5 rounded-[18px] bg-[#fff7b8] px-5 py-3 text-[15px] leading-6 text-[#555555]">
              데모 계정으로 제품 흐름을 바로 확인할 수 있습니다.
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isPending}
            className="mt-8 h-16 rounded-[30px] bg-[#ffec1d] text-[20px] font-extrabold text-black shadow-[0_4px_4px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? "진행 중..." : copy.submitLabel}
          </button>

          <nav className="mt-6 flex items-center justify-center gap-2 text-center text-[16px] font-medium text-[#555555]">
            <button type="button" className="transition hover:text-black">
              {copy.passwordHelp}
            </button>
            <span>|</span>
            <button type="button" className="transition hover:text-black">
              {copy.accountHelp}
            </button>
            <span>|</span>
            <a href={alternateHref} className="transition hover:text-black">
              {alternateLabel}
            </a>
          </nav>
        </form>
      </section>
    </main>
  );
}
