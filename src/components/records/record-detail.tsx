import Link from "next/link";

type RecordDetail = {
  id: string;
  organizationId: string;
  sessionDate: string;
  className: string;
  villageName: string;
  programName: string;
  teacherName: string | null;
  teacherEmail: string | null;
  submittedAt: Date | null;
  updatedAt: Date;
  lessonJournal: string;
  attendance: Array<{
    snapshotId: string;
    fullName: string;
    note: string | null;
    rosterOrder: number;
    status: "present" | "absent" | "late" | "excused" | null;
  }>;
  attachments: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    size: number;
    filePath: string;
  }>;
};

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date(`${value}T00:00:00`));
}

function formatDateTimeLabel(value: Date | null) {
  if (!value) {
    return "아직 제출 전";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

export function RecordDetailScreen({ record }: { record: RecordDetail }) {
  return (
    <main className="flex min-h-screen flex-1 flex-col bg-[var(--color-background)]">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10 lg:py-10">
        <header className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-panel sm:p-8">
          <Link
            href="/records"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition hover:-translate-y-0.5"
          >
            <span aria-hidden="true">&lt;</span>
            뒤로 가기
          </Link>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
            Record detail
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.05em] text-[var(--color-text-primary)] sm:text-5xl">
            {record.className}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--color-text-secondary)]">
            {formatDateLabel(record.sessionDate)} · {record.programName} ·{" "}
            {record.villageName}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--color-surface-alt)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)]">
              제출 {formatDateTimeLabel(record.submittedAt)}
            </span>
            <span className="rounded-full bg-[var(--color-surface-alt)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)]">
              최근 수정 {formatDateTimeLabel(record.updatedAt)}
            </span>
            <Link
              href={`/dashboard/sessions/${record.id}`}
              className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-text-primary)]"
            >
              세션 관리
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)]">
          <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-panel">
            <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
              출석
            </p>
            <div className="mt-5 space-y-3">
              {record.attendance.map((row) => (
                <div
                  key={row.snapshotId}
                  className="rounded-[20px] bg-[var(--color-surface-alt)] px-4 py-4"
                >
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {row.fullName}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {row.status ?? "미입력"} · {row.note ?? "메모 없음"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-panel">
              <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                교육일지
              </p>
              <p className="mt-4 whitespace-pre-wrap rounded-[20px] bg-[var(--color-surface-alt)] px-4 py-4 text-sm leading-6 text-[var(--color-text-secondary)]">
                {record.lessonJournal || "아직 교육일지가 없습니다."}
              </p>
            </section>

            <section className="rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-panel">
              <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
                첨부 문서
              </p>
              <div className="mt-4 space-y-2">
                {record.attachments.length ? (
                  record.attachments.map((attachment) => {
                    // 수파베이스 스토리지의 공개 URL을 생성합니다.
                    // 형식: [PROJECT_URL]/storage/v1/object/public/[BUCKET_NAME]/[FILE_ID]
                    const publicUrl = `https://sbpjolnlnwryjcwfjojd.supabase.co/storage/v1/object/public/session-attachments/organizations/${record.organizationId}/sessions/${record.id}/${attachment.id}-${attachment.fileName}`;
            
                    return (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between rounded-[18px] bg-[var(--color-surface-alt)] px-4 py-3 text-sm"
                      >
                        <div className="flex flex-col text-[var(--color-text-secondary)]">
                          <span className="font-medium text-[var(--color-text-primary)]">
                            {attachment.fileName}
                          </span>
                          <span className="text-xs">
                            {Math.ceil(attachment.size / 1024)}KB · {attachment.mimeType}
                          </span>
                        </div>
                        
                        <a
                          href={publicUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-[var(--color-surface)] px-4 py-2 text-xs font-bold text-[var(--color-text-primary)] border border-[var(--color-border)] transition hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-ink)]"
                        >
                          보기 / 다운로드
                        </a>
                      </div>
                    );
                  })
                ) : (
                  <p className="rounded-[18px] bg-[var(--color-surface-alt)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                    첨부 문서가 없습니다.
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
