# 환경변수 및 API 키 준비 가이드

이 문서는 현재 [PRD.md](/Users/nojonghyeon/Documents/GitHub/harness_framework/docs/PRD.md), [ARCHITECTURE.md](/Users/nojonghyeon/Documents/GitHub/harness_framework/docs/ARCHITECTURE.md), [ADR.md](/Users/nojonghyeon/Documents/GitHub/harness_framework/docs/ADR.md)를 기준으로, 구현 전에 준비하면 좋은 환경변수와 API 키를 정리한 문서다.

## 한 줄 요약

지금 바로 준비하면 좋은 것은 아래 2묶음이다.

1. `Supabase`
2. `도달 가능한 PostgreSQL DATABASE_URL`

이 두 가지가 있으면 기관 생성, 로그인, DB 연결, 운영 기본정보 설정, create-first 세션 생성, 운영자 세션 관리, 강사 제출까지 MVP 핵심 흐름을 막힘 없이 검증할 수 있다.

`RESEND_API_KEY`, `EMAIL_FROM`, `SUPABASE_ATTACHMENTS_BUCKET`은 현재 기준으로 선택 항목이다. 초대 메일 실발송이나 첨부 스토리지를 붙일 때 추가하면 된다.

무료로 먼저 구축해보려면 현재 기준 가장 단순한 조합은 아래다.

- `Supabase Free`
- `Resend Free`
- `Vercel Hobby`

즉, 처음부터 모든 키를 한 번에 준비할 필요는 없다.
가장 현실적인 순서는 `Supabase + DATABASE_URL 먼저 -> 로컬 개발 시작 -> 선택적으로 Resend/Storage 추가 -> Vercel 배포`다.

## 무료 구축 기준 추천 순서

### 1단계: 로컬 개발 먼저 시작

이 단계에서는 아래만 있어도 된다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

이 상태로 먼저 구현 가능한 것:

- 회원가입 / 로그인
- 기관 생성 온보딩
- 기관 / 마을 / 사업 / 수업 / 세션 데이터 저장
- create-first 세션 생성
- 운영자 세션 관리
- 강사 / 운영자 권한 로직
- 출석 / 교육일지 저장

로컬 실행 순서:

```bash
npm install
npm run db:up
npm run db:migrate
npm run dev
```

스키마 변경이 포함된 브랜치를 새로 받았을 때는 `npm run dev`보다 `npm run db:migrate`를 먼저 실행해야 한다. 이 레포는 인증과 멤버십 조회가 DB 컬럼 형태에 직접 의존하므로, 마이그레이션이 늦으면 로그인이나 온보딩 경로가 바로 깨질 수 있다.

현재 저장소에는 `docker-compose.yml`이 포함되어 있으므로, 팀원들은 로컬 PostgreSQL 설치 대신 `npm run db:up`으로 같은 DB 환경을 맞출 수 있다.
단, Docker는 편의 수단일 뿐 필수는 아니며 `DATABASE_URL`만 유효하면 외부 Postgres를 써도 된다.

아직 없어도 되는 것:

- `RESEND_API_KEY`
- `EMAIL_FROM`
- Vercel 환경변수

즉, 초대 메일과 실제 배포를 뒤로 미루면 무료로 빠르게 뼈대를 올릴 수 있다.

### 2단계: 초대 메일 붙이기

강사 초대 링크를 실제 메일로 보내기 시작할 때 아래를 추가한다.

```env
RESEND_API_KEY=
EMAIL_FROM=
```

이 단계에서 구현되는 것:

- 강사 이메일 초대 링크 발송
- 운영자가 직접 초대하는 실제 온보딩 흐름

현재 로컬 MVP에서는 실제 메일 발송 없이도 `/users`에서 초대 토큰을 생성하고 복사해 초대 흐름을 검증할 수 있다.

### 3단계: 배포 붙이기

로컬에서 핵심 흐름이 돌아가면 Vercel에 같은 환경변수를 넣어 배포한다.

- 로컬: `.env.local`
- 배포: Vercel Project Environment Variables

