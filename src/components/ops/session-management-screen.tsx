"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  addExistingSessionParticipantAction,
  assignSessionTeacherAction,
  createSessionParticipantAction,
} from "@/server/actions/session-management";

type SessionManagementData = {
  id: string;
  sessionDate: string;
  className: string;
  villageName: string;
  programName: string;
  teacherId: string | null;
  teacherName: string | null;
  teacherEmail: string | null;
  submittedAt: Date | null;
  updatedAt: Date;
  teachers: Array<{
    userId: string;
    email: string;
    displayName: string | null;
  }>;
  participants: Array<{
    id: string;
    fullName: string;
    note: string | null;
  }>;
  snapshots: Array<{
    id: string;
    participantId: string | null;
    fullName: string;
    note: string | null;
    rosterOrder: number;
    attendanceStatus: "present" | "absent" | "late" | "excused" | null;
  }>;
};

type ActionState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const initialState: ActionState = {};
const panelClassName =
  "rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-[18px]";
const inputClassName =
  "h-9 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-[13px] font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[rgba(81,123,246,0.15)]";
const primaryButtonClassName =
  "rounded-[10px] bg-[var(--color-accent)] px-[14px] py-2 text-[13px] font-bold text-white";
const secondaryButtonClassName =
  "rounded-[10px] border border-[var(--color-border)] bg-white px-[14px] py-2 text-[13px] font-bold text-[var(--color-text-primary)]";

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

