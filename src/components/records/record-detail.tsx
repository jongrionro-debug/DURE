"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type AttendanceStatus = "present" | "absent" | "late" | "excused" | null;

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
    status: AttendanceStatus;
  }>;
  attachments: Array<{
    id: string;
    fileName: string;
    mimeType: string;
    size: number;
    filePath: string;
  }>;
};

type IconName =
  | "arrow"
  | "calendar"
  | "check"
  | "clock"
  | "download"
  | "file"
  | "journal"
  | "search"
  | "user";

type AttendanceFilter = "all" | "present" | "absent" | "late";

const statusLabels: Record<NonNullable<AttendanceStatus>, string> = {
  present: "출석",
  absent: "결석",
  late: "지각",
  excused: "공결",
};

function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };

  switch (name) {
    case "arrow":
      return (
        <svg {...common}>
          <path d="M19 12H5" />
          <path d="m12 19-7-7 7-7" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="17" rx="3" />
          <path d="M8 2v4" />
          <path d="M16 2v4" />
          <path d="M3 10h18" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8 12 3 3 5-6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "download":
      return (
        <svg {...common}>
          <path d="M12 3v11" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      );
    case "file":
      return (
        <svg {...common}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
        </svg>
      );
    case "journal":
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H7a3 3 0 0 0-3 3z" />
          <path d="M8 7h7" />
          <path d="M8 11h6" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4 4" />
        </svg>
      );
    case "user":
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
  }
}

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

function getStatusLabel(status: AttendanceStatus) {
  return status ? statusLabels[status] : "미입력";
}

function getStatusClassName(status: AttendanceStatus) {
  switch (status) {
    case "present":
      return "bg-[rgba(47,158,91,0.12)] text-[var(--color-success)]";
    case "late":
      return "bg-[rgba(201,131,26,0.14)] text-[var(--color-warning)]";
    case "absent":
      return "bg-[rgba(217,92,74,0.12)] text-[var(--color-danger)]";
    case "excused":
      return "bg-[var(--color-accent-surface)] text-[#806500]";
    default:
      return "bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]";
  }
}

function MetricCard({
  icon,
  label,
  value,
  tone = "green",
}: {
  icon: IconName;
  label: string;
  value: number;
  tone?: "green" | "yellow" | "red" | "neutral";
}) {
  const toneClassName = {
    green: "bg-[#DFEAD4] text-[#4E7B32]",
    yellow: "bg-[var(--color-accent-surface)] text-[var(--color-warning)]",
    red: "bg-[rgba(217,92,74,0.12)] text-[var(--color-danger)]",
    neutral: "bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]",
  }[tone];

  return (
    <section className="flex min-h-[92px] items-center gap-4 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 shadow-panel">
      <span
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${toneClassName}`}
      >
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold tracking-[-0.04em] text-[var(--color-text-primary)]">
          {label} {value}
        </p>
      </div>
    </section>
  );
}

function PublicAttachmentLink({
  attachment,
}: {
  attachment: RecordDetail["attachments"][number];
}) {
  const publicUrl = `https://sbpjolnlnwryjcwfjojd.supabase.co/storage/v1/object/public/session-attachments/${attachment.filePath}?download=${attachment.fileName}`;

  return (
    <a
      href={publicUrl}
      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-xs font-bold text-[var(--color-text-primary)] transition hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-ink)]"
    >
      <Icon name="download" className="h-4 w-4" />
      다운로드
    </a>
  );
}

