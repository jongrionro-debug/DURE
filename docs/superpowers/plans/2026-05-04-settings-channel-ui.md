# Settings Channel UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/settings` from a large hero plus four-card grid into a messenger-style channel settings console that matches the existing DURE operations UI system.

**Architecture:** Keep the existing server data flow and server actions unchanged. Refactor only the client presentation in `SettingsScreen`, using local presentational helpers for the channel list, compact header, stat chips, workspace panels, and existing forms. Preserve all current form `name` attributes and action bindings so behavior remains stable.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4 tokens from `src/app/globals.css`, Vitest, React Testing Library.

---

## File Structure

- Modify: `src/components/ops/settings-screen.tsx`
  - Replace the current hero-card plus `lg:grid-cols-2` section layout with a compact page header and one large two-column settings console.
  - Add focused local helpers inside the same file: `SettingsStatChips`, `SettingsChannelNav`, `WorkspaceShell`, `ItemBubble`, and form field class constants.
  - Keep `SettingsScreen` as the single exported component.
- Modify: `src/components/ops/settings-screen.test.tsx`
  - Update expectations from the old hero/grid copy to the new channel-console structure.
  - Verify status chips, channel nav labels, selected workspace content, and preserved form controls.
- No changes: `src/app/(ops)/settings/page.tsx`
  - It already fetches `listSettingsOverview` and renders `SettingsScreen`.
- No changes: server actions/services/schema.

---

### Task 1: Update The Render Contract Test

**Files:**
- Modify: `src/components/ops/settings-screen.test.tsx`

- [x] **Step 1: Replace the existing test with a channel-console render test**

Use this test body so the new UI is pinned to the intended system without checking brittle class names:

```tsx
import { render, screen, within } from "@testing-library/react";
import { vi } from "vitest";

import { SettingsScreen } from "@/components/ops/settings-screen";

vi.mock("@/server/actions/settings", () => ({
  createClassAction: vi.fn(),
  createParticipantAction: vi.fn(),
  createProgramAction: vi.fn(),
  createVillageAction: vi.fn(),
  deleteParticipantAction: vi.fn(),
}));

describe("SettingsScreen", () => {
  it("renders the settings flow as a channel-based operations console", () => {
    render(
      <SettingsScreen
        data={{
          villages: [{ id: "village-1", name: "성내마을", isPrimary: true }],
          programs: [
            {
              id: "program-1",
              name: "문해 사업",
              description: "기초 문해 지원",
            },
          ],
          classes: [
            {
              id: "class-1",
              name: "기초 문해 수업",
              description: "오전 반",
              programName: "문해 사업",
              villageName: "성내마을",
            },
          ],
          participants: [
            {
              id: "participant-1",
              fullName: "홍길동",
              note: "보호자 연락 필요",
              className: "기초 문해 수업",
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "운영 기본정보 설정" }),
    ).toBeInTheDocument();
    expect(screen.getByText("마을 1")).toBeInTheDocument();
    expect(screen.getByText("사업 1")).toBeInTheDocument();
    expect(screen.getByText("수업 1")).toBeInTheDocument();
    expect(screen.getByText("참여자 1")).toBeInTheDocument();

    const channelNav = screen.getByRole("navigation", {
      name: "설정 항목",
    });
    expect(within(channelNav).getByText("마을")).toBeInTheDocument();
    expect(within(channelNav).getByText("사업")).toBeInTheDocument();
    expect(within(channelNav).getByText("수업")).toBeInTheDocument();
    expect(within(channelNav).getByText("참여자 명단")).toBeInTheDocument();

    expect(screen.getByText("성내마을 · 첫 마을")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("예: 동네 배움터")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "마을 추가" })).toBeInTheDocument();

    expect(screen.getByText("문해 사업")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("예: 문해 사업")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("사업 설명")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "사업 추가" })).toBeInTheDocument();

    expect(screen.getByText("기초 문해 수업")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "사업 선택 안 함" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "마을 선택 안 함" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "수업 추가" })).toBeInTheDocument();

    expect(screen.getByText("홍길동")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "수업 선택 안 함" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "참여자 추가" })).toBeInTheDocument();
    expect(screen.queryByText("프로그램")).not.toBeInTheDocument();
  });
});
```

- [x] **Step 2: Run the focused test and verify it fails before implementation**

