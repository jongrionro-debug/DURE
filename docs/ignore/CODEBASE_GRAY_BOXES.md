# Codebase Gray Boxes

이 문서는 현재 코드베이스를 폴더 이름이 아니라 행동 단위의 gray box로 읽기 위한 지도다.

여기서 gray box는 내부 구현을 전부 외우지 않아도, 어떤 입력을 받고 어떤 도메인 규칙을 지키며 어떤 결과를 내는지 설명할 수 있는 Module을 뜻한다. 세부 파일은 바뀔 수 있지만, 아래 자연어 역할은 유지되어야 한다.

## Gray Boxes Are Not Disjoint

아래 gray box들은 서로 무관한 disjoint 조각이 아니다. 같은 도메인 객체를 다른 목적의 Interface로 바라보는 Module들이다.

예를 들어 `sessions`는 여러 gray box에 걸쳐 등장한다.

- Create-First Session Planning은 세션을 만든다.
- Operator Session Management는 이미 만든 세션을 보정한다.
- Teacher Workspace and Submission은 강사가 배정된 세션을 제출한다.
- Operator Records and Dashboard는 세션을 운영자용 기록과 현황으로 읽는다.

따라서 gray box를 나누는 기준은 "어떤 테이블을 쓰는가"가 아니라 "누가, 어떤 목적의 Interface로, 어떤 도메인 규칙을 실행하는가"다.

좋은 gray box 관계는 아래처럼 읽혀야 한다.

```txt
Auth and Membership Gate
  -> actor와 organization scope를 정한다

Organization Bootstrap
  -> organization scope를 처음 만든다

Ops Catalog Setup
  -> session planning에 필요한 마을/사업/수업/참여자 기반을 만든다

People and Teacher Assignment
  -> session planning과 teacher workspace가 사용할 강사 권한을 만든다

Create-First Session Planning
  -> session과 최초 snapshot을 만든다

Operator Session Management
  -> session의 강사와 snapshot을 운영자가 보정한다

Teacher Workspace and Submission
  -> session snapshot을 기준으로 출석/교육일지를 제출한다

Operator Records and Dashboard
  -> 제출된 session 상태를 운영자 read model로 읽는다

Attachment Storage
  -> teacher submission에 파일 metadata를 붙인다

Data Model and Scope
  -> 모든 gray box가 공유하는 persistence contract를 제공한다
```

이 관계 때문에 어떤 gray box는 독립적으로 리팩터링할 수 있고, 어떤 gray box는 함께 봐야 한다.

- 비교적 독립적인 후보: Root Workspace Hygiene, UI Shell 정리, read-only 문서화.
- 같이 봐야 하는 후보: 세션 생성, 세션 관리, 강사 제출, 운영자 기록 조회.
- 반드시 모든 업무 흐름에 걸쳐 봐야 하는 후보: Auth and Membership Gate, Data Model and Scope.

## 먼저 분리해서 봐야 할 영역

### 제품 코드

- `src/app`: Next.js App Router의 화면 진입점과 route group.
- `src/components`: 화면 조립과 폼 상호작용.
- `src/server/actions`: UI에서 호출하는 쓰기 진입점.
- `src/server/services`: 도메인 규칙과 DB 조합 로직.
- `src/lib`: 인증, DB, 환경변수, 검증처럼 여러 gray box가 공유하는 기반.
- `drizzle`: DB migration 산출물.
- `scripts`: 로컬/데모 운영용 스크립트.

### 문서

- `docs`: PRD, ADR, 아키텍처, 환경 설정, 시스템 리포트.

### 별도 취급해야 하는 덩어리

- `node_modules`, `.next`: 생성물이다. 아키텍처 판단에서 제외한다.

## Core Gray Boxes

### 1. Auth and Membership Gate

사용자를 앱의 올바른 입구로 보내는 gray box다.

입력은 Supabase auth user와 `organization_memberships` 한 건이다. 출력은 "비로그인", "기관 없음", "승인 대기", "운영자", "강사" 같은 앱 내부 상태와 redirect 목적지다.

주요 파일:

- `src/lib/auth/supabase-server.ts`
- `src/lib/auth/routing.ts`
- `src/app/(auth)/layout.tsx`
- `src/app/(onboarding)/layout.tsx`
- `src/app/(ops)/layout.tsx`
- `src/app/(teacher)/layout.tsx`
- `src/middleware.ts`

지켜야 할 규칙:

- 승인되지 않은 membership은 업무 화면에 들어가면 안 된다.
- `teacher`는 `/sessions`로, 운영자는 `/dashboard`로 갈라진다.
- MVP에서는 사용자 1명당 기관 membership 1건을 전제로 한다.

