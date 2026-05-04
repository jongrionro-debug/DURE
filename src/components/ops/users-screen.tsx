"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import {
  approveMemberAction,
  assignTeacherAction,
  createInviteAction,
  updateMemberRoleAction,
} from "@/server/actions/memberships";

type MemberRole = "platform_admin" | "organization_admin" | "teacher";

type UserManagementData = {
  members: Array<{
    membershipId: string;
    userId: string;
    email: string;
    displayName: string | null;
    role: MemberRole;
    approvedAt: Date | null;
  }>;
  invites: Array<{
    id: string;
    email: string;
    role: MemberRole;
    inviteToken: string;
    expiresAt: Date;
    acceptedAt: Date | null;
  }>;
  assignments: Array<{
    id: string;
    className: string;
    userEmail: string;
  }>;
  classes: Array<{
    id: string;
    name: string;
  }>;
};

type ActionState = {
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

type IconName =
  | "bell"
  | "book"
  | "check"
  | "chevron"
  | "clock"
  | "copy"
  | "mail"
  | "more"
  | "person"
  | "search"
  | "send"
  | "userPlus"
  | "users";

const initialState: ActionState = {};

const roleLabels: Record<MemberRole, string> = {
  platform_admin: "플랫폼 관리자",
  organization_admin: "기관 관리자",
  teacher: "강사",
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
    case "bell":
      return (
        <svg {...common}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H7a3 3 0 0 0-3 3z" />
          <path d="M4 5.5V22" />
          <path d="M8 7h8" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <path d="m7 12 3 3 7-7" />
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...common}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "copy":
      return (
        <svg {...common}>
          <rect x="8" y="8" width="11" height="11" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );
    case "more":
      return (
        <svg {...common}>
          <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m16.5 16.5 4 4" />
        </svg>
      );
    case "send":
      return (
        <svg {...common}>
          <path d="m22 2-7 20-4-9-9-4z" />
          <path d="M22 2 11 13" />
        </svg>
      );
    case "userPlus":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M19 8v6" />
          <path d="M22 11h-6" />
        </svg>
      );
    case "users":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "person":
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      );
  }
}

function Feedback({ state }: { state: ActionState }) {
  return state.message ? (
    <p className="mt-3 rounded-[16px] bg-[var(--color-surface-alt)] px-4 py-3 text-sm leading-6 text-[var(--color-text-secondary)]">
      {state.message}
    </p>
  ) : null;
}

