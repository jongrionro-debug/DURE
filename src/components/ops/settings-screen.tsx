"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  createClassAction,
  createParticipantAction,
  createProgramAction,
  createVillageAction,
  deleteParticipantAction,
} from "@/server/actions/settings";

type SettingsOverview = {
  villages: Array<{ id: string; name: string; isPrimary: boolean }>;
  programs: Array<{ id: string; name: string; description: string | null }>;
  classes: Array<{
    id: string;
    name: string;
    description: string | null;
    programName: string | null;
    villageName: string | null;
  }>;
  participants: Array<{
    id: string;
    fullName: string;
    note: string | null;
    className: string | null;
  }>;
};

type ActionState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const initialState: ActionState = {};

const inputClassName =
  "rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition placeholder:text-[color:rgba(107,102,94,0.72)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-surface)]";

const textareaClassName = `${inputClassName} min-h-24 resize-y`;

const primaryButtonClassName =
  "rounded-full bg-[var(--color-accent)] px-4 py-3 text-sm font-semibold text-[var(--color-accent-ink)] transition hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-surface)]";

const secondaryButtonClassName =
  "rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]";

function SettingsStatChips({ data }: { data: SettingsOverview }) {
  const stats = [
    ["마을", data.villages.length],
    ["사업", data.programs.length],
    ["수업", data.classes.length],
    ["참여자", data.participants.length],
  ] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {stats.map(([label, value], index) => (
        <span
          key={label}
          className={`rounded-full px-3 py-2 text-xs font-semibold ${
            index === 0
              ? "bg-[var(--color-accent-surface)] text-[var(--color-accent-ink)]"
              : "bg-[var(--color-surface-alt)] text-[var(--color-text-secondary)]"
          }`}
        >
          {label} {value}
        </span>
      ))}
    </div>
  );
}

function SettingsChannelNav() {
  const channels = [
    ["마을", "지역 단위", true],
    ["사업", "운영 사업", false],
    ["수업", "사업과 마을 연결", false],
    ["참여자 명단", "수업별 명단", false],
  ] as const;

  return (
    <nav aria-label="설정 항목" className="space-y-2">
      {channels.map(([label, description, active]) => (
        <div
          key={label}
          className={`rounded-[20px] px-4 py-3 transition-colors ${
            active
              ? "bg-[var(--color-accent-surface)] text-[var(--color-accent-ink)]"
              : "bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)]"
          }`}
        >
          <p className="text-sm font-semibold">{label}</p>
          <p className="mt-1 text-xs leading-5 text-[color:rgba(31,26,23,0.68)]">
            {description}
          </p>
        </div>
      ))}
    </nav>
  );
}

function WorkspaceShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] bg-[var(--color-surface)] p-5">
      <div>
        <h2 className="text-xl font-bold tracking-[-0.03em] text-[var(--color-text-primary)]">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
          {description}
        </p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ItemBubble({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[18px] bg-[var(--color-surface-alt)] px-4 py-3 ${className}`.trim()}
    >
      {children}
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
    <div className="rounded-[18px] bg-[var(--color-surface-alt)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
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

export function SettingsScreen({ data }: { data: SettingsOverview }) {
  const [villageState, villageAction] = useActionState(
    createVillageAction,
    initialState,
  );
  const [programState, programAction] = useActionState(
    createProgramAction,
    initialState,
  );
  const [classState, classAction] = useActionState(
    createClassAction,
    initialState,
  );
  const [participantState, participantAction] = useActionState(
    createParticipantAction,
    initialState,
  );
  const [participantDeleteState, participantDeleteAction] = useActionState(
    deleteParticipantAction,
    initialState,
  );

  return (
    <main className="flex min-h-screen flex-1 flex-col bg-[var(--color-background)]">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10 lg:py-10">
        <header className="flex flex-col gap-5 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-panel sm:p-7">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] transition hover:-translate-y-0.5"
            >
              <span aria-hidden="true">&lt;</span>
              뒤로 가기
            </Link>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
                Ops settings
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-[var(--color-text-primary)] sm:text-4xl">
                운영 기본정보 설정
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)] sm:text-base">
                마을, 사업, 수업, 참여자 명단을 순서대로 정리합니다.
              </p>
            </div>
            <SettingsStatChips data={data} />
          </div>
        </header>

        <section className="grid gap-5 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-panel lg:grid-cols-[260px_minmax(0,1fr)] lg:p-5">
          <aside className="rounded-[24px] bg-[var(--color-surface-alt)] p-3">
            <SettingsChannelNav />
          </aside>

          <div className="grid gap-4">
            <WorkspaceShell
              title="마을"
              description="기관의 지역 단위를 먼저 만들고 이후 수업과 연결합니다."
            >
              <div className="space-y-2">
                {data.villages.length ? (
                  data.villages.map((village) => (
                    <ItemBubble
                      key={village.id}
                      className="text-sm text-[var(--color-text-primary)]"
                    >
                      {village.name}
                      {village.isPrimary ? " · 첫 마을" : ""}
                    </ItemBubble>
                  ))
                ) : (
                  <ItemBubble className="text-sm text-[var(--color-text-secondary)]">
                    아직 마을이 없습니다. 첫 마을부터 추가해 주세요.
                  </ItemBubble>
                )}
              </div>
              <form action={villageAction} className="mt-4 grid gap-3">
                <input
                  name="name"
                  placeholder="예: 동네 배움터"
                  className={inputClassName}
                />
                <button className={primaryButtonClassName}>마을 추가</button>
              </form>
              <div className="mt-3">
                <Feedback state={villageState} />
              </div>
            </WorkspaceShell>

            <WorkspaceShell
              title="사업"
              description="기관이 운영하는 사업 또는 사업 단위를 관리합니다."
            >
              <div className="space-y-2">
                {data.programs.length ? (
                  data.programs.map((program) => (
                    <ItemBubble key={program.id}>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {program.name}
                      </p>
                      {program.description ? (
                        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                          {program.description}
                        </p>
                      ) : null}
                    </ItemBubble>
                  ))
                ) : (
                  <ItemBubble className="text-sm text-[var(--color-text-secondary)]">
                    아직 사업이 없습니다. 첫 사업을 추가해 주세요.
                  </ItemBubble>
                )}
              </div>
              <form action={programAction} className="mt-4 grid gap-3">
                <input
                  name="name"
                  placeholder="예: 문해 사업"
                  className={inputClassName}
                />
                <textarea
                  name="description"
                  placeholder="사업 설명"
                  className={textareaClassName}
                />
                <button className={primaryButtonClassName}>사업 추가</button>
              </form>
              <div className="mt-3">
                <Feedback state={programState} />
              </div>
            </WorkspaceShell>

            <WorkspaceShell
              title="수업"
              description="사업과 마을을 선택적으로 연결해 실제 운영 수업을 만듭니다."
            >
              <div className="space-y-2">
                {data.classes.length ? (
                  data.classes.map((klass) => (
                    <ItemBubble key={klass.id}>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                        {klass.name}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                        {klass.programName ?? "사업 미연결"} ·{" "}
                        {klass.villageName ?? "마을 미연결"}
                      </p>
                    </ItemBubble>
                  ))
                ) : (
                  <ItemBubble className="text-sm text-[var(--color-text-secondary)]">
                    아직 수업이 없습니다. 운영할 수업을 추가해 주세요.
                  </ItemBubble>
                )}
              </div>
              <form action={classAction} className="mt-4 grid gap-3">
                <input
                  name="name"
                  placeholder="예: 기초 문해 수업"
                  className={inputClassName}
                />
                <textarea
                  name="description"
                  placeholder="수업 설명"
                  className={textareaClassName}
                />
                <select name="programId" className={inputClassName}>
                  <option value="">사업 선택 안 함</option>
                  {data.programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
                <select name="villageId" className={inputClassName}>
                  <option value="">마을 선택 안 함</option>
                  {data.villages.map((village) => (
                    <option key={village.id} value={village.id}>
                      {village.name}
                    </option>
                  ))}
                </select>
                <button className={primaryButtonClassName}>수업 추가</button>
              </form>
              <div className="mt-3">
                <Feedback state={classState} />
              </div>
            </WorkspaceShell>

            <WorkspaceShell
              title="참여자 명단"
              description="수업에 연결하거나 비연결 상태로 먼저 명단을 쌓을 수 있습니다."
            >
              <div className="space-y-2">
                {data.participants.length ? (
                  data.participants.map((participant) => (
                    <ItemBubble key={participant.id}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {participant.fullName}
                          </p>
                          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                            {participant.className ?? "수업 미연결"}
                            {participant.note ? ` · ${participant.note}` : ""}
                          </p>
                        </div>
                        <form action={participantDeleteAction}>
                          <input
                            type="hidden"
                            name="participantId"
                            value={participant.id}
                          />
                          <button className={secondaryButtonClassName}>
                            삭제
                          </button>
                        </form>
                      </div>
                    </ItemBubble>
                  ))
                ) : (
                  <ItemBubble className="text-sm text-[var(--color-text-secondary)]">
                    아직 참여자 명단이 없습니다. 첫 참여자를 추가해 주세요.
                  </ItemBubble>
                )}
              </div>
              <form action={participantAction} className="mt-4 grid gap-3">
                <input
                  name="fullName"
                  placeholder="예: 홍길동"
                  className={inputClassName}
                />
                <textarea
                  name="note"
                  placeholder="참여자 메모"
                  className={textareaClassName}
                />
                <select name="classId" className={inputClassName}>
                  <option value="">수업 선택 안 함</option>
                  {data.classes.map((klass) => (
                    <option key={klass.id} value={klass.id}>
                      {klass.name}
                    </option>
                  ))}
                </select>
                <button className={primaryButtonClassName}>
                  참여자 추가
                </button>
              </form>
              <div className="mt-3 grid gap-3">
                <Feedback state={participantState} />
                <Feedback state={participantDeleteState} />
              </div>
            </WorkspaceShell>
          </div>
        </section>
      </div>
    </main>
  );
}
