"use client";

import Link from "next/link";

type AttendanceStatus = "present" | "absent" | "late" | "excused";

type TeacherSessionCard = {
  id: string;
  sessionDate: string;
  className: string;
  villageName: string;
  programName: string;
  submittedAt: Date | null;
};

type TeacherSessionWorkspace = TeacherSessionCard & {
  lessonJournal: string;
  attachments: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    size: number;
    filePath: string;
  }>;
  snapshots: Array<{
    id: string;
    fullName: string;
    note: string | null;
    rosterOrder: number;
    attendanceStatus: AttendanceStatus;
  }>;
};

const panelClassName =
  "rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-[18px]";
const primaryButtonClassName =
  "rounded-[10px] bg-[var(--color-accent)] px-[14px] py-2 text-[13px] font-bold text-white";
const secondaryButtonClassName =
  "rounded-[10px] border border-[var(--color-border)] bg-white px-[14px] py-2 text-[13px] font-bold text-[var(--color-text-primary)]";

function formatCompactDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);
  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "short" }).format(
    date,
  );

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}.${String(date.getDate()).padStart(2, "0")}(${weekday})`;
}

function getSubmittedLabel(submittedAt: Date | null) {
  return submittedAt ? "제출 완료" : "제출 전";
}

export function TeacherSessionsScreen({
  sessions,
  selectedSession,
}: {
  sessions: TeacherSessionCard[];
  selectedSession: TeacherSessionWorkspace | null;
}) {
  if (!selectedSession) {
    return (
      <main className="flex flex-col gap-5">
        <section className="flex min-h-[360px] w-full flex-col items-center justify-center rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 text-center">
          <h1 className="text-[22px] font-extrabold text-[var(--color-text-primary)]">
            내 수업 일정
          </h1>
          <p className="mt-3 max-w-xl text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
            아직 배정된 수업 일정이 없습니다.
          </p>
        </section>
      </main>
    );
  }

  return (
    <TeacherDashboardWorkspace
      sessions={sessions}
      selectedSession={selectedSession}
    />
  );
}

function TeacherDashboardWorkspace({
  sessions,
  selectedSession,
}: {
  sessions: TeacherSessionCard[];
  selectedSession: TeacherSessionWorkspace;
}) {
  return (
    <main className="flex flex-col gap-5">
      <header className={panelClassName}>
        <p className="text-[11px] font-bold text-[var(--color-text-secondary)]">
          강사 영역
        </p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-[22px] font-extrabold leading-tight text-[var(--color-text-primary)]">
              내 수업 일정
            </h1>
            <p className="mt-2 text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
              배정된 수업 일정과 제출 상태를 확인하고 기록 화면으로 이동합니다.
            </p>
          </div>
          <p className="text-[13px] font-bold text-[var(--color-text-secondary)]">
            총 {sessions.length}개
          </p>
        </div>
      </header>

      <section className={panelClassName} aria-label="수업 일정 필터">
        <div className="flex flex-wrap gap-2">
          {["오늘", "이번주", "지난 회차"].map((label, index) => (
            <button
              key={label}
              type="button"
              className={
                index === 0 ? primaryButtonClassName : secondaryButtonClassName
              }
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)]">
        <div className="grid gap-3">
          {sessions.map((session) => {
            const isSelected = session.id === selectedSession.id;

            return (
              <article
                key={session.id}
                className={`${panelClassName} ${
                  isSelected ? "border-[var(--color-accent)]" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold text-[var(--color-text-secondary)]">
                      {formatCompactDateLabel(session.sessionDate)}
                    </p>
                    <h2 className="mt-2 text-[16px] font-bold text-[var(--color-text-primary)]">
                      {session.className}
                    </h2>
                    <p className="mt-1 text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
                      {session.programName} · {session.villageName}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--color-surface-alt)] px-[10px] py-[3px] text-[10px] font-bold tracking-[0.05em] text-[var(--color-text-secondary)]">
                    {getSubmittedLabel(session.submittedAt)}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={`/sessions?sessionId=${session.id}`}
                    className={secondaryButtonClassName}
                  >
                    목록에서 보기
                  </Link>
                  <Link
                    href={`/sessions/${session.id}`}
                    className={primaryButtonClassName}
                  >
                    기록하기
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <aside className={panelClassName}>
          <p className="text-[11px] font-bold text-[var(--color-text-secondary)]">
            선택된 수업 일정
          </p>
          <h2 className="mt-2 text-[22px] font-extrabold leading-tight text-[var(--color-text-primary)]">
            {selectedSession.className}
          </h2>
          <p className="mt-2 text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
            {formatCompactDateLabel(selectedSession.sessionDate)} ·{" "}
            {selectedSession.programName} · {selectedSession.villageName}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--color-surface-alt)] px-[10px] py-[3px] text-[10px] font-bold tracking-[0.05em] text-[var(--color-text-secondary)]">
              출석 대상 {selectedSession.snapshots.length}명
            </span>
            <span className="rounded-full bg-[var(--color-surface-alt)] px-[10px] py-[3px] text-[10px] font-bold tracking-[0.05em] text-[var(--color-text-secondary)]">
              {getSubmittedLabel(selectedSession.submittedAt)}
            </span>
            <span className="rounded-full bg-[var(--color-surface-alt)] px-[10px] py-[3px] text-[10px] font-bold tracking-[0.05em] text-[var(--color-text-secondary)]">
              첨부 문서 {selectedSession.attachments.length}개
            </span>
          </div>
          <div className="mt-5 rounded-[10px] bg-[var(--color-surface-alt)] px-4 py-3">
            <p className="text-[13px] font-bold text-[var(--color-text-primary)]">
              출석 대상 미리보기
            </p>
            <div className="mt-3 grid gap-2">
              {selectedSession.snapshots.length ? (
                selectedSession.snapshots.slice(0, 4).map((snapshot) => (
                  <p
                    key={snapshot.id}
                    className="rounded-[10px] bg-white px-3 py-2 text-[13px] font-medium text-[var(--color-text-secondary)]"
                  >
                    {snapshot.fullName}
                    {snapshot.note ? ` · ${snapshot.note}` : ""}
                  </p>
                ))
              ) : (
                <p className="text-[13px] font-medium text-[var(--color-text-secondary)]">
                  아직 출석 대상자가 없습니다.
                </p>
              )}
            </div>
          </div>
          <Link
            href={`/sessions/${selectedSession.id}`}
            className={`mt-5 block text-center ${primaryButtonClassName}`}
          >
            기록하기
          </Link>
        </aside>
      </section>
    </main>
  );
}
