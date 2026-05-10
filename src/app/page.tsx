import Link from "next/link";

import { DemoEntryLink } from "@/components/demo/demo-entry-link";
import { BrandMark } from "@/components/ui/brand-mark";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-[var(--color-background)] px-6 py-12 text-[var(--color-text-primary)]">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(756px,78vw)] w-[min(742px,78vw)] -translate-x-1/2 -translate-y-[51%] rounded-full bg-[var(--color-surface)] opacity-70 shadow-2xl" />

      <section className="relative z-10 flex w-full max-w-[48rem] flex-col items-center text-center">
        <p className="text-[18px] font-extrabold leading-[30px] sm:text-[23px] text-[var(--color-text-secondary)]">
          교육과 소통을 하나로,
          <br />
          맞춤형 운영 플랫폼
        </p>

        <h1 className="mt-5 flex items-baseline justify-center gap-2 whitespace-nowrap text-[72px] font-black leading-none tracking-[0] sm:text-[128px]">
          <span className="font-black tracking-tight">
            DURE
          </span>
          <span className="text-[36px] font-black leading-none sm:text-[60px]">
            :두레
          </span>
        </h1>

        <BrandMark className="mt-12 h-[140px] w-[140px] sm:mt-[55px] sm:h-[200px] sm:w-[200px]" priority />

        <Link
          href="/login"
          className="mt-[35px] inline-flex h-[62px] w-[190px] items-center justify-center rounded-[16px] bg-[var(--color-accent)] text-[22px] font-extrabold leading-none text-white shadow-lg shadow-[var(--color-accent-surface)] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-accent)] sm:h-[73px] sm:w-[225px] sm:rounded-[20px] sm:text-[26px]"
        >
          시작하기
        </Link>

        <DemoEntryLink />
      </section>
    </main>
  );
}
