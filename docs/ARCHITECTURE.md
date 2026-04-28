# 아키텍처

## 문서 목적

이 문서는 현재 [PRD.md](/Users/nojonghyeon/Documents/GitHub/harness_framework/docs/PRD.md)를 구현하기 위한 `현재 채택 아키텍처`를 정리한다.

- 목표는 빠른 MVP 구현과 이후 다기관 확장을 동시에 버틸 수 있는 구조를 잡는 것이다.
- 아직 실제 코드베이스가 비어 있거나 초기 상태일 수 있으므로, 이 문서는 현재 구현이 따라야 할 기준 구조를 설명한다.
- 구체적인 기술 선택 이유는 [ADR.md](/Users/nojonghyeon/Documents/GitHub/harness_framework/docs/ADR.md)에서 관리한다.

## 현재 구현 우선순위

현재 이 레포의 구현 우선순위는 `local-first MVP`다.

즉, 아키텍처를 해석하거나 구현 slice를 나눌 때는 아래 원칙을 따른다.

1. 먼저 개발자 로컬 환경에서 실제 동작하는 앱을 만든다.
2. 인증, 기관 생성, 운영 기본정보 설정, create-first 세션 생성, 운영자 세션 관리, 강사 제출까지의 핵심 흐름을 우선 완성한다.
3. 배포, 실메일 발송, 외부 운영 인프라, 운영 자동화는 초기 로컬 MVP 범위에서 제외한다.
4. 아키텍처 선택은 `지금 바로 배포에 유리한가`보다 `지금 로컬에서 가장 작게 완성 가능한가`를 먼저 본다.

## 아키텍처 원칙

1. 1차 MVP는 하나의 웹 애플리케이션 안에서 끝나는 `모놀리식 웹 앱`으로 구현한다.
2. 기관별 데이터는 같은 제품 안에서 다루되, 데이터 레벨에서 명확하게 분리한다.
3. 인증 후 온보딩으로 기관을 생성하고, 이후 운영 설정과 일상 운영 화면을 이어가는 흐름을 우선한다.
4. 강사 입력 흐름은 짧고 단순해야 하며, 운영자 화면은 검색과 관리에 최적화되어야 한다.
5. 나중에 여러 기관으로 확장하더라도, 1차 MVP에서는 복잡한 마이크로서비스나 멀티앱 구조를 도입하지 않는다.
6. 1차 구현 단계에서는 로컬 실행과 검증을 우선하며, 실서비스 배포를 전제로 한 인프라 항목은 뒤로 미룬다.

## 기술 스택

### 애플리케이션

- Framework: `Next.js 15 App Router`
- Language: `TypeScript`
- Styling: `Tailwind CSS`
- UI primitives: 접근성 좋은 headless 계열 컴포넌트 사용 가능

### 백엔드 플랫폼

- Auth: `Supabase Auth`
- Database: `PostgreSQL`
- File Storage: `Supabase Storage`

### 데이터 접근

- ORM / Query Builder: `Drizzle ORM`
- Validation: `Zod`

### 운영

- Hosting: `Vercel`
- Database/Storage/Auth hosting: `Supabase`

이 조합은 MVP 속도, 인증/스토리지 구현 난이도, 멀티기관 데이터 분리 요구를 함께 만족시키기 쉽다.

## 시스템 개요

이 시스템은 크게 5개의 흐름으로 나뉜다.

1. 인증과 기관 생성 온보딩
2. 기관 운영 기본정보 설정
3. 운영자의 create-first 세션 생성
4. 운영자의 세션 관리
5. 강사의 세션 기록 제출과 운영자의 조회/관리/요약

### 상위 구조

```txt
Browser
  -> Next.js App
    -> Auth layer
    -> Server actions / route handlers
    -> PostgreSQL
    -> Storage
```

## 주요 도메인 모델

### 핵심 엔터티

- `users`
- `organizations`
- `organization_memberships`
- `villages`
- `programs`
- `classes`
- `teacher_assignments`
- `participants`
- `sessions`
- `session_participant_snapshots`
- `attendance_records`
- `lesson_journals`
- `attachments`

### 관계 요약

```txt
organization
  -> villages
  -> programs
  -> classes
  -> organization_memberships

class
  -> sessions
  -> teacher_assignments
  -> participants

session
  -> session_participant_snapshots
  -> attendance_records
  -> lesson_journals
  -> attachments
```

## 멀티기관 데이터 분리 전략

### 기본 전략

- 하나의 데이터베이스를 사용한다.
- 기관 소속 데이터 테이블에는 모두 `organization_id`를 둔다.
- 사용자의 접근 가능 범위는 `organization_memberships`를 기준으로 판별한다.
- 1차 MVP에서는 `한 사용자는 한 기관에만 소속`되므로, 앱 로직도 이 전제를 따른다.
- 따라서 `organization_memberships`는 미래 확장성을 고려해 두되, MVP에서는 사용자당 membership 1건만 허용한다.

### 왜 이렇게 가는가