function CopyInviteTokenButton({ token }: { token: string }) {
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard.writeText(token)}
      className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold text-[var(--color-text-primary)] transition hover:bg-[var(--color-surface-alt)]"
    >
      <Icon name="copy" className="h-4 w-4" />
      토큰 복사
    </button>
  );
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
  tone?: "green" | "yellow";
}) {
  return (
    <section className="flex min-h-[96px] items-center gap-4 rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 shadow-panel">
      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
          tone === "yellow"
            ? "bg-[var(--color-accent-surface)] text-[var(--color-warning)]"
            : "bg-[#DFEAD4] text-[#4E7B32]"
        }`}
      >
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <div>
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
          {label}
        </p>
        <p className="mt-1 text-3xl font-bold tracking-[-0.04em] text-[var(--color-text-primary)]">
          {value}
        </p>
      </div>
    </section>
  );
}

function StatusBadge({ approvedAt }: { approvedAt: Date | null }) {
  if (approvedAt) {
    return (
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#3F7A2A]">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#5F8F3F] text-white">
          <Icon name="check" className="h-3.5 w-3.5" />
        </span>
        승인 완료
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#D58A00]">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-[#E59A13] text-white">
        <Icon name="clock" className="h-3.5 w-3.5" />
      </span>
      승인 대기
    </span>
  );
}

function FieldShell({
  icon,
  children,
}: {
  icon: IconName;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      {children}
    </div>
  );
}

export function UsersScreen({ data }: { data: UserManagementData }) {
  const [inviteState, inviteAction] = useActionState(
    createInviteAction,
    initialState,
  );
  const [roleState, roleAction] = useActionState(
    updateMemberRoleAction,
    initialState,
  );
  const [approveState, approveAction] = useActionState(
    approveMemberAction,
    initialState,
  );
  const [assignmentState, assignmentAction] = useActionState(
    assignTeacherAction,
    initialState,
  );
  const [query, setQuery] = useState("");
  const [memberFilter, setMemberFilter] = useState<
    "all" | "pending" | "admin" | "teacher"
  >("all");

  const teachers = data.members.filter(
    (member) => member.role === "teacher" && member.approvedAt,
  );
  const pendingCount = data.members.filter((member) => !member.approvedAt).length;

  const filteredMembers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return data.members.filter((member) => {
      const matchesQuery =
        !normalizedQuery ||
        member.email.toLowerCase().includes(normalizedQuery) ||
        (member.displayName ?? "").toLowerCase().includes(normalizedQuery);
      const matchesFilter =
        memberFilter === "all" ||
        (memberFilter === "pending" && !member.approvedAt) ||
        (memberFilter === "admin" && member.role === "organization_admin") ||
        (memberFilter === "teacher" && member.role === "teacher");

      return matchesQuery && matchesFilter;
    });
  }, [data.members, memberFilter, query]);

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <div className="mx-auto w-full max-w-[1500px] px-5 py-5 sm:px-8 lg:px-11">
        <header className="flex items-center">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-semibold shadow-panel transition hover:bg-[var(--color-surface-alt)]"
          >
            <span aria-hidden="true">←</span>
            대시보드
          </Link>
        </header>

        <section className="mt-12">
          <h1 className="text-4xl font-bold tracking-[-0.04em] sm:text-5xl">
            사용자 관리
          </h1>
          <p className="mt-4 text-base font-medium text-[var(--color-text-secondary)]">
            초대, 승인, 역할 변경, 수업 배정을 한 화면에서 관리합니다.
          </p>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon="users" label="전체 멤버" value={data.members.length} />
          <MetricCard
            icon="clock"
            label="승인 대기"
            value={pendingCount}
            tone="yellow"
          />
          <MetricCard icon="person" label="강사" value={teachers.length} />
          <MetricCard
            icon="book"
            label="배정된 수업"
            value={data.assignments.length}
          />
        </section>

        <div className="mt-7 grid gap-7 xl:grid-cols-[minmax(0,1fr)_365px]">
          <section className="overflow-hidden rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-panel">
            <div
              role="tablist"
              aria-label="사용자 관리 메뉴"
              className="border-b border-[var(--color-border)]"
            >
              <button
                type="button"
                role="tab"
                aria-selected="true"
                className="inline-flex h-14 w-full items-center justify-center gap-2 border-b-2 border-b-[#4F7C32] text-sm font-semibold text-[#4F7C32] sm:w-[33.333%]"
              >
                <Icon name="users" className="h-5 w-5" />
                멤버
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <FieldShell icon="search">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="이름 또는 이메일 검색"
                    className="h-13 w-full rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] pl-12 pr-4 text-sm font-medium outline-none transition placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-surface)] lg:w-[285px]"
                  />
                </FieldShell>

                <div className="flex flex-wrap gap-3">
                  {[
                    ["all", "전체"],
                    ["pending", "승인 대기"],
                    ["admin", "관리자"],
                    ["teacher", "강사"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setMemberFilter(
                          value as "all" | "pending" | "admin" | "teacher",
                        )
                      }
                      className={`h-11 rounded-full border px-5 text-sm font-semibold transition ${
                        memberFilter === value
                          ? "border-[#4F7C32] bg-[var(--color-surface)] text-[#315D1E]"
                          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-alt)]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

              </div>

              <div className="mt-7">
                <h2 className="text-xl font-bold tracking-[-0.03em]">멤버 목록</h2>
                <div className="mt-4 overflow-x-auto rounded-[10px] border border-[var(--color-border)]">
                  <table className="w-full min-w-[820px] border-collapse bg-[var(--color-surface)] text-left">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] text-xs font-bold text-[var(--color-text-secondary)]">
                        <th className="px-6 py-4">이름</th>
                        <th className="px-6 py-4">이메일</th>
                        <th className="px-6 py-4">역할</th>
                        <th className="px-6 py-4">상태</th>
                        <th className="px-6 py-4">작업</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.length ? (
                        filteredMembers.map((member) => (
                          <tr
                            key={member.membershipId}
                            className="border-b border-[var(--color-border)] last:border-b-0"
                          >
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#DFEAD4] text-[#5C813E]">
                                  <Icon name="person" className="h-5 w-5" />
                                </span>
                                <span className="font-bold">
                                  {member.displayName ?? member.email}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-sm text-[#3F3C37]">
                              {member.email}
                            </td>
                            <td className="px-6 py-5">
                              <span className="inline-flex rounded-[8px] bg-[#DFEAD4] px-3 py-2 text-sm font-semibold text-[#4F7035]">
                                {roleLabels[member.role]}
                              </span>
                            </td>
                            <td className="px-6 py-5">
                              <StatusBadge approvedAt={member.approvedAt} />
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                {!member.approvedAt ? (
                                  <form action={approveAction}>
                                    <input
                                      type="hidden"
                                      name="membershipId"
                                      value={member.membershipId}
                                    />
                                    <button className="h-9 rounded-[8px] border border-[#4F7C32] bg-[var(--color-surface)] px-4 text-sm font-bold text-[#315D1E] transition hover:bg-[#EEF5E9]">
                                      접근 승인
                                    </button>
                                  </form>
                                ) : null}
                                <form action={roleAction} className="flex gap-2">
                                  <input
                                    type="hidden"
                                    name="membershipId"
                                    value={member.membershipId}
                                  />
                                  <select
                                    name="role"
                                    defaultValue={member.role}
                                    aria-label={`${member.displayName ?? member.email} 역할 선택`}
                                    className="h-9 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm font-semibold text-[var(--color-text-primary)] outline-none"
                                  >
                                    <option value="organization_admin">
                                      기관 관리자
                                    </option>
                                    <option value="teacher">강사</option>
                                  </select>
                                  <button className="h-9 rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-bold transition hover:bg-[var(--color-surface-alt)]">
                                    역할 변경
                                  </button>
                                </form>
                                <button
                                  type="button"
                                  aria-label={`${member.displayName ?? member.email} 더보기`}
                                  className="grid h-9 w-9 place-items-center rounded-full text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-alt)]"
                                >
                                  <Icon name="more" className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-6 py-10 text-center text-sm font-medium text-[var(--color-text-secondary)]"
                          >
                            조건에 맞는 멤버가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <Feedback state={roleState} />
              <Feedback state={approveState} />
            </div>
          </section>

          <aside className="space-y-4">
            <section
              id="invite-panel"
              className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-panel"
            >
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--color-accent-surface)] text-[#B17800]">
                  <Icon name="mail" className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-xl font-bold tracking-[-0.03em]">
                    초대 보내기
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                    초대 토큰을 만들고 수락 상태를 추적합니다.
                  </p>
                </div>
              </div>

              <form action={inviteAction} className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-bold">
                  이메일
                  <FieldShell icon="mail">
                    <input
                      name="email"
                      placeholder="이메일을 입력하세요"
                      className="h-10 w-full rounded-[7px] border border-[var(--color-border)] bg-[var(--color-surface)] pl-11 pr-4 text-sm font-medium outline-none placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-surface)]"
                    />
                  </FieldShell>
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  역할
                  <FieldShell icon="person">
                    <select
                      name="role"
                      defaultValue="teacher"
                      className="h-10 w-full appearance-none rounded-[7px] border border-[var(--color-border)] bg-[var(--color-surface)] pl-11 pr-10 text-sm font-medium outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-surface)]"
                    >
                      <option value="teacher">강사</option>
                      <option value="organization_admin">기관 관리자</option>
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-primary)]">
                      ⌄
                    </span>
                  </FieldShell>
                </label>
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] bg-[var(--color-accent)] text-sm font-bold text-[var(--color-accent-ink)] shadow-[0_8px_18px_rgba(204,166,0,0.18)] transition hover:brightness-[0.98]">
                  <Icon name="send" className="h-5 w-5" />
                  초대 보내기
                </button>
              </form>
              <Feedback state={inviteState} />

              <div className="mt-5 space-y-3">
                {data.invites.length ? (
                  data.invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="rounded-[12px] bg-[var(--color-surface-alt)] px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold">{invite.email}</p>
                          <p className="mt-1 text-xs font-medium text-[var(--color-text-secondary)]">
                            {roleLabels[invite.role]} ·{" "}
                            {invite.acceptedAt ? "수락 완료" : "수락 대기"}
                          </p>
                        </div>
                        <CopyInviteTokenButton token={invite.inviteToken} />
                      </div>
                      <code className="mt-3 block max-w-full break-all rounded-[10px] bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
                        {invite.inviteToken}
                      </code>
                    </div>
                  ))
                ) : (
                  <p className="rounded-[12px] bg-[var(--color-surface-alt)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                    아직 생성된 초대가 없습니다.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-[16px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-panel">
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#DFEAD4] text-[#4F7C32]">
                  <Icon name="book" className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-xl font-bold tracking-[-0.03em]">
                    강사 수업 배정
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                    강사에게 수업을 배정하고 관리합니다.
                  </p>
                </div>
              </div>

              <form action={assignmentAction} className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-bold">
                  강사 선택
                  <FieldShell icon="person">
                    <select
                      name="userId"
                      className="h-10 w-full appearance-none rounded-[7px] border border-[var(--color-border)] bg-[var(--color-surface)] pl-11 pr-10 text-sm font-medium outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-surface)]"
                    >
                      <option value="">강사를 선택하세요</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.userId} value={teacher.userId}>
                          {teacher.displayName ?? teacher.email}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-primary)]">
                      ⌄
                    </span>
                  </FieldShell>
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  수업 선택
                  <FieldShell icon="book">
                    <select
                      name="classId"
                      className="h-10 w-full appearance-none rounded-[7px] border border-[var(--color-border)] bg-[var(--color-surface)] pl-11 pr-10 text-sm font-medium outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-surface)]"
                    >
                      <option value="">수업을 선택하세요</option>
                      {data.classes.map((klass) => (
                        <option key={klass.id} value={klass.id}>
                          {klass.name}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-primary)]">
                      ⌄
                    </span>
                  </FieldShell>
                </label>
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-[7px] bg-[var(--color-accent)] text-sm font-bold text-[var(--color-accent-ink)] shadow-[0_8px_18px_rgba(204,166,0,0.18)] transition hover:brightness-[0.98]">
                  <Icon name="check" className="h-5 w-5" />
                  배정하기
                </button>
              </form>
              <Feedback state={assignmentState} />

              <div className="mt-5 border-t border-[var(--color-border)] pt-4">
                <h3 className="text-sm font-bold">최근 배정 내역</h3>
                <div className="mt-3 space-y-2">
                  {data.assignments.length ? (
                    data.assignments.slice(0, 3).map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center justify-between gap-3 text-sm font-semibold"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#DFEAD4] text-[#4F7C32]">
                            <Icon name="book" className="h-4 w-4" />
                          </span>
                          <span className="truncate">
                            {assignment.className} · {assignment.userEmail}
                          </span>
                        </span>
                        <Icon
                          name="chevron"
                          className="h-4 w-4 shrink-0 text-[var(--color-text-secondary)]"
                        />
                      </div>
                    ))
                  ) : (
                    <p className="rounded-[12px] bg-[var(--color-surface-alt)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                      아직 강사 배정이 없습니다.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