## 누가 어떤 키를 준비하면 되는가

혼자 진행한다면 아래 순서대로 직접 준비하면 된다.
다른 사람에게 세팅을 맡긴다면 이 목록 그대로 전달하면 된다.

### A. Supabase 담당

준비할 것:

1. Supabase 프로젝트 생성
2. 프로젝트 URL 확인
3. anon key 확인
4. service role key 확인
5. database connection string 확인

전달해야 하는 값:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

### B. 이메일 담당

준비할 것:

1. Resend 계정 생성
2. API key 생성
3. 발신 주소 결정

전달해야 하는 값:

```env
RESEND_API_KEY=
EMAIL_FROM=
```

### C. 배포 담당

준비할 것:

1. Vercel 프로젝트 생성
2. GitHub 저장소 연결
3. 위 환경변수들을 Vercel에 등록

## 무료로 시작할 때의 실전 추천

현재 제품 기준으로는 아래처럼 가는 것이 가장 부담이 적다.

### Day 1

- Supabase 프로젝트만 만든다
- `.env.local`에 Supabase 4개 값만 넣는다
- `npm run db:migrate`로 현재 schema를 먼저 맞춘다
- 로컬에서 인증 / 기관 생성 / 기본 CRUD / 세션 관리 흐름부터 붙인다

### Day 2 이후

- 강사 초대 기능을 붙일 시점에 Resend를 추가한다
- 메일 발송이 되면 초대 플로우를 실제로 연결한다

### 배포 직전

- Vercel Hobby 프로젝트를 만든다
- 로컬에서 쓰던 환경변수를 Vercel에 그대로 등록한다

## 공개 데모 링크 환경

공개 체험 링크는 로컬 Docker DB가 아니라 Vercel과 전용 Supabase 프로젝트를 사용한다.

Vercel Demo 프로젝트 필수 값:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
NEXT_PUBLIC_DEMO_ENABLED=true
NEXT_PUBLIC_DEMO_EMAIL=demo@example.com
DEMO_PASSWORD=
DEMO_ORGANIZATION_SLUG=dure-demo
```

배포 준비 순서:

1. Supabase에서 데모 전용 프로젝트를 만든다.
2. Vercel 프로젝트에 위 환경변수를 등록한다.
3. 같은 값이 들어 있는 로컬 운영자 `.env.local`에서 `npm run db:migrate`를 실행한다.
4. `npm run db:seed:demo`로 데모 계정과 샘플 데이터를 만든다.
5. Vercel 배포 URL에서 `데모로 체험하기`를 눌러 로그인 흐름을 확인한다.

주의: 공개 데모는 실제 운영 데이터나 프로덕션 Supabase 프로젝트를 공유하지 않는다.

## 지금 바로 맡기기 좋은 체크리스트

아래 체크리스트를 그대로 전달하면 된다.

### 반드시 먼저

- Supabase 프로젝트 하나 생성
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

### 초대 메일 붙일 때

- Resend 계정 생성
- `RESEND_API_KEY`
- `EMAIL_FROM`

### 첨부 저장소 붙일 때

- Supabase Storage bucket 생성
- `SUPABASE_ATTACHMENTS_BUCKET`

### 배포 직전

- Vercel 프로젝트 생성
- 환경변수 등록

## 1. 지금 바로 필요한 항목

### Supabase

필수 환경변수:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

설명:

- `NEXT_PUBLIC_SUPABASE_URL`
  클라이언트와 서버에서 Supabase 프로젝트에 연결할 때 사용

- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  로그인 사용자 기준의 기본 API 접근에 사용

- `SUPABASE_SERVICE_ROLE_KEY`
  서버 전용 권한이 필요한 작업에 사용
  예:
  - 기관 생성 시 초기 데이터 부트스트랩
  - 강사 초대 처리
  - 운영자 권한 부여/변경

- `DATABASE_URL`
  Drizzle 마이그레이션과 서버 DB 연결에 사용

주의:

- `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트에 노출되면 안 된다.
- `NEXT_PUBLIC_`가 붙은 값만 브라우저에 노출될 수 있다.

