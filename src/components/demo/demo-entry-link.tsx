import Link from "next/link";

import { getDemoEnv } from "@/lib/env";

export function DemoEntryLink() {
  const demoEnv = getDemoEnv();

  if (!demoEnv.enabled) {
    return null;
  }

  return (
    <Link
      href="/login?demo=1"
      className="mt-4 inline-flex h-12 min-w-[190px] items-center justify-center rounded-[18px] border border-[#111111] bg-[#fffdf8] px-5 text-[17px] font-extrabold text-black transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]"
    >
      데모로 체험하기
    </Link>
  );
}
