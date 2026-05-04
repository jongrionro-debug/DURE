"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";

import {
  addExistingSessionParticipantAction,
  createSessionParticipantAction,
  removeSessionParticipantAction,
} from "@/server/actions/session-management";
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

type SessionManagementRecord = {
  id: string;
  sessionDate: string;
  classId: string;
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

const initialState: ActionState = {};

const actionCards = [
  { label: "사업 만들기", href: "/settings", active: false },
  { label: "수업 연결하기", href: "/settings", active: false },
  { label: "강사 배정하기", href: "/users", active: false },
] as const;

const nextActionCardClassName =
  "flex min-h-[82px] items-center justify-center rounded-[14px] border-2 border-[#fcce00] bg-white px-6 text-center text-[22px] font-semibold text-black transition hover:-translate-y-0.5 hover:bg-[#ffec1d] hover:shadow-[0_4px_4px_rgba(0,0,0,0.16)] focus-visible:bg-[#ffec1d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fcce00] sm:min-h-[114px] sm:rounded-[20px] sm:text-[25px]";

function formatDateTimeLabel(value: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function formatSessionDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  const weekday = new Intl.DateTimeFormat("ko-KR", {
    weekday: "short",
  }).format(date);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}.${month}.${day}(${weekday})`;
}

function DashboardTabs({ activeView }: { activeView: "actions" | "status" }) {
  const baseClassName =
    "flex h-12 min-w-0 flex-1 items-center justify-center border text-lg font-semibold transition sm:h-[50px] sm:text-[25px]";
  const activeClassName =
    "border-[#48672e] bg-[#fffdf8] text-[#48672e]";
  const inactiveClassName =
    "border-[#9d9a95] bg-[#fffdf8] text-[#555555] hover:text-black";

  return (
    <nav className="mx-auto mt-9 flex w-full max-w-[840px]" aria-label="대시보드 보기">
      <Link
        href="/dashboard"
        className={`${baseClassName} ${
          activeView === "actions" ? activeClassName : inactiveClassName
        }`}
      >
        다음 액션
      </Link>
      <Link
        href="/dashboard/status"
        className={`${baseClassName} ${
          activeView === "status" ? activeClassName : inactiveClassName
        }`}
      >
        상태 요약
      </Link>
    </nav>
  );
}

function DashboardTitle() {
  return (
    <div className="flex items-center justify-center gap-3">
      <h1 className="text-[28px] font-extrabold text-black sm:text-[35px]">
        운영자 대시보드
      </h1>
      <Image
        src="/figma/search-icon.png"
        alt=""
        width={44}
        height={44}
        className="size-9 object-contain sm:size-11"
      />
    </div>
  );
}

function Feedback({ state }: { state: ActionState }) {
  const fieldErrors = Object.values(state.fieldErrors ?? {}).flatMap(
    (errors) => errors ?? [],
  );

  if (!state.message && !fieldErrors.length) {
    return null;
  }

  return (
    <div className="mt-4 rounded-[18px] bg-[#fff9db] px-4 py-3 text-sm font-semibold text-[#8f7700]">
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

function SessionCreateModal({
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
  const missingRequirements = [
    !data.villages.length ? "마을" : null,
    !data.programs.length ? "사업" : null,
    !data.classes.length ? "수업" : null,
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30 px-5 py-8">
      <section className="w-full max-w-xl rounded-[28px] bg-[#fffdf8] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-2xl font-extrabold text-black">세션 만들기</p>
            <p className="mt-2 text-sm leading-6 text-[#555555]">
              날짜, 마을, 사업, 수업을 정하면 강사 작업공간이 바로 열립니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#d8cdbb] px-3 py-1.5 text-sm font-semibold text-[#555555]"
          >
            닫기
          </button>
        </div>

        {missingRequirements.length ? (
          <p className="mt-5 rounded-[18px] bg-[#fff4c2] px-4 py-3 text-sm leading-6 text-[#6f5a00]">
            아직 {missingRequirements.join(", ")} 정보가 부족합니다. 설정에서
            기본 데이터를 채운 뒤 세션을 만들 수 있습니다.
          </p>
        ) : null}

        <form action={createAction} className="mt-5 grid gap-3">
          <label className="grid gap-2 text-sm font-semibold text-black">
            날짜
            <input
              type="date"
              name="sessionDate"
              className="rounded-[16px] border border-[#e1d6c5] bg-white px-4 py-3 text-sm outline-none"
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-black">
            마을
            <select
              name="villageId"
              className="rounded-[16px] border border-[#e1d6c5] bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="">마을 선택</option>
              {data.villages.map((village) => (
                <option key={village.id} value={village.id}>
                  {village.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-black">
            사업
            <select
              name="programId"
              className="rounded-[16px] border border-[#e1d6c5] bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="">사업 선택</option>
              {data.programs.map((program) => (
                <option key={program.id} value={program.id}>
                  {program.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-black">
            수업
            <select
              name="classId"
              className="rounded-[16px] border border-[#e1d6c5] bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="">수업 선택</option>
              {data.classes.map((klass) => (
                <option key={klass.id} value={klass.id}>
                  {klass.name} · {klass.programName ?? "사업 미연결"} ·{" "}
                  {klass.villageName ?? "마을 미연결"}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-black">
            강사
            <select
              name="teacherId"
              className="rounded-[16px] border border-[#e1d6c5] bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="">강사 나중에 할당</option>
              {data.teacherAssignments.map((assignment) => (
                <option
                  key={`${assignment.classId}-${assignment.teacherId}`}
                  value={assignment.teacherId}
                >
                  {assignment.className} ·{" "}
                  {assignment.teacherName ?? assignment.teacherEmail}
                </option>
              ))}
            </select>
          </label>
          <button className="mt-2 rounded-[18px] border-2 border-[#fcce00] bg-[#ffec1d] px-4 py-4 text-base font-extrabold text-black shadow-[0_4px_4px_rgba(0,0,0,0.20)]">
            세션 생성
          </button>
        </form>
        <Feedback state={createState} />
      </section>
    </div>
  );
}

function NextActionsView({ data }: { data: SessionDashboardData }) {
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  return (
    <>
      <section className="mx-auto mt-10 w-full max-w-[1170px] bg-white px-8 py-10 sm:px-[62px] sm:py-[61px]">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-x-[60px] lg:gap-y-[42px]">
          {actionCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className={nextActionCardClassName}
            >
              {card.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => setIsSessionModalOpen(true)}
            className={`${nextActionCardClassName} sm:text-[28px]`}
          >
            세션 만들기
          </button>
        </div>
        <p className="mt-[86px] text-center text-[18px] font-semibold text-[#c5a100] sm:text-[25px]">
          운영자가 세션을 만들면 강사 작업공간이 바로 열립니다.
        </p>
      </section>
      {isSessionModalOpen ? (
        <SessionCreateModal
          data={data}
          onClose={() => setIsSessionModalOpen(false)}
        />
      ) : null}
    </>
  );
}

function StatusSummaryView({
  data,
  dashboard,
  sessionManagementRecords = [],
}: {
  data: SessionDashboardData;
  dashboard: DashboardQueryData;
  sessionManagementRecords?: SessionManagementRecord[];
}) {
  const [existingParticipantState, existingParticipantAction] = useActionState(
    addExistingSessionParticipantAction,
    initialState,
  );
  const [newParticipantState, newParticipantAction] = useActionState(
    createSessionParticipantAction,
    initialState,
  );
  const [removeParticipantState, removeParticipantAction] = useActionState(
    removeSessionParticipantAction,
    initialState,
  );
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const isExampleMode = data.recentSessions.length === 0;
  const sessions =
    !isExampleMode
      ? data.recentSessions
      : [
          {
            id: "example-session",
            sessionDate: "2026-05-01",
            className: "예시 수업",
            villageName: "예시 마을",
            programName: "예시 사업",
            teacherName: "예시선생",
            teacherEmail: null,
            snapshotCount: 0,
            submittedAt: null,
          },
        ];
  const [selectedSessionId, setSelectedSessionId] = useState(sessions[0].id);
  const selectedSession =
    sessions.find((session) => session.id === selectedSessionId) ?? sessions[0];
  const selectedManagement = sessionManagementRecords.find(
    (record) => record.id === selectedSession.id,
  );
  const selectedTeacherAssignment = data.teacherAssignments.find(
      (assignment) =>
        assignment.className === selectedSession.className &&
        (assignment.teacherName === selectedSession.teacherName ||
          assignment.teacherEmail === selectedSession.teacherEmail),
    ) ?? data.teacherAssignments[0];
  const selectedTeacherValue =
    selectedManagement?.teacherId ?? selectedTeacherAssignment?.teacherId ?? "";
  const teacherOptions = selectedManagement?.teachers.length
    ? selectedManagement.teachers.map((teacher) => ({
        id: teacher.userId,
        label: teacher.displayName ?? teacher.email,
      }))
    : data.teacherAssignments.map((assignment) => ({
        id: assignment.teacherId,
        label: assignment.teacherName ?? assignment.teacherEmail,
      }));
  const latestActivity =
    dashboard.recentUpdates[0] ??
    dashboard.recentSubmissions[0] ??
    dashboard.pendingSessions[0];
  const totalSessions = dashboard.submissionOverview.totalSessions;
  const visibleParticipants = selectedManagement?.snapshots ?? [];
  const availableParticipants = selectedManagement?.participants ?? [];

  return (
    <section className="mx-auto mt-10 w-full max-w-[1170px] bg-white px-5 py-9 sm:px-[62px] sm:py-[70px]">
      <p className="mb-3 text-right text-base font-semibold text-[#555555] sm:text-[20px]">
        세션 총 {totalSessions}개
      </p>

      <div className="grid gap-3">
        {sessions.map((session) => {
          const isSelected = session.id === selectedSession.id;

          return (
            <button
              key={session.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setSelectedSessionId(session.id)}
              className={`flex min-h-[63px] w-full items-center justify-between border-2 px-4 text-left text-[22px] font-semibold text-black shadow-[0_4px_4px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 sm:px-6 sm:text-[25px] ${
                isSelected
                  ? "border-[#555555] bg-white"
                  : "border-[#fcce00] bg-[#fffdf8]"
              }`}
            >
              <span>{session.className}</span>
              <span className="text-2xl leading-none text-black">⌄</span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-[18px] font-semibold text-[#c5a100] sm:text-[20px]">
        {formatSessionDate(selectedSession.sessionDate)} ·{" "}
        {selectedSession.programName} · {selectedSession.villageName}
      </p>

      <div className="mt-6 grid gap-9 lg:grid-cols-2 lg:gap-[41px]">
        <section className="min-h-[248px] rounded-[20px] border-2 border-[#fcce00] bg-white px-5 py-6 sm:min-h-[353px] sm:px-7">
          <h2 className="text-[23px] font-extrabold text-black sm:text-[25px]">
            강사 할당
          </h2>
          <select
            aria-label="강사 선택"
            value={selectedTeacherValue}
            onChange={() => undefined}
            className="mt-5 h-[52px] w-full rounded-[8px] border border-[#555555] bg-white px-4 text-[18px] font-semibold text-black outline-none sm:h-[63px] sm:text-[23px]"
          >
            {teacherOptions.length ? (
              teacherOptions.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.label}
                </option>
              ))
            ) : (
              <option value="">예시선생</option>
            )}
          </select>
          <button className="mt-5 h-[52px] w-full rounded-[25px] border border-[#fcce00] bg-[#ffec1d] text-[20px] font-extrabold text-black shadow-[0_4px_4px_rgba(0,0,0,0.25)] sm:h-[63px] sm:text-[23px]">
            강사 저장
          </button>
        </section>

        <section className="min-h-[248px] rounded-[20px] border-2 border-[#fcce00] bg-white px-5 py-6 sm:min-h-[353px] sm:px-7">
          <h2 className="text-[23px] font-extrabold text-black sm:text-[25px]">
            세션 상태
          </h2>
          <p className="mt-5 rounded-[25px] bg-[#f6f1e8] px-5 py-4 text-[18px] font-semibold text-black sm:text-[23px]">
            {selectedSession.submittedAt ? "제출 완료" : "아직 제출 전"}
          </p>
          <p className="mt-5 rounded-[25px] bg-[#f6f1e8] px-5 py-4 text-[18px] font-semibold text-black sm:text-[23px]">
            최근 변경:{" "}
            {latestActivity
              ? formatDateTimeLabel(latestActivity.updatedAt)
              : "5월 2일 오전 01:21"}
          </p>
          <Link
            href={`/dashboard/sessions/${selectedSession.id}`}
            className="mt-5 flex h-[52px] w-full items-center justify-center rounded-[25px] border border-[#555555] bg-white text-[20px] font-extrabold text-black sm:h-[63px] sm:text-[23px]"
          >
            기록 상세 보기
          </Link>
        </section>
      </div>

      <section className="mt-[38px] rounded-[20px] border-2 border-[#fcce00] bg-white px-5 py-6 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[23px] font-extrabold text-black sm:text-[25px]">
            세션 참여자
          </h2>
          <button
            type="button"
            aria-label="참여자 추가"
            disabled={isExampleMode}
            onClick={() => setIsAddPanelOpen((isOpen) => !isOpen)}
            className="flex size-9 items-center justify-center rounded-full border-2 border-[#fcce00] bg-white text-[28px] font-extrabold leading-none text-black transition hover:bg-[#ffec1d] focus-visible:bg-[#ffec1d] focus-visible:outline-none disabled:cursor-not-allowed disabled:border-[#d8cdbb] disabled:text-[#9d9a95] disabled:hover:bg-white"
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>

        {isExampleMode ? (
          <p className="mt-4 rounded-[18px] bg-[#fff9db] px-4 py-3 text-[16px] font-semibold text-[#8f7700]">
            세션을 먼저 만든 뒤 참여자를 한 명씩 추가할 수 있습니다.
          </p>
        ) : null}

        {isAddPanelOpen ? (
          <div className="mt-5 grid gap-4 rounded-[20px] bg-[#fffdf8] p-4 lg:grid-cols-2">
            <form action={existingParticipantAction} className="grid gap-3">
              <input type="hidden" name="sessionId" value={selectedSession.id} />
              <select
                aria-label="기존 참여자 선택"
                name="participantId"
                className="h-[52px] rounded-[14px] border border-[#555555] bg-white px-4 text-base font-semibold text-black outline-none"
              >
                <option value="">참여자 선택</option>
                {availableParticipants.map((participant) => (
                  <option key={participant.id} value={participant.id}>
                    {participant.fullName}
                    {participant.note ? ` · ${participant.note}` : ""}
                  </option>
                ))}
              </select>
              <button className="h-[52px] rounded-[25px] border border-[#fcce00] bg-[#ffec1d] text-base font-extrabold text-black shadow-[0_4px_4px_rgba(0,0,0,0.18)]">
                기존 참여자 추가
              </button>
              <Feedback state={existingParticipantState} />
            </form>

            <form action={newParticipantAction} className="grid gap-3">
              <input type="hidden" name="sessionId" value={selectedSession.id} />
              <input
                name="fullName"
                placeholder="예: 홍길동"
                className="h-[52px] rounded-[14px] border border-[#555555] bg-white px-4 text-base font-semibold text-black outline-none"
              />
              <textarea
                name="note"
                placeholder="참여자 메모"
                className="min-h-[82px] rounded-[14px] border border-[#555555] bg-white px-4 py-3 text-base font-semibold text-black outline-none"
              />
              <button className="h-[52px] rounded-[25px] border border-[#fcce00] bg-[#ffec1d] text-base font-extrabold text-black shadow-[0_4px_4px_rgba(0,0,0,0.18)]">
                새 참여자 추가
              </button>
              <Feedback state={newParticipantState} />
            </form>
          </div>
        ) : null}

        {visibleParticipants.length ? (
          <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visibleParticipants.map((participant) => (
              <div
                key={participant.id}
                className="relative flex min-h-[106px] flex-col items-center justify-center rounded-[18px] bg-[#f6f1e8] px-4 py-5 text-center sm:min-h-[125px] sm:rounded-[25px]"
              >
                <form action={removeParticipantAction}>
                  <input type="hidden" name="sessionId" value={selectedSession.id} />
                  <input type="hidden" name="snapshotId" value={participant.id} />
                  <button
                    aria-label={`${participant.fullName} 제거`}
                    disabled={!selectedManagement}
                    className="absolute right-3 top-3 flex size-[16px] items-center justify-center rounded-full bg-[#ff4b4b] text-[12px] font-bold leading-none text-white transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff4b4b]"
                  >
                    -
                  </button>
                </form>
                <p className="text-[21px] font-extrabold text-black sm:text-[23px]">
                  {participant.fullName}
                </p>
                <p className="mt-3 text-[16px] font-medium text-[#555555] sm:text-[20px]">
                  {participant.attendanceStatus ?? "미입력"} ·{" "}
                  {participant.note ?? "메모 없음"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-[18px] bg-[#f6f1e8] px-4 py-8 text-center text-[18px] font-semibold text-[#555555]">
            아직 세션 참여자가 없습니다.
          </p>
        )}
        <Feedback state={removeParticipantState} />
      </section>
    </section>
  );
}

export function DashboardScreen({
  data,
  dashboard,
  sessionManagementRecords,
  activeView = "actions",
}: {
  data: SessionDashboardData;
  dashboard: DashboardQueryData;
  sessionManagementRecords?: SessionManagementRecord[];
  activeView?: "actions" | "status";
}) {
  return (
    <main className="flex min-h-screen flex-1 flex-col bg-[#f6f1e8] px-4 pb-8 sm:px-8">
      <div className="mx-auto mt-8 w-full max-w-[1347px] rounded-[34px] bg-[#fffdf8] px-5 py-10 shadow-[0_8px_28px_rgba(60,44,20,0.04)] sm:mt-10 sm:rounded-[50px] sm:px-14 sm:py-12 lg:min-h-[760px]">
        <DashboardTitle />
        <DashboardTabs activeView={activeView} />
        {activeView === "actions" ? (
          <NextActionsView data={data} />
        ) : (
          <StatusSummaryView
            data={data}
            dashboard={dashboard}
            sessionManagementRecords={sessionManagementRecords}
          />
        )}
      </div>
    </main>
  );
}
