"use client";

import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

import { getSupabaseBrowserClient } from "@/lib/auth/supabase-browser";

export function LogoutButton({
  email,
  tone = "surface",
  variant = "default",
}: {
  email?: string | null;
  tone?: "surface" | "accent";
  variant?: "default" | "compact";
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    setFeedback(null);

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      setFeedback(error.message);
      setIsPending(false);
      return;
    }

    startTransition(() => {
      router.replace("/login");
      router.refresh();
    });
  }

  const buttonClassName =
    tone === "accent"
      ? "bg-[var(--color-accent)] text-[var(--color-accent-ink)]"
      : "bg-[var(--color-surface)] text-[var(--color-text-primary)]";

  if (variant === "compact") {
    const compactClassName =
      tone === "accent"
        ? "rounded-[10px] bg-[var(--color-accent)] px-[14px] py-2 text-[13px] font-bold text-white"
        : "rounded-[10px] border border-[var(--color-border)] bg-white px-[14px] py-2 text-[13px] font-bold text-[var(--color-text-primary)]";

    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className={`${compactClassName} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {isPending ? "로그아웃 중..." : "로그아웃"}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-3 sm:items-end">
      <div className="text-sm leading-6 text-[var(--color-text-secondary)]">
        <p className="font-semibold text-[var(--color-text-primary)]">
          {email ?? "로그인된 사용자"}
        </p>
        <p>작업을 마쳤으면 안전하게 로그아웃할 수 있습니다.</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={isPending}
        className={`rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${buttonClassName}`}
      >
        {isPending ? "로그아웃 중..." : "로그아웃"}
      </button>
      {feedback ? (
        <p className="text-sm text-[var(--color-danger)]">{feedback}</p>
      ) : null}
    </div>
  );
}