선택 환경변수:

```env
SUPABASE_ATTACHMENTS_BUCKET=
```

- 첨부 업로드를 실제로 켤 때만 필요하다.
- 값이 없어도 앱 전체는 동작해야 하며, 첨부 업로드만 blocked 상태로 안내되는 것이 정상이다.

## 2. 강사 초대 구현을 위해 곧 필요한 항목

현재 제품은 `강사 이메일 초대 링크 방식`을 쓰기로 했으므로, 이메일 발송 수단이 필요하다.

가장 단순한 선택지는 아래 둘 중 하나다.

### 선택지 A: Resend 사용

```env
RESEND_API_KEY=
EMAIL_FROM=
```

설명:

- `RESEND_API_KEY`
  초대 메일 발송용 API 키

- `EMAIL_FROM`
  발신자 주소
  예: `no-reply@yourdomain.com`

장점:

- 빠르게 붙이기 쉽다
- 초대 메일 전송 구현이 단순하다

### 선택지 B: SMTP 사용

```env
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
EMAIL_FROM=
```

설명:

- SMTP 서버를 직접 사용해 메일을 보내는 방식
- Supabase Auth 메일 설정과 함께 쓸 수도 있다

장점:

- 특정 메일 인프라에 맞추기 쉽다

단점:

- Resend보다 초기 설정이 번거로울 수 있다

## 3. 로그인 방식에 따라 나중에 필요할 수 있는 항목

아직 로그인 방식이 최종 확정되지 않았다면 아래는 선택 항목이다.

### 이메일/비밀번호만 사용할 경우

추가 키 없음

### Google 로그인 등 OAuth를 붙일 경우

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

설명:

- 소셜 로그인 도입 시 필요
- 현재 MVP 필수는 아님

## 4. 지금은 없어도 되는 항목

아래는 나중에 붙여도 된다.

### 에러 모니터링

```env
SENTRY_DSN=
```

### 제품 분석

```env
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

또는 다른 분석 도구 키

### AI 기능

```env
OPENAI_API_KEY=
```

현재 PRD 기준으로는 AI 기능이 MVP 본체가 아니므로 지금 준비하지 않아도 된다.

## 5. 권장 .env 구성

로컬 개발에서는 아래처럼 나누는 것을 권장한다.

### `.env.local`

개인 로컬 개발용 비밀값

예:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
RESEND_API_KEY=
EMAIL_FROM=
SUPABASE_ATTACHMENTS_BUCKET=
```

### 배포 환경

Vercel 프로젝트 환경변수에 동일하게 설정

주의:

- 비밀값은 저장소에 커밋하지 않는다
- `.env.example`에는 실제 값이 아니라 키 이름만 남긴다

## 6. 구현 순서 기준 추천

가장 먼저 준비:

1. Supabase 프로젝트 생성
2. `NEXT_PUBLIC_SUPABASE_URL`
3. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. `SUPABASE_SERVICE_ROLE_KEY`
5. `DATABASE_URL`

그 다음 준비:

1. 첨부 업로드를 실제로 쓸 경우 Storage bucket 생성
2. `SUPABASE_ATTACHMENTS_BUCKET`
3. 이메일 발송 수단 결정
4. `RESEND_API_KEY` 또는 SMTP 값
5. `EMAIL_FROM`

나중에 준비:

1. OAuth 키
2. 모니터링 키
3. 분석 키
4. AI 키

## 7. 추천 결론

현재 제품 기준으로는 아래 조합이 가장 구현 난이도가 낮다.

- Auth/DB: `Supabase + PostgreSQL`
- 첨부 저장소: 필요 시 `Supabase Storage`
- 메일 발송: 필요 시 `Resend`
- 배포: `Vercel`

즉, 지금 제일 먼저 준비할 것은 사실상 아래다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
```

현재 phase 8 로컬 smoke 기준 체크리스트는 `phases/archive/LOCAL_SMOKE_TEST.md`를 함께 참고하는 것을 권장한다.
