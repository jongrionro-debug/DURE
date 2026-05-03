import Link from "next/link";

import { BrandMark } from "@/components/ui/brand-mark";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-[#f6f1e8] px-6 py-16 text-[#111111]">
      <section className="flex w-full max-w-[42rem] flex-col items-center text-center">
        <p className="text-[15px] font-extrabold leading-[1.32] sm:text-[16px]">
          교육과 소통을 하나로,
          <br />
          맞춤형 운영 플랫폼
        </p>

        <h1 className="mt-5 flex items-center justify-center gap-3 whitespace-nowrap text-[58px] font-black leading-none tracking-[0] sm:gap-4 sm:text-[82px]">
          <BrandMark className="h-[66px] w-[72px] sm:h-[94px] sm:w-[102px]" priority />
          <span
            className="font-black"
            style={{
              fontFamily:
                "'Gemunu Libre', Impact, 'Arial Black', var(--font-ui), sans-serif",
            }}
          >
            DURE
          </span>
          <span className="text-[34px] font-black leading-none sm:text-[52px]">
            : 두레
          </span>
        </h1>

        <Link
          href="/login"
          className="mt-12 inline-flex h-[52px] min-w-[160px] items-center justify-center rounded-[18px] bg-[#ffe70a] px-9 text-[20px] font-extrabold leading-none text-black shadow-[0_3px_3px_rgba(0,0,0,0.35)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]"
        >
          시작하기
        </Link>
      </section>
    </main>
  );
}
