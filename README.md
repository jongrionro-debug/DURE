# harness_framework

이 저장소는 다른 사람이 로컬에서 같은 개발 환경으로 빠르게 붙을 수 있도록 아래 순서대로 세팅하면 된다.

핵심은 `git 저장소 + .env.example + 실제 비밀값 공유 + DB 실행/마이그레이션 절차`까지 함께 맞추는 것이다.  
`.env.local` 파일 자체만 전달하는 방식은 가능은 하지만, 팀 온보딩 방식으로는 권장하지 않는다.

## 1. 저장소 받기

```bash
git clone <저장소 주소>
cd harness_framework
```

## 2. Node.js와 패키지 설치

먼저 `Node.js`와 `npm`이 설치되어 있어야 한다.

```bash
node -v
npm -v
```

그다음 의존성을 설치한다.

```bash
npm install
```

## 3. 환경변수 파일 만들기

프로젝트 루트에서 아래 명령어를 실행한다.

```bash
cp .env.example .env.local
```

이후 `.env.local`에 팀에서 공유받은 실제 값을 채운다.

필수 값:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/harness_framework
```

설명:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

현재 프로젝트는 위 값들이 없으면 실행 중에 바로 실패하도록 검증되어 있다.

## 4. 비밀값은 어떻게 공유할까

권장 방식:

1. 저장소는 Git으로 공유한다.
2. 환경변수 키 목록은 `.env.example`로 공유한다.
3. 실제 비밀값은 메신저에 파일째 보내지 말고 `1Password`, `Bitwarden`, 사내 비밀 문서, 비공개 Notion 같은 별도 보안 채널로 공유한다.
4. 각 팀원은 자기 로컬에서 `.env.local`을 직접 만든다.

즉, 다른 사람이 이 환경을 쓰게 하려면 `.env.local` 파일 하나를 통째로 보내는 것보다 아래 2가지를 분리하는 것이 좋다.

- 공개 가능: 저장소, `.env.example`, 실행 절차
- 비공개: 실제 Supabase 키, 서비스 롤 키, 기타 API 키

## 5. PostgreSQL 실행

이 프로젝트는 로컬 DB 환경을 맞추기 위해 Docker 기반 PostgreSQL을 기본 경로로 사용한다.

```bash
npm run db:up
```

`DATABASE_URL`만 유효하면 외부 PostgreSQL을 사용해도 되지만, 팀 공통 개발 환경은 위 명령 기준으로 맞추는 것을 권장한다.

## 6. 마이그레이션 적용

앱을 실행하기 전에 반드시 현재 스키마를 반영한다.

```bash
npm run db:migrate
```

특히 스키마 변경이 포함된 브랜치를 새로 받았을 때는 `npm run dev`보다 먼저 `npm run db:migrate`를 실행해야 한다.

## 7. 앱 실행

```bash
npm run dev
```

브라우저에서 아래 주소로 접속한다.

```txt
http://localhost:3000
```

## 빠른 시작 요약

처음 붙는 팀원은 아래 순서만 따르면 된다.

```bash
git clone <저장소 주소>
cd harness_framework
npm install
cp .env.example .env.local
npm run db:up
npm run db:migrate
npm run dev
```

그리고 `.env.local`에는 팀에서 공유받은 실제 Supabase 값들을 넣는다.

## 선택 환경변수

아래 값들은 현재 기준 선택 항목이다.

```env
RESEND_API_KEY=
EMAIL_FROM=
SUPABASE_ATTACHMENTS_BUCKET=
```

- `RESEND_API_KEY`, `EMAIL_FROM`
  초대 메일 실발송을 붙일 때 사용

- `SUPABASE_ATTACHMENTS_BUCKET`
  첨부 업로드 기능을 실제로 켤 때 사용

## 운영 추천

가장 단순한 팀 운영 방식은 아래와 같다.

1. 모두 같은 Supabase 프로젝트를 사용한다.
2. 로컬 DB는 각자 `npm run db:up`으로 띄운다.
3. 브랜치를 새로 받을 때마다 `npm run db:migrate`를 먼저 실행한다.
4. 비밀값은 `.env.local` 파일째 전달하지 않고 키 단위로 안전하게 공유한다.

이 기준으로 정리하면, 다른 사람도 같은 개발 환경으로 비교적 안정적으로 바로 붙을 수 있다.
