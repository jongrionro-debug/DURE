"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { createSessionAction } from "@/server/actions/sessions";

type SessionDashboardData = {
  villages: Array<{ id: string; name: string }>;
  programs: Array<{ id: string; name: string }>;
  classes: Array<{
    id: string;
    name: string;
    programId: string | null;
    villageId: string | null;
    programName: string | null;
    villageName: string | null;
  }>;
  teacherAssignments: Array<{
    classId: string;
    className: string;
    teacherId: string;
    teacherName: string | null;
    teacherEmail: string | null;
  }>;
  recentSessions: Array<{
    id: string;
    sessionDate: string;
    className: string;
    villageName: string;
    programName: string;
    teacherName: string | null;
    teacherEmail: string | null;
    snapshotCount: number;
    submittedAt: Date | null;
  }>;
  participants: Array<{
    id: string;
    fullName: string;
    note: string | null;
    villageId: string | null;
  }>;
};

type DashboardQueryData = {
  setupGaps: Array<{
    label: string;
    description: string;
    href: string;
  }>;
  recentSubmissions: DashboardActivity[];
  recentUpdates: DashboardActivity[];
  submissionOverview: {
    totalSessions: number;
    submittedSessions: number;
    pendingSessions: number;
    completionRate: number;
    attendanceCount: number;
    journalCount: number;
    attachmentCount: number;
  };
  pendingSessions: DashboardActivity[];
};

type DashboardActivity = {
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

type ActionState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const initialState: ActionState = {};

const cardClassName =
  "rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] p-[18px]";
const inputClassName =
  "h-9 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-[13px] font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[rgba(81,123,246,0.15)]";
const primaryButtonClassName =
  "rounded-[10px] bg-[var(--color-accent)] px-[14px] py-2 text-[13px] font-bold text-white";
const secondaryButtonClassName =
  "rounded-[10px] border border-[var(--color-border)] bg-white px-[14px] py-2 text-[13px] font-bold text-[var(--color-text-primary)]";

function formatToday() {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(new Date());
}

function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    weekday: "short",
  }).format(new Date(`${value}T00:00:00`));
}