function Feedback({ state }: { state: ActionState }) {
  return state.message ? (
    <p className="mt-4 rounded-[10px] bg-[var(--color-surface-alt)] px-3 py-2 text-[13px] leading-6 text-[var(--color-text-secondary)]">
      {state.message}
    </p>
  ) : null;
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className={panelClassName}>
      <p className="text-[16px] font-bold text-[var(--color-text-primary)]">
        {title}
      </p>
      <p className="mt-1 text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
        {description}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function SessionManagementScreen({
  session,
}: {
  session: SessionManagementData;
}) {
  const [teacherState, teacherAction] = useActionState(
    assignSessionTeacherAction,
    initialState,
  );
  const [existingParticipantState, existingParticipantAction] = useActionState(
    addExistingSessionParticipantAction,
    initialState,
  );
  const [newParticipantState, newParticipantAction] = useActionState(
    createSessionParticipantAction,
    initialState,
  );

  const missingAttendanceCount = session.snapshots.filter(
    (snapshot) => !snapshot.attendanceStatus,
  ).length;

  return (
    <main className="flex flex-col gap-5">
      <div className="flex w-full flex-col gap-5">
        <header className={panelClassName}>
          <Link
            href="/dashboard"
            className={secondaryButtonClassName}
          >
            대시보드로
          </Link>
          <p className="mt-5 text-[11px] font-bold text-[var(--color-text-secondary)]">
            수업 일정 관리
          </p>
          <h1 className="mt-2 text-[22px] font-extrabold leading-tight text-[var(--color-text-primary)]">
            {session.className}
          </h1>
          <p className="mt-3 max-w-3xl text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
            {formatDateLabel(session.sessionDate)} · {session.programName} ·{" "}
            {session.villageName}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--color-surface-alt)] px-[10px] py-[3px] text-[10px] font-bold tracking-[0.05em] text-[var(--color-text-secondary)]">
              {session.teacherName ?? session.teacherEmail ?? "강사 미할당"}
            </span>
            <span className="rounded-full bg-[var(--color-surface-alt)] px-[10px] py-[3px] text-[10px] font-bold tracking-[0.05em] text-[var(--color-text-secondary)]">
              출석 대상 {session.snapshots.length}명
            </span>
            <span className="rounded-full bg-[var(--color-surface-alt)] px-[10px] py-[3px] text-[10px] font-bold tracking-[0.05em] text-[var(--color-text-secondary)]">
              {session.submittedAt ? "제출 완료" : "제출 전"}
            </span>
            {missingAttendanceCount ? (
              <span className="rounded-full bg-[var(--color-surface-alt)] px-[10px] py-[3px] text-[10px] font-bold tracking-[0.05em] text-[var(--color-text-secondary)]">
                출석 미입력 {missingAttendanceCount}명
              </span>
            ) : null}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <Panel
            title="강사 할당"
            description="수업 일정을 먼저 만들고, 담당 강사는 나중에 배정하거나 변경할 수 있습니다."
          >
            <form action={teacherAction} className="grid gap-3">
              <input type="hidden" name="sessionId" value={session.id} />
              <select
                name="teacherId"
                defaultValue={session.teacherId ?? ""}
                className={inputClassName}
              >
                <option value="">강사 미할당</option>
                {session.teachers.map((teacher) => (
                  <option key={teacher.userId} value={teacher.userId}>
                    {teacher.displayName ?? teacher.email}
                  </option>
                ))}
              </select>
              <button className={primaryButtonClassName}>
                강사 저장
              </button>
            </form>
            <Feedback state={teacherState} />
          </Panel>

          <Panel
            title="수업 일정 상태"
            description="제출 여부와 최근 변경 시각을 확인하고 기록 상세로 이동합니다."
          >
            <div className="space-y-3 text-[13px] leading-6 text-[var(--color-text-secondary)]">
              <p className="rounded-[10px] bg-[var(--color-surface-alt)] px-3 py-2">
                제출 {formatDateTimeLabel(session.submittedAt)}
              </p>
              <p className="rounded-[10px] bg-[var(--color-surface-alt)] px-3 py-2">
                최근 변경 {formatDateTimeLabel(session.updatedAt)}
              </p>
              <Link
                href={`/records/${session.id}`}
                className={`block text-center ${secondaryButtonClassName}`}
              >
                기록 상세 보기
              </Link>
            </div>
          </Panel>

          <Panel
            title="기존 출석 대상자 추가"
            description="마을 참여자 명단에 있는 사람을 이 수업 일정의 출석 대상에 추가합니다."
          >
            <form action={existingParticipantAction} className="grid gap-3">
              <input type="hidden" name="sessionId" value={session.id} />
              <select
                name="participantId"
                className={inputClassName}
              >
                <option value="">참여자 선택</option>
                {session.participants.map((participant) => (
                  <option key={participant.id} value={participant.id}>
                    {participant.fullName}
                    {participant.note ? ` · ${participant.note}` : ""}
                  </option>
                ))}
              </select>
              <button className={primaryButtonClassName}>
                기존 출석 대상자 추가
              </button>
            </form>
            <Feedback state={existingParticipantState} />
          </Panel>

          <Panel
            title="새 출석 대상자 추가"
            description="마을 참여자 명단에 저장한 뒤 이 수업 일정에도 바로 추가합니다."
          >
            <form action={newParticipantAction} className="grid gap-3">
              <input type="hidden" name="sessionId" value={session.id} />
              <input
                name="fullName"
                placeholder="예: 홍길동"
                className={inputClassName}
              />
              <textarea
                name="note"
                placeholder="참여자 메모"
                className={`${inputClassName} min-h-24 resize-y py-3`}
              />
              <button className={primaryButtonClassName}>
                새 출석 대상자 추가
              </button>
            </form>
            <Feedback state={newParticipantState} />
          </Panel>
        </div>

        <Panel
          title="출석 대상"
          description="제출 후 추가된 참여자는 강사가 다시 수정 저장하기 전까지 출석 미입력으로 보입니다."
        >
          <div className="grid gap-3 md:grid-cols-2">
            {session.snapshots.length ? (
              session.snapshots.map((snapshot) => (
                <div
                  key={snapshot.id}
                  className="rounded-[10px] bg-[var(--color-surface-alt)] px-4 py-4"
                >
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    {snapshot.fullName}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    {snapshot.attendanceStatus ?? "미입력"} ·{" "}
                    {snapshot.note ?? "메모 없음"}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-[10px] bg-[var(--color-surface-alt)] px-4 py-4 text-sm leading-6 text-[var(--color-text-secondary)] md:col-span-2">
                아직 출석 대상자가 없습니다. 강사 제출 전에 출석 대상자를 추가해 주세요.
              </p>
            )}
          </div>
        </Panel>
      </div>
    </main>
  );
}
