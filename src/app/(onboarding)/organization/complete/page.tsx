import Link from "next/link";

export default function OrganizationCompletePage() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] px-5 py-6 text-[var(--color-text-primary)] sm:px-7">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5">
        <header className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-[18px]">
          <div className="flex items-center gap-3">
            <div className="flex size-[30px] items-center justify-center rounded-[10px] bg-[var(--color-accent)] text-[13px] font-extrabold text-white">
              D
            </div>
            <div>
              <p className="text-[13px] font-extrabold leading-tight text-[var(--color-text-primary)]">
                DURE
              </p>
              <p className="text-[10px] leading-tight text-[var(--color-text-secondary)]">
                운영 시스템
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-[18px]">
          <p className="text-[11px] font-bold text-[var(--color-success)]">
            기관 생성 완료
          </p>
          <div className="mt-2 grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
            <div>
              <h1 className="text-[22px] font-extrabold leading-tight text-[var(--color-text-primary)]">
                운영 콘솔을 사용할 준비가 끝났습니다.
              </h1>
              <p className="mt-2 max-w-xl text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
                이제 대시보드에서 사업, 마을, 프로그램을 기준으로 수업 일정을 만들고
                출석 대상 명단을 관리할 수 있습니다.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-[10px] bg-[var(--color-accent)] px-[14px] py-2 text-[13px] font-bold text-white"
                >
                  대시보드로 이동
                </Link>
                <Link
                  href="/organization"
                  className="rounded-[10px] border border-[var(--color-border)] bg-white px-[14px] py-2 text-[13px] font-bold text-[var(--color-text-primary)]"
                >
                  온보딩 다시 보기
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                "첫 사업 만들기",
                "마을 참여자 등록하기",
                "강사 계정과 담당 범위 지정하기",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[10px] bg-[var(--color-surface-alt)] px-3 py-2"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[var(--color-text-secondary)]">
                    {index + 1}
                  </span>
                  <span className="text-[13px] font-bold text-[var(--color-text-primary)]">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
