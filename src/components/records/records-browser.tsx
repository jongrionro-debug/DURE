import Link from "next/link";

type RecordSummary = {
  id: string;
  sessionDate: string;
  className: string;
  villageName: string;
  programName: string;
  teacherName: string | null;
  teacherEmail: string | null;
  submittedAt: Date | null;
  updatedAt: Date;
};

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${value}T00:00:00`));
}

export function RecordsBrowser({
  rows,
  filterOptions,
  filters,
}: {
  rows: RecordSummary[];
  filterOptions: {
    programs: string[];
    teachers: string[];
  };
  filters: {
    search?: string;
    status?: string;
    program?: string;
    teacher?: string;
  };
}) {
  return (
    <main className="flex flex-col gap-5">
      <div className="flex w-full flex-col gap-5">
        <header className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-[18px]">
          <h1 className="text-[22px] font-extrabold leading-tight text-[var(--color-text-primary)]">
            서류·기록
          </h1>
          <p className="mt-2 max-w-3xl text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
            수업 일정별 출석, 교육일지, 첨부 문서를 검색하고 검토합니다.
          </p>
        </header>

        <section className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-[18px]">
          <form className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.8fr))]">
            <input
              name="search"
              defaultValue={filters.search}
              placeholder="프로그램, 사업, 마을, 강사 검색"
              className="h-9 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-[13px] font-medium text-[var(--color-text-primary)] outline-none"
            />
            <select
              name="status"
              defaultValue={filters.status ?? "all"}
              className="h-9 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-[13px] font-medium text-[var(--color-text-primary)] outline-none"
            >
              <option value="all">전체 상태</option>
              <option value="submitted">제출 완료</option>
              <option value="updated">제출 후 수정</option>
              <option value="pending">미제출</option>
            </select>
            <select
              name="program"
              defaultValue={filters.program ?? ""}
              className="h-9 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-[13px] font-medium text-[var(--color-text-primary)] outline-none"
            >
              <option value="">전체 사업</option>
              {filterOptions.programs.map((program) => (
                <option key={program} value={program}>
                  {program}
                </option>
              ))}
            </select>
            <select
              name="teacher"
              defaultValue={filters.teacher ?? ""}
              className="h-9 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-[13px] font-medium text-[var(--color-text-primary)] outline-none"
            >
              <option value="">전체 강사</option>
              {filterOptions.teachers.map((teacher) => (
                <option key={teacher} value={teacher}>
                  {teacher}
                </option>
              ))}
            </select>
            <button className="rounded-[10px] bg-[var(--color-accent)] px-[14px] py-2 text-[13px] font-bold text-white lg:col-span-4 lg:w-fit">
              필터 적용
            </button>
          </form>
        </section>

        <section className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-[18px]">
          <div className="space-y-3">
            {rows.length ? (
              rows.map((row) => (
                <div
                  key={row.id}
                  className="rounded-[14px] border border-[var(--color-border)] bg-white px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {row.className}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {row.programName} · {row.villageName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {formatDateLabel(row.sessionDate)}
                      </p>
                      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                        {row.submittedAt ? "제출됨" : "미제출"}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
                    {row.teacherName ?? row.teacherEmail ?? "강사 미할당"}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/records/${row.id}`}
                      className="rounded-[10px] border border-[var(--color-border)] bg-white px-[14px] py-2 text-[13px] font-bold text-[var(--color-text-primary)]"
                    >
                      기록 상세
                    </Link>
                    <Link
                      href={`/dashboard/sessions/${row.id}`}
                      className="rounded-[10px] border border-[var(--color-border)] bg-white px-[14px] py-2 text-[13px] font-bold text-[var(--color-text-primary)]"
                    >
                      수업 일정 관리
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-[14px] bg-[var(--color-surface-alt)] px-4 py-5 text-sm leading-6 text-[var(--color-text-secondary)]">
                조건에 맞는 기록이 없습니다. 검색어를 줄이거나 상태 필터를 바꿔
                보세요.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
