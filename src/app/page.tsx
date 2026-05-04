import Link from "next/link";

import { DemoEntryLink } from "@/components/demo/demo-entry-link";
import { BrandMark } from "@/components/ui/brand-mark";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-[#f6f1e8] px-6 py-12 text-[#111111]">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(756px,78vw)] w-[min(742px,78vw)] -translate-x-1/2 -translate-y-[51%] rounded-full bg-[#f8f4ed]" />

      <section className="relative z-10 flex w-full max-w-[48rem] flex-col items-center text-center">
        <p className="text-[18px] font-extrabold leading-[30px] sm:text-[23px]">
          교육과 소통을 하나로,
          <br />
          맞춤형 운영 플랫폼
        </p>

        <h1 className="mt-5 flex items-baseline justify-center gap-2 whitespace-nowrap text-[72px] font-black leading-none tracking-[0] sm:text-[128px]">
          <span
            className="font-black"
            style={{
              fontFamily:
                "'Gemunu Libre', Impact, 'Arial Black', var(--font-ui), sans-serif",
            }}
          >
            DURE
          </span>
          <span className="text-[36px] font-black leading-none sm:text-[60px]">
            :두레
          </span>
        </h1>

        <BrandMark className="mt-12 h-[150px] w-[188px] sm:mt-[55px] sm:h-[210px] sm:w-[263px]" priority />

        <Link
          href="/login"
          className="mt-[35px] inline-flex h-[62px] w-[190px] items-center justify-center rounded-[22px] bg-[#ffe70a] text-[24px] font-extrabold leading-none text-black shadow-[0_4px_4px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111] sm:h-[73px] sm:w-[225px] sm:rounded-[24px] sm:text-[28px]"
        >
          시작하기
        </Link>

        <DemoEntryLink />
      </section>
    </main>
  );
}