- 데이터베이스를 기관별로 분리하는 방식보다 MVP 속도가 빠르다.
- 제품 안에서 기관 생성 온보딩을 제공하기 쉽다.
- 이후 다기관 확장 시에도 스키마를 크게 바꾸지 않아도 된다.

### 주의점

- 모든 읽기/쓰기 쿼리는 반드시 현재 사용자 소속 기관 범위 안에서 실행되어야 한다.
- 기관 ID 누락은 가장 위험한 버그 중 하나로 취급한다.

## 권한 모델

### 역할

- `platform_admin`
- `organization_admin`
- `teacher`

### 적용 방식

- 로그인한 사용자의 기본 정보와 `organization_memberships`를 함께 조회한다.
- 역할별로 접근 가능한 라우트와 액션을 분기한다.
- 1차 MVP에서는 `organization_admin`이 기관 생성 직후 최고 운영자 역할을 가진다.

### 핵심 규칙

- `teacher`는 배정된 세션만 조회/제출/수정 가능
- `organization_admin`은 자기 기관의 운영 정보, 사용자, 세션, 기록을 관리 가능
- `platform_admin`은 기관 생성/초기 세팅 지원용이며 별도 복잡한 UI는 필수 아님

## 라우팅 구조

현재 PRD 기준 App Router 구조는 아래와 같다.

```txt
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   └── invite/
│   ├── (onboarding)/
│   │   ├── organization/
│   │   └── organization/complete/
│   ├── (ops)/
│   │   ├── dashboard/
│   │   │   └── sessions/[sessionId]/
│   │   ├── settings/
│   │   ├── users/
│   │   ├── records/
│   │   └── analytics/
│   ├── (teacher)/
│   │   ├── sessions/
│   │   └── submissions/
│   └── api/
│       ├── auth/
│       ├── invites/
│       ├── uploads/
│       └── webhooks/
├── components/
│   ├── ui/
│   ├── onboarding/
│   ├── dashboard/
│   ├── ops/
│   ├── teacher/
│   └── records/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── permissions/
│   ├── validations/
│   └── utils/
├── server/
│   ├── actions/
│   ├── queries/
│   └── services/
├── types/
└── styles/
```

## 데이터 흐름

### 1. 회원가입 후 기관 생성

```txt
회원가입
-> 로그인
-> 기관 미연결 상태 확인
-> 기관 생성 온보딩
-> organization + first village + membership 생성
-> 생성 완료 요약
-> 운영 기본정보 설정
```

### 2. 운영 기본정보 설정

```txt
운영자 입력
-> 서버 검증
-> organization 범위 확인
-> programs / classes / participants / teacher assignments 저장
-> 화면 갱신
```

### 3. 세션 생성

```txt
운영자 세션 생성
-> class / village / program 선택
-> teacher와 참여자 명단이 비어 있어도 세션 생성 허용
-> 해당 시점 참여자 명단이 있으면 session_participant_snapshots 생성
-> sessions 생성
-> 같은 release bundle의 세션 관리 화면에서 강사 배정과 참여자 추가
```

### 4. 운영자 세션 관리

```txt
운영자 세션 관리 진입
-> session / organization 범위 검증
-> 승인된 teacher 목록 조회
-> 강사 할당 또는 할당 해제
-> 기존 참여자 추가 또는 새 참여자 생성 후 즉시 추가
-> 제출 후 추가 참여자는 attendance_records 재생성 없이 미입력 상태로 노출
-> 필요 시 기록 상세 / 세션 상세를 왕복
```

### 5. 강사 세션 제출

```txt
강사 세션 선택
-> 권한 검증
-> snapshot 1명 이상인지 검증
-> 출석 입력 + 교육일지 + 첨부 업로드
-> attendance_records / lesson_journals / attachments 저장
-> submitted_at 설정
-> 이후 수정 시 updated_at 갱신
```

## 세션 스냅샷 전략

세션은 생성 시점의 참여자 명단을 복사해서 `session_participant_snapshots`에 저장한다.

단, 1차 MVP에서는 참여자 명단이 아직 없어도 세션 자체는 먼저 만들 수 있다. 이 경우
운영자는 세션별 관리 화면에서 참여자를 나중에 추가하고, 강사는 snapshot이 최소
1명 이상 준비된 뒤에만 최종 제출할 수 있다.

이 구조를 쓰는 이유:

- 과거 세션 출석부가 이후 명단 변경 때문에 흔들리지 않음
- 운영자와 강사가 같은 기준의 출석부를 봄
- 통계 계산 시 세션 시점 기준 데이터가 유지됨

세션 생성 후 운영자가 참여자를 추가하면 원본 `participants`에도 저장하고, 해당 세션의 `session_participant_snapshots`에도 새 snapshot을 추가한다. 이미 제출된 세션에 추가된 참여자는 기존 `attendance_records`를 재생성하지 않으며, 강사가 다시 수정 저장하기 전까지 출석 상태를 `미입력`으로 보여준다.