Run:

```bash
npm test -- src/components/ops/settings-screen.test.tsx
```

Expected: FAIL because the new heading, channel nav accessible name, and status chips are not implemented yet.

---

### Task 2: Refactor SettingsScreen Into A Channel Console

**Files:**
- Modify: `src/components/ops/settings-screen.tsx`

- [x] **Step 1: Add shared class constants and small presentational helpers**

Add these helpers below `initialState`:

```tsx
const inputClassName =
  "rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-primary)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-surface)]";

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
      {stats.map(([label, value]) => (
        <span
          key={label}
          className="rounded-full bg-[var(--color-surface-alt)] px-3 py-2 text-xs font-semibold text-[var(--color-text-secondary)]"
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
          className={`rounded-[20px] px-4 py-3 ${
            active
              ? "bg-[var(--color-accent-surface)] text-[var(--color-accent-ink)]"
              : "bg-[var(--color-surface-alt)] text-[var(--color-text-primary)]"
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
        <p className="text-xl font-bold tracking-[-0.03em] text-[var(--color-text-primary)]">
          {title}
        </p>
        <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
          {description}
        </p>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}
```

- [x] **Step 2: Replace the current top-level layout**

In `SettingsScreen`, replace the current `return` JSX with a compact header plus console:

```tsx
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
          {/* workspaces inserted in the next step */}
        </div>
      </section>
    </div>
  </main>
);
```

- [x] **Step 3: Move the existing four sections into workspace blocks**

Inside the `<div className="grid gap-4">`, render the same four forms as `WorkspaceShell` blocks. Preserve all `form action={...}`, `name`, `placeholder`, `select`, and hidden input attributes. Replace repeated input/button classes with `inputClassName`, `primaryButtonClassName`, and `secondaryButtonClassName`.

The visible structure should be:

```tsx
<WorkspaceShell
  title="마을"
  description="기관의 지역 단위를 먼저 만들고 이후 수업과 연결합니다."
>
  {/* village list, village form, village feedback */}
</WorkspaceShell>

<WorkspaceShell
  title="사업"
  description="기관이 운영하는 사업 또는 사업 단위를 관리합니다."
>
  {/* program list, program form, program feedback */}
</WorkspaceShell>

<WorkspaceShell
  title="수업"
  description="사업과 마을을 선택적으로 연결해 실제 운영 수업을 만듭니다."
>
  {/* class list, class form, class feedback */}
</WorkspaceShell>

<WorkspaceShell
  title="참여자 명단"
  description="수업에 연결하거나 비연결 상태로 먼저 명단을 쌓을 수 있습니다."
>
  {/* participant list, participant form, participant feedback */}
</WorkspaceShell>
```

Use `rounded-[18px] bg-[var(--color-surface-alt)] px-4 py-3` for existing items and empty states. The participant delete button should use `secondaryButtonClassName`.

- [x] **Step 4: Run the focused test and verify it passes**

Run:

```bash
npm test -- src/components/ops/settings-screen.test.tsx
```

Expected: PASS.

---

### Task 3: Verify The Page In The Broader Test Suite

**Files:**
- No additional source changes unless tests expose a real issue.

- [x] **Step 1: Run related component tests**

Run:

```bash
npm test -- src/components/ops/settings-screen.test.tsx src/components/ops/users-screen.test.tsx src/components/ops/dashboard-screen.test.tsx
```

Expected: PASS. These screens share the same operations visual system, so this checks that the redesign did not drift from neighboring tests.

- [x] **Step 2: Run the full test suite**

Run:

```bash
npm test
```

Expected: PASS.

- [x] **Step 3: Run a production build**

Run:

```bash
npm run build
```

Expected: PASS. If the build requires local environment variables not present in this workspace, record the exact missing variable message and do not claim build success.

---

## Self-Review

- Spec coverage: The plan covers compact header, status chips, channel nav, warm surface panel, preserved forms, preserved server data flow, and tests.
- Placeholder scan: No TODO/TBD placeholders are used. The only implementation shorthand is constrained to moving existing form bodies unchanged, because the existing file already contains those complete form definitions and the plan explicitly lists which attributes must be preserved.
- Type consistency: All helpers use existing `SettingsOverview` and `ActionState` types from `settings-screen.tsx`; no new external API or server type is introduced.