### 2. Organization Bootstrap

회원가입 후 첫 기관과 첫 마을을 만드는 gray box다.

입력은 기관 이름과 첫 마을 이름이다. 출력은 `organizations`, `villages`, `organization_memberships`의 초기 묶음이다.

주요 파일:

- `src/app/(onboarding)/organization/page.tsx`
- `src/app/(onboarding)/organization/complete/page.tsx`
- `src/components/onboarding/onboarding-form.tsx`
- `src/server/actions/onboarding.ts`
- `src/server/services/onboarding.ts`
- `src/lib/db/onboarding-bootstrap.ts`

지켜야 할 규칙:

- 기관 생성 직후 첫 운영자는 `organization_admin`이어야 한다.
- 사업은 자동 생성하지 않는다.
- 생성 완료 후 다음 행동은 운영 기본정보 설정이다.

### 3. Ops Catalog Setup

운영자가 마을, 사업, 수업, 참여자 같은 운영 기본정보를 쌓는 gray box다.

입력은 운영 기본정보 폼이다. 출력은 기관 범위 안의 `villages`, `programs`, `classes`, `participants` 레코드다.

주요 파일:

- `src/app/(ops)/settings/page.tsx`
- `src/components/ops/settings-screen.tsx`
- `src/server/actions/settings.ts`
- `src/server/services/settings.ts`
- `src/lib/validations/settings.ts`

지켜야 할 규칙:

- 모든 쓰기는 `organizationId`로 scoped 되어야 한다.
- 사용자 노출 용어는 `사업`, 내부 식별자는 `programs/programId`를 유지한다.

### 4. People and Teacher Assignment

기관 구성원, 승인 대기, 강사 초대, 수업 배정을 다루는 gray box다.

입력은 초대 이메일, membership 승인, role 변경, 강사-수업 배정이다. 출력은 membership 상태와 `teacher_assignments`다.

주요 파일:

- `src/app/(ops)/users/page.tsx`
- `src/app/(onboarding)/approval-pending/page.tsx`
- `src/components/ops/users-screen.tsx`
- `src/server/actions/memberships.ts`
- `src/server/services/memberships.ts`
- `src/lib/validations/settings.ts`

지켜야 할 규칙:

- 승인된 `teacher`만 실제 업무에 들어갈 수 있다.
- 강사 배정은 기관 범위와 수업 범위를 동시에 만족해야 한다.
- 초대 링크 실메일 발송은 local-first MVP의 핵심 경로가 아니다.

### 5. Create-First Session Planning

운영자가 세션을 먼저 만들고 나중에 강사/참여자를 보완할 수 있게 하는 gray box다.

입력은 날짜, 마을, 사업, 수업, 선택적 강사다. 출력은 `sessions`와 세션 시점의 `session_participant_snapshots`다.

주요 파일:

- `src/app/(ops)/dashboard/page.tsx`
- `src/app/(ops)/dashboard/status/page.tsx`
- `src/components/ops/dashboard-screen.tsx`
- `src/server/actions/sessions.ts`
- `src/server/services/sessions.ts`
- `src/lib/validations/sessions.ts`

지켜야 할 규칙:

- 강사 없이 세션 생성 가능.
- 참여자 0명 세션 생성 가능.
- 수업에 참여자가 있으면 생성 시점 snapshot을 고정한다.
- 강사가 지정되면 해당 수업의 강사 배정 안에 있어야 한다.

### 6. Operator Session Management

운영자가 이미 만든 세션을 보정하는 gray box다.

입력은 세션 강사 변경, 기존 참여자 추가, 새 참여자 생성 후 추가, 세션 참여자 제거다. 출력은 수정된 `sessions`, `participants`, `session_participant_snapshots`다.

주요 파일:

- `src/app/(ops)/dashboard/sessions/[sessionId]/page.tsx`
- `src/components/ops/session-management-screen.tsx`
- `src/server/actions/session-management.ts`
- `src/server/services/session-management.ts`

지켜야 할 규칙:

- 승인된 teacher만 세션 강사로 배정 가능.
- 이미 제출된 세션에 참여자를 추가해도 기존 출석 기록을 재생성하지 않는다.
- 추가된 참여자는 출석 기록이 생기기 전까지 `미입력`으로 보여야 한다.

### 7. Teacher Workspace and Submission

강사가 자기에게 배정된 세션을 보고 출석과 교육일지를 제출하는 gray box다.

입력은 강사 세션 접근, 출석 상태, 교육일지, 선택적 첨부다. 출력은 `attendance_records`, `lesson_journals`, `attachments`, `sessions.submitted_at/updated_at`이다.

주요 파일:

