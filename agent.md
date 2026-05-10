# 프로젝트: dure

## 기술 스택
- 프레임워크: `Next.js 15 App Router`
- 언어: `TypeScript`
- 스타일링: `Tailwind CSS`
- 인증: `Supabase Auth`
- 데이터베이스: `PostgreSQL`
- 파일 저장소: `Supabase Storage`
- ORM / Query Builder: `Drizzle ORM`
- 검증: `Zod`
- 배포 대상: `Vercel` (단, 1차 구현 목표는 로컬 MVP)

## 로컬 MVP 우선 규칙
- CRITICAL: 1차 목표는 배포가 아니라 개발자 로컬 환경에서 실제로 동작하는 MVP 구현이다.
- CRITICAL: 초기 구현 범위는 회원가입/로그인, 기관 생성 온보딩, 운영 기본정보 설정, 세션 생성, 강사 기록 제출까지다.
- CRITICAL: Vercel 배포, 실제 이메일 발송, OAuth 로그인, 외부 운영 인프라 연결은 1차 로컬 MVP 범위에 포함하지 않는다.
- CRITICAL: 구현은 항상 가장 작은 동작 가능한 흐름부터 완성하고, 로컬에서 검증 가능한 상태를 우선한다.

## 아키텍처 규칙
- CRITICAL: 웹 UI에서 직접 쓰는 서버 엔트리는 `server actions`를 기본으로 허용한다.
- CRITICAL: 외부 시스템 연동, 웹훅, 공개 HTTP 인터페이스, 업로드 콜백처럼 HTTP 경계가 필요한 엔트리는 `app/api/`에서만 구현한다.
- CRITICAL: API 키는 환경변수로, 코드에 하드코딩 금지
- CRITICAL: 새 기능은 테스트 먼저 (TDD)
- CRITICAL: 기관 소속 데이터는 반드시 `organization_id` 범위 안에서만 읽고 쓴다.
- CRITICAL: 인증, 기관 생성, 운영 기본정보 설정, 세션 생성, 강사 제출 흐름을 우선 구현한다.
- 일반 규칙: UI 컴포넌트는 `components/`, 공통 타입은 `types/`, DB/권한/검증 유틸은 `lib/`와 `server/` 아래에 분리한다.
- 일반 규칙: 페이지/컴포넌트 -> `server actions` 또는 `app/api` -> `server/services` 흐름을 유지하고, 비즈니스 규칙은 `server/services`에 둔다.

## 개발 프로세스
- CRITICAL: 새 기능 구현 시 반드시 테스트를 먼저 작성하고, 테스트가 통과하는 구현을 작성할 것 (TDD)
- 커밋 메시지는 conventional commits 형식을 따를 것 (feat:, fix:, docs:, refactor:)

## 명령어
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run lint     # ESLint
npm run test     # 테스트



Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.
.

1. Think Before Coding
Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

State your assumptions explicitly. If uncertain, ask.
If multiple interpretations exist, present them - don't pick silently.
If a simpler approach exists, say so. Push back when warranted.
If something is unclear, stop. Name what's confusing. Ask.
2. Simplicity First
Minimum code that solves the problem. Nothing speculative.

No features beyond what was asked.
No abstractions for single-use code.
No "flexibility" or "configurability" that wasn't requested.
No error handling for impossible scenarios.
If you write 200 lines and it could be 50, rewrite it.
Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

3. Surgical Changes
Touch only what you must. Clean up only your own mess.

When editing existing code:

Don't "improve" adjacent code, comments, or formatting.
Don't refactor things that aren't broken.
Match existing style, even if you'd do it differently.
If you notice unrelated dead code, mention it - don't delete it.
When your changes create orphans:

Remove imports/variables/functions that YOUR changes made unused.
Don't remove pre-existing dead code unless asked.
The test: Every changed line should trace directly to the user's request.

4. Goal-Driven Execution
Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

"Add validation" → "Write tests for invalid inputs, then make them pass"
"Fix the bug" → "Write a test that reproduces it, then make it pass"
"Refactor X" → "Ensure tests pass before and after"
For multi-step tasks, state a brief plan:

1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