phase 6의 create-first 세션 생성과 phase 7의 세션 관리 대시보드는 같은 release bundle로
출하한다. 세션을 먼저 만드는 흐름만 단독 배포하면 운영자가 후속 강사 배정과 참여자
추가를 제품 안에서 마무리할 수 없기 때문이다.

## 저장소 구조

첨부 문서는 Storage에 저장하고, 메타데이터만 DB에 저장한다.

메타데이터 필드:

- `id`
- `organization_id`
- `session_id`
- `uploaded_by_user_id`
- `file_path`
- `file_name`
- `mime_type`
- `size`
- `created_at`

## 프론트엔드 구조

### 렌더링 원칙

- 목록/요약/상세 조회는 Server Component 우선
- 입력 폼과 단계형 상호작용은 Client Component 사용
- 강사 제출 화면은 입력 밀도가 높으므로 폼 상태를 안정적으로 관리해야 한다

### 상태 관리

- 서버 상태: Server Components + 서버 쿼리
- 클라이언트 상태: `useState`, `useReducer`, 폼 라이브러리
- 전역 상태는 최소화한다

### UX 포인트

- 기관 생성 온보딩은 매우 단순해야 한다
- 생성 완료 화면에서는 `첫 사업 만들기`를 가장 강한 CTA로 둔다
- 사업이 없는 운영 기본정보 설정 화면은 빈 상태가 아니라 `첫 사업 만들기` 흐름을 안내해야 한다
- 강사 화면은 오늘 할 일 하나를 바로 처리하게 해야 한다
- 운영자 대시보드와 기록 상세는 모두 세션 관리 화면으로 바로 이어져야 한다
- 강사 미할당 세션도 운영자 후속 조치를 위해 숨기지 않는다

## 서버 계층 구조

### 권장 역할 분리

- `server/queries`: 읽기 전용 쿼리
- `server/actions`: 쓰기 액션
- `server/services`: 도메인 조합 로직

예:

- `createOrganizationBootstrap`
- `inviteTeacher`
- `createProgram`
- `createSessionWithRosterSnapshot`
- `submitSessionRecord`
- `updateSessionRecord`

## 검증 전략

- 모든 입력은 Zod로 검증
- 서버에서 역할/기관 범위 검증을 반드시 다시 수행
- 세션 제출 시 필수값:
  - 세션 정보
  - 출석
  - 교육일지

## 관찰성과 운영 로그

1차 MVP에서도 아래 정도는 남기는 것을 권장한다.

- 기관 생성 성공/실패
- 강사 초대 성공/실패
- 세션 생성 성공/실패
- 세션 제출 성공/실패
- 세션 수정 발생

운영자 대시보드의 `최근 수정 기록`은 강사 수정과 운영자 수정을 모두 포함하므로, 수정 주체 정보는 로그 또는 메타데이터로 구분 가능해야 한다.

## 테스트 우선순위

### 반드시 필요한 테스트

1. 기관 생성 온보딩
2. 기관 외 데이터 접근 차단
3. 강사 초대 시 기관 중복 소속 차단
4. 세션 생성 시 기존 참여자 명단 스냅샷 생성
5. 세션 생성 시 강사/참여자 없이도 create-first 생성 허용
6. 운영자 세션 관리에서 승인된 teacher만 할당 가능
7. 운영자 세션 관리에서 강사 할당 해제 가능
8. 같은 참여자의 세션 중복 추가 차단
9. 강사 세션 제출
10. 제출 후 수정 시 `submitted_at` 유지, `updated_at` 갱신
11. 참여자 0명 세션 제출 차단
12. 기록 상세와 대시보드에서 세션 관리 바로가기 노출

## 로컬 검증 기준

phase 5~8 기준 로컬 smoke는 아래 순서를 기본으로 삼는다.

1. `npm install`
2. `npm run db:up`
3. `npm run db:migrate`
4. `npm run dev` 또는 `npm run dev:local`

검증 중 반드시 확인할 정책:

- create-first 세션이 강사와 참여자 없이도 생성되는지
- 운영자 세션 관리에서 강사 할당/해제와 참여자 추가가 되는지
- 참여자 0명 세션에서 강사 제출이 명확히 차단되는지
- `SUPABASE_ATTACHMENTS_BUCKET`이 없을 때 첨부 기능이 전체 앱을 깨뜨리지 않고 blocked 상태로 안내되는지
- 승인 대기 멤버가 운영자 승인 전까지 실제 업무 화면에 들어가지 못하는지

현재 로컬 smoke 체크리스트 원본은 `phases/archive/LOCAL_SMOKE_TEST.md`를 기준으로 유지한다.

## 오픈 이슈

아직 결정이 필요한 기술 항목은 아래와 같다.

1. 초대 링크 만료 시간과 재발송 정책
2. 사업/수업/세션 삭제 시 하위 데이터 처리 방식
3. 빈 대시보드의 UX 구성
4. 통계/성과 쿼리를 1차 MVP에 어느 수준까지 최적화할지