- `src/app/(teacher)/sessions/page.tsx`
- `src/app/(teacher)/sessions/[sessionId]/page.tsx`
- `src/components/teacher/sessions-screen.tsx`
- `src/components/teacher/session-workspace.tsx`
- `src/server/actions/submissions.ts`
- `src/server/actions/attachments.ts`
- `src/server/services/submissions.ts`
- `src/server/services/attachments.ts`

지켜야 할 규칙:

- 강사는 자기에게 배정된 세션만 접근 가능.
- snapshot이 1명 이상 있어야 제출 가능.
- 최초 제출 시각 `submitted_at`과 최근 수정 시각 `updated_at`은 다른 의미다.

### 8. Operator Records and Dashboard

운영자가 제출 현황, 최근 제출, 최근 수정, 기록 상세를 보는 gray box다.

입력은 기관 범위와 필터다. 출력은 운영자용 목록, 대시보드 요약, 기록 상세다.

주요 파일:

- `src/app/(ops)/records/page.tsx`
- `src/app/(ops)/records/[sessionId]/page.tsx`
- `src/components/records/records-browser.tsx`
- `src/components/records/record-detail.tsx`
- `src/server/services/dashboard.ts`
- `src/server/services/records.ts`

지켜야 할 규칙:

- 최근 제출 기록과 최근 수정 기록은 분리해서 해석한다.
- 기록 상세와 대시보드는 세션 관리 화면으로 돌아갈 수 있어야 한다.

### 9. Attachment Storage

강사 제출에 붙는 파일을 저장하는 gray box다.

입력은 파일과 세션 접근 권한이다. 출력은 Supabase Storage object와 DB metadata다.

주요 파일:

- `src/server/actions/attachments.ts`
- `src/server/services/attachments.ts`
- `src/lib/validations/sessions.ts`
- `src/lib/env.ts`

지켜야 할 규칙:

- `SUPABASE_ATTACHMENTS_BUCKET`이 없으면 앱 전체가 깨지지 않고 blocked 상태로 안내되어야 한다.
- 파일 metadata는 반드시 기관과 세션 범위 안에 저장한다.

### 10. Data Model and Scope

모든 gray box가 공유하는 데이터 모양과 기관 범위를 정의하는 gray box다.

주요 파일:

- `src/lib/db/schema.ts`
- `src/lib/db/client.ts`
- `drizzle/`
- `drizzle.config.ts`

지켜야 할 규칙:

- 기관 소속 데이터에는 `organization_id`가 있어야 한다.
- 읽기와 쓰기는 현재 사용자 membership의 기관 범위 안에서 실행되어야 한다.
- `organization_memberships_user_single_org_unique`는 MVP의 "한 사용자 한 기관" 결정을 코드로 고정한다.

### 11. UI Shell and Presentation

도메인 규칙을 직접 소유하지 않고, gray box 결과를 사람이 조작할 수 있게 보여주는 영역이다.

주요 파일:

- `src/components/ui/*`
- `src/components/auth/*`
- `src/components/demo/*`
- `src/app/globals.css`
- `src/app/layout.tsx`

지켜야 할 규칙:

- UI는 도메인 규칙의 최종 방어선이 아니다. 최종 검증은 server actions와 services에 있어야 한다.
- 화면 컴포넌트는 가능하면 데이터를 받아 표시하고, 도메인 판단을 새로 만들지 않는다.

## Current Deepening Opportunities

아래 항목들은 지금 구조에서 이해 비용을 줄이고 Module depth를 키울 수 있는 후보들이다. 아직 Interface 설계를 확정하지 않는다.

### 1. Root Workspace Hygiene

Files:

- `docs/`
- repo root

Problem:

루트에 제품 코드와 오래된 문서 산출물이 섞이면 Dure 제품의 gray box를 찾는 사람이 현재 문서와 과거 작업물을 혼동하기 쉽다.

Solution:

현재 제품 이해에 필요한 문서만 `docs/`에 남기고, 완료된 구현 이력이나 외부 repo성 자료는 repo 밖 보관 위치로 분리한다. 일회성 handoff 산출물은 재생성 필요성이 없다면 추적하지 않는다.

Benefits:

제품 Module의 locality가 좋아지고, AI나 사람이 탐색할 때 core code와 reference material을 혼동하지 않는다.

### 2. Organization Admin Access Gate

Files:

- `src/server/actions/settings.ts`
- `src/server/actions/sessions.ts`
- `src/server/actions/session-management.ts`
- `src/server/actions/memberships.ts`

Problem:

`requireOrganizationAdmin`이 여러 actions 파일에 거의 같은 구조로 반복된다. 지금은 작은 중복이지만, 승인 정책이나 role 정책이 바뀌면 여러 곳을 같이 수정해야 한다.