function Feedback({ state }: { state: ActionState }) {
  const fieldErrors = Object.values(state.fieldErrors ?? {}).flatMap(
    (errors) => errors ?? [],
  );

  if (!state.message && !fieldErrors.length) {
    return null;
  }

  return (
    <div className="rounded-[10px] border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[13px] font-medium text-[var(--color-text-secondary)]">
      {state.message ? <p>{state.message}</p> : null}
      {fieldErrors.length ? (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {fieldErrors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ScheduleCreateModal({
  data,
  onClose,
}: {
  data: SessionDashboardData;
  onClose: () => void;
}) {
  const [createState, createAction] = useActionState(
    createSessionAction,
    initialState,
  );
  const [villageName, setVillageName] = useState("");
  const selectedVillage = data.villages.find(
    (village) => village.name === villageName.trim(),
  );
  const participantCandidates = selectedVillage
    ? data.participants.filter(
        (participant) => participant.villageId === selectedVillage.id,
      )
    : [];

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 px-5 py-8">
      <section className="w-full max-w-[680px] rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[0_18px_48px_rgba(0,0,0,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-extrabold text-[var(--color-text-primary)]">
              수업 일정 만들기
            </h2>
            <p className="mt-2 text-[13px] font-medium leading-6 text-[var(--color-text-secondary)]">
              현재 마을 참여자 명단을 출석 대상으로 고정합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={secondaryButtonClassName}
          >
            닫기
          </button>
        </div>

        <form action={createAction} className="mt-5 grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-[12px] font-bold text-[var(--color-text-primary)]">
              진행일
              <input
                type="date"
                name="sessionDate"
                aria-label="진행일"
                className={inputClassName}
              />
            </label>
            <label className="grid gap-1.5 text-[12px] font-bold text-[var(--color-text-primary)]">
              담당 강사
              <select
                name="teacherId"
                aria-label="담당 강사"
                className={inputClassName}
              >
                <option value="">강사 미배정</option>
                {data.teacherAssignments.map((assignment) => (
                  <option
                    key={`${assignment.classId}-${assignment.teacherId}`}
                    value={assignment.teacherId}
                  >
                    {assignment.teacherName ?? assignment.teacherEmail}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1.5 text-[12px] font-bold text-[var(--color-text-primary)]">
              사업
              <input
                name="programName"
                list="program-options"
                aria-label="사업"
                className={inputClassName}
              />
            </label>
            <label className="grid gap-1.5 text-[12px] font-bold text-[var(--color-text-primary)]">
              마을
              <input
                name="villageName"
                list="village-options"
                aria-label="마을"
                value={villageName}
                onChange={(event) => setVillageName(event.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="grid gap-1.5 text-[12px] font-bold text-[var(--color-text-primary)] sm:col-span-2">
              프로그램
              <input
                name="className"
                list="class-options"
                aria-label="프로그램"
                className={inputClassName}
              />
            </label>
          </div>

          <datalist id="program-options">
            {data.programs.map((program) => (
              <option key={program.id} value={program.name} />
            ))}
          </datalist>
          <datalist id="village-options">
            {data.villages.map((village) => (
              <option key={village.id} value={village.name} />
            ))}
          </datalist>
          <datalist id="class-options">
            {data.classes.map((klass) => (
              <option key={klass.id} value={klass.name} />
            ))}
          </datalist>

          <fieldset className="rounded-[14px] border border-[var(--color-border)] px-4 py-3">
            <legend className="px-1 text-[12px] font-bold text-[var(--color-text-primary)]">
              출석 대상 제외
            </legend>
            {participantCandidates.length ? (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {participantCandidates.map((participant) => (
                  <label
                    key={participant.id}
                    className="flex items-start gap-2 text-[13px] font-medium text-[var(--color-text-primary)]"
                  >
                    <input
                      type="checkbox"
                      name="excludedParticipantIds"
                      value={participant.id}
                      className="mt-1"
                    />
                    <span>
                      {participant.fullName}
                      {participant.note ? (
                        <span className="block text-[11px] text-[var(--color-text-secondary)]">
                          {participant.note}
                        </span>
                      ) : null}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[13px] font-medium text-[var(--color-text-secondary)]">
                마을을 선택하면 출석 대상 후보가 표시됩니다.
              </p>
            )}
          </fieldset>

          <Feedback state={createState} />
          <button className={primaryButtonClassName}>수업 일정 만들기</button>
        </form>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={cardClassName}>
      <p className="text-[11px] font-bold text-[var(--color-text-secondary)]">
        {label}
      </p>
      <p className="mt-2 text-[24px] font-extrabold leading-none text-[var(--color-text-primary)]">
        {value}
      </p>
    </div>
  );
}

export function DashboardScreen({
  data,
  dashboard,
}: {
  data: SessionDashboardData;
  dashboard: DashboardQueryData;
  sessionManagementRecords?: unknown[];
  activeView?: "actions" | "status";
}) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(
    data.recentSessions[0]?.id ?? "",
  );
  const selectedSession =
    data.recentSessions.find((session) => session.id === selectedSessionId) ??
    data.recentSessions[0] ??
    null;
  const timeline = useMemo(
    () => [...dashboard.recentSubmissions, ...dashboard.recentUpdates].slice(0, 5),
    [dashboard.recentSubmissions, dashboard.recentUpdates],
  );

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-[12px] font-bold text-[var(--color-text-secondary)]">
            {formatToday()}
          </p>
          <h1 className="mt-1 text-[22px] font-extrabold leading-tight text-[var(--color-text-primary)]">
            안녕하세요, 운영자님
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className={primaryButtonClassName}
        >
          수업 일정 만들기
        </button>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="진행 중 사업" value={data.programs.length} />
        <StatCard label="이번 달 일정" value={dashboard.submissionOverview.totalSessions} />
        <StatCard
          label="미제출 일지"
          value={dashboard.submissionOverview.pendingSessions}
        />
        <StatCard label="누적 참여자" value={data.participants.length} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className={cardClassName}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
              수업 일정
            </h2>
            <Link href="/records" className={secondaryButtonClassName}>
              서류·기록
            </Link>
          </div>
          <div className="mt-4 grid gap-2">
            {data.recentSessions.length ? (
              data.recentSessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  aria-pressed={selectedSession?.id === session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`rounded-[14px] border px-4 py-3 text-left transition ${
                    selectedSession?.id === session.id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-surface)]"
                      : "border-[var(--color-border)] bg-white"
                  }`}
                >
                  <span className="block text-[13px] font-bold text-[var(--color-text-primary)]">
                    {session.className}
                  </span>
                  <span className="mt-1 block text-[12px] font-medium text-[var(--color-text-secondary)]">
                    {formatSessionDate(session.sessionDate)} · {session.programName} ·{" "}
                    {session.villageName}
                  </span>
                </button>
              ))
            ) : (
              <p className="rounded-[14px] bg-[var(--color-surface-alt)] px-4 py-8 text-center text-[13px] font-medium text-[var(--color-text-secondary)]">
                아직 만들어진 수업 일정이 없습니다.
              </p>
            )}
          </div>
        </div>

        <aside className={cardClassName}>
          <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
            선택한 일정
          </h2>
          {selectedSession ? (
            <div className="mt-4 grid gap-3 text-[13px] font-medium text-[var(--color-text-secondary)]">
              <p className="text-[18px] font-extrabold text-[var(--color-text-primary)]">
                {selectedSession.className}
              </p>
              <p>{selectedSession.programName}</p>
              <p>{selectedSession.villageName}</p>
              <p>
                담당 강사:{" "}
                {selectedSession.teacherName ??
                  selectedSession.teacherEmail ??
                  "미배정"}
              </p>
              <p>출석 대상 {selectedSession.snapshotCount}명</p>
              <Link
                href={`/dashboard/sessions/${selectedSession.id}`}
                className={primaryButtonClassName}
              >
                수업 일정 관리
              </Link>
            </div>
          ) : (
            <p className="mt-4 text-[13px] font-medium text-[var(--color-text-secondary)]">
              왼쪽에서 일정을 선택해 주세요.
            </p>
          )}
        </aside>
      </section>

      <section className={cardClassName}>
        <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
          최근 제출 및 업데이트
        </h2>
        <div className="mt-4 grid gap-2">
          {timeline.length ? (
            timeline.map((activity) => (
              <Link
                key={`${activity.id}-${activity.updatedAt.toISOString()}`}
                href={`/records/${activity.id}`}
                className="rounded-[14px] border border-[var(--color-border)] bg-white px-4 py-3"
              >
                <span className="block text-[13px] font-bold text-[var(--color-text-primary)]">
                  {activity.className}
                </span>
                <span className="mt-1 block text-[12px] font-medium text-[var(--color-text-secondary)]">
                  {activity.programName} · {activity.villageName}
                </span>
              </Link>
            ))
          ) : (
            <p className="text-[13px] font-medium text-[var(--color-text-secondary)]">
              아직 최근 제출이나 업데이트가 없습니다.
            </p>
          )}
        </div>
      </section>

      {isCreateOpen ? (
        <ScheduleCreateModal data={data} onClose={() => setIsCreateOpen(false)} />
      ) : null}
    </div>
  );
}