export function RecordDetailScreen({ record }: { record: RecordDetail }) {
  const [filter, setFilter] = useState<AttendanceFilter>("all");
  const [query, setQuery] = useState("");

  const attendanceCounts = useMemo(() => {
    return {
      present: record.attendance.filter((row) => row.status === "present").length,
      absent: record.attendance.filter((row) => row.status === "absent").length,
      late: record.attendance.filter((row) => row.status === "late").length,
      attachments: record.attachments.length,
    };
  }, [record.attendance, record.attachments.length]);

  const filteredAttendance = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return record.attendance.filter((row) => {
      const matchesFilter = filter === "all" || row.status === filter;
      const matchesQuery =
        !normalizedQuery ||
        row.fullName.toLowerCase().includes(normalizedQuery) ||
        (row.note ?? "").toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, query, record.attendance]);

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <div className="mx-auto w-full max-w-[1500px] px-5 py-5 sm:px-8 lg:px-11">
        <header className="flex items-center">
          <Link
            href="/records"
            className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-semibold shadow-panel transition hover:bg-[var(--color-surface-alt)]"
          >
            <Icon name="arrow" className="h-5 w-5" />
            기록 목록
          </Link>
        </header>

        <section className="mt-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
              {record.className}
            </h1>
            <p className="mt-4 text-base font-medium text-[var(--color-text-secondary)]">
              {formatDateLabel(record.sessionDate)} · {record.programName} ·{" "}
              {record.villageName}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span
              className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-bold ${
                record.submittedAt
                  ? "bg-[rgba(47,158,91,0.12)] text-[var(--color-success)]"
                  : "bg-[rgba(201,131,26,0.14)] text-[var(--color-warning)]"
              }`}
            >
              <Icon
                name={record.submittedAt ? "check" : "clock"}
                className="h-4 w-4"
              />
              {record.submittedAt ? "제출 완료" : "아직 제출 전"}
            </span>
            <span className="inline-flex h-10 items-center rounded-full bg-[var(--color-surface-alt)] px-4 text-sm font-semibold text-[var(--color-text-secondary)]">
              최근 수정 {formatDateTimeLabel(record.updatedAt)}
            </span>
            <Link
              href={`/dashboard/sessions/${record.id}`}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-bold transition hover:bg-[var(--color-surface-alt)]"
            >
              세션 관리
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon="check" label="출석" value={attendanceCounts.present} />
          <MetricCard
            icon="clock"
            label="결석"
            value={attendanceCounts.absent}
            tone="red"
          />
          <MetricCard
            icon="clock"
            label="지각"
            value={attendanceCounts.late}
            tone="yellow"
          />
          <MetricCard
            icon="file"
            label="첨부"
            value={attendanceCounts.attachments}
            tone="neutral"
          />
        </section>

        <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-panel">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h2 className="text-2xl font-bold tracking-[-0.03em]">출석 기록</h2>

              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
                    <Icon name="search" className="h-5 w-5" />
                  </span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="이름 또는 메모 검색"
                    className="h-11 w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] pl-12 pr-4 text-sm font-medium outline-none transition placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-surface)] lg:w-[240px]"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {[
                    ["all", "전체"],
                    ["present", "출석"],
                    ["absent", "결석"],
                    ["late", "지각"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setFilter(value as AttendanceFilter)}
                      className={`h-10 rounded-full border px-4 text-sm font-semibold transition ${
                        filter === value
                          ? "border-[#4F7C32] bg-[var(--color-surface)] text-[#315D1E]"
                          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 overflow-hidden rounded-[12px] border border-[var(--color-border)]">
              <table className="w-full min-w-[680px] border-collapse bg-[var(--color-surface)] text-left">
                <thead>
                  <tr className="border-b border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)]">
                    <th className="px-5 py-4">이름</th>
                    <th className="px-5 py-4">상태</th>
                    <th className="px-5 py-4">메모</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.length ? (
                    filteredAttendance.map((row) => (
                      <tr
                        key={row.snapshotId}
                        className="border-b border-[var(--color-border)] last:border-b-0"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#DFEAD4] text-[#5C813E]">
                              <Icon name="user" className="h-5 w-5" />
                            </span>
                            <span className="font-bold">{row.fullName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1.5 text-sm font-bold ${getStatusClassName(
                              row.status,
                            )}`}
                          >
                            {getStatusLabel(row.status)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-[var(--color-text-secondary)]">
                          {row.note ?? "메모 없음"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-5 py-12 text-center text-sm font-medium text-[var(--color-text-secondary)]"
                      >
                        조건에 맞는 출석 기록이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="space-y-5">
            <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-panel">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#DFEAD4] text-[#4F7C32]">
                  <Icon name="journal" className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-bold tracking-[-0.03em]">교육일지</h2>
              </div>
              <p className="mt-5 min-h-[210px] whitespace-pre-wrap rounded-[14px] bg-[var(--color-surface-alt)] px-4 py-4 text-sm leading-7 text-[var(--color-text-secondary)]">
                {record.lessonJournal || "아직 교육일지가 없습니다."}
              </p>
            </section>

            <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-panel">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--color-accent-surface)] text-[#806500]">
                  <Icon name="file" className="h-5 w-5" />
                </span>
                <h2 className="text-xl font-bold tracking-[-0.03em]">첨부 문서</h2>
              </div>

              <div className="mt-5 space-y-3">
                {record.attachments.length ? (
                  record.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between gap-3 rounded-[12px] bg-[var(--color-surface-alt)] px-4 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--color-surface)] text-[var(--color-text-secondary)]">
                          <Icon name="file" className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold">
                            {attachment.fileName}
                          </p>
                          <p className="mt-1 text-xs font-medium text-[var(--color-text-secondary)]">
                            {Math.ceil(attachment.size / 1024)}KB ·{" "}
                            {attachment.mimeType}
                          </p>
                        </div>
                      </div>
                      <PublicAttachmentLink attachment={attachment} />
                    </div>
                  ))
                ) : (
                  <p className="rounded-[12px] bg-[var(--color-surface-alt)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
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