Solution:

운영자 쓰기 접근을 하나의 깊은 Module로 옮긴다. 단순히 함수를 공통화하는 것이 아니라, "이 action은 어떤 actor와 organization scope로 실행되는가"를 한 곳에서 설명하게 만든다.

Benefits:

Interface는 작아지고, 권한 변경의 locality가 좋아진다. 테스트도 각 action마다 인증 실패를 반복하기보다 access gate의 정책 테스트와 action의 도메인 테스트로 나눌 수 있다.

### 3. Session Workspace Split

Files:

- `src/server/services/sessions.ts`
- `src/server/services/session-management.ts`
- `src/server/services/submissions.ts`
- `src/server/services/records.ts`
- `src/server/services/dashboard.ts`

Problem:

세션이라는 한 도메인 개념이 생성, 운영자 보정, 강사 제출, 운영자 기록 조회, 대시보드 요약으로 나뉘어 있다. 파일 분리는 나쁘지 않지만, 어떤 Module이 "세션의 진짜 상태"를 소유하는지 읽는 사람이 계속 왕복해야 한다.

Solution:

세션의 상태 전이 언어를 먼저 문서화하고, 이후 구현에서는 세션 생성/보정/제출/조회가 공유하는 상태 규칙을 한 깊은 Module 뒤에 둔다.

Benefits:

`submitted_at`, `updated_at`, snapshot, 미입력 참여자 같은 규칙의 locality가 좋아진다. 테스트도 "세션 상태 전이"를 중심으로 설명할 수 있어 leverage가 커진다.

### 4. Action Parse and Revalidate Pattern

Files:

- `src/server/actions/*.ts`

Problem:

server actions가 모두 `access 확인 -> Zod parse -> service 호출 -> revalidate -> message 반환` 형태를 반복한다. 반복 자체보다, revalidate 대상과 실패 메시지가 action 내부에 흩어져 있다는 점이 이해 비용을 만든다.

Solution:

각 업무 흐름별로 revalidate policy를 이름 붙이고, action의 역할을 "폼을 도메인 command로 바꾸는 얇은 Adapter"로 제한한다.

Benefits:

UI refresh 정책의 locality가 좋아진다. 테스트에서 "어떤 경로가 갱신되어야 하는가"를 별도 정책으로 확인할 수 있다.

### 5. Read Model Ownership

Files:

- `src/server/services/dashboard.ts`
- `src/server/services/records.ts`
- `src/server/services/sessions.ts`
- `src/server/services/session-management.ts`

Problem:

운영자 대시보드, 기록 브라우저, 세션 관리 화면이 비슷한 session/class/village/program/teacher 조합을 각자 조회한다. 현재는 빠른 MVP에는 맞지만, 화면이 늘어나면 같은 표시 규칙이 여러 read model에 퍼질 수 있다.

Solution:

운영자용 세션 read model과 강사용 세션 read model을 구분해서 이름 붙인다. 조회 쿼리를 무조건 하나로 합치기보다, 같은 화면 언어를 공유하는 read model을 중심으로 정리한다.

Benefits:

조회 성능과 화면 요구가 달라도 도메인 표시 규칙의 leverage를 유지할 수 있다. `강사 미할당`, `미입력`, `최근 수정` 같은 표현의 locality가 좋아진다.

## Suggested Reading Order

처음 합류한 사람은 아래 순서로 읽으면 된다.

1. `docs/ADR.md`: 왜 local-first MVP와 Next.js 모놀리스를 택했는지 본다.
2. `docs/ARCHITECTURE.md`: 기관, 사업, 수업, 세션, 제출의 도메인 흐름을 읽는다.
3. 이 문서: 구현 gray box를 자연어로 잡는다.
4. `src/lib/db/schema.ts`: 도메인 모델이 실제 테이블로 어떻게 고정됐는지 본다.
5. `src/lib/auth/routing.ts`와 `src/lib/auth/supabase-server.ts`: actor와 route gate를 본다.
6. 관심 있는 업무 흐름의 `src/app -> src/components -> src/server/actions -> src/server/services`를 따라간다.

## Next Decision

다음 정리 작업은 위 deepening opportunity 중 하나를 골라 진행하는 것이 좋다. 추천 순서는 다음과 같다.

1. Root Workspace Hygiene
2. Organization Admin Access Gate
3. Session Workspace Split

첫 번째는 코드 이동 없이도 혼란을 크게 줄일 수 있고, 두 번째와 세 번째는 실제 리팩터링 전에 테스트 전략을 먼저 잡아야 한다.
