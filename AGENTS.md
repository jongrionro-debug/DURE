# Dure Agent Guide

이 문서는 Dure 코드베이스에서 작업하는 에이전트가 먼저 따라야 할 프로젝트 규칙이다.

## 기준 문서

작업 전 필요한 만큼 아래 문서를 읽는다.

- `CONTEXT.md`: 도메인 용어와 핵심 업무 흐름
- `docs/PRD.md`: 제품 요구사항
- `docs/ARCHITECTURE.md`: 구현 구조와 검증 기준
- `docs/ADR.md`: 확정된 의사결정
- `docs/UI_GUIDE.md`: UI 구현 기준

## 기술 스택

- Framework: `Next.js 15 App Router`
- Language: `TypeScript`
- Styling: `Tailwind CSS`
- Auth: `Supabase Auth`
- Database: `PostgreSQL`
- Storage: `Supabase Storage`
- ORM / Query Builder: `Drizzle ORM`
- Validation: `Zod`
- Hosting target: `Vercel`

## Local-First MVP

- 1차 목표는 배포가 아니라 개발자 로컬 환경에서 실제로 동작하는 MVP 구현이다.
- 우선 범위는 회원가입/로그인, 기관 생성 온보딩, 운영 기본정보 설정, 수업 일정 만들기, 운영자 수업 일정 관리, 강사 기록 제출이다.
- Vercel 배포, 실제 이메일 발송, OAuth 로그인, 외부 운영 인프라 연결은 1차 로컬 MVP 범위에 포함하지 않는다.
- 구현은 항상 가장 작은 동작 가능한 흐름부터 완성하고, 로컬에서 검증 가능한 상태를 우선한다.

## Architecture Rules

- 웹 UI에서 직접 쓰는 서버 진입점은 `server actions`를 기본으로 한다.
- 외부 시스템 연동, 웹훅, 공개 HTTP 인터페이스, 업로드 콜백처럼 HTTP 경계가 필요한 진입점은 `app/api/`에서 구현한다.
- API 키와 비밀값은 환경변수로 관리하고, 코드에 하드코딩하지 않는다.
- 새 기능과 버그 수정은 테스트를 먼저 작성하는 흐름을 우선한다.
- 기관 소속 데이터는 반드시 `organization_id` 범위 안에서만 읽고 쓴다.
- 비즈니스 규칙은 `src/server/services`에 둔다.
- UI에서 보이는 용어는 `CONTEXT.md`를 따른다. 특히 사용자 화면에서는 `수업 일정`, `사업`, `마을`, `프로그램`, `출석 대상`을 우선한다.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm test
npm run db:up
npm run db:migrate
```
