# UI 디자인 가이드

이 문서는 DURE 운영자/강사용 웹 콘솔의 구현 기준이다. 기준 디자인은 `/Users/nojonghyeon/Downloads/DURE-Design-Spec.md`이며, 이전 warm messenger UI 규칙은 더 이상 사용하지 않는다.

## 원칙

1. 운영 콘솔처럼 빠르게 스캔되어야 한다.
2. 인증 후 화면은 고정 사이드바와 회색 작업 영역을 공유한다.
3. 카드와 패널은 그림자보다 보더로 구분한다.
4. Primary action과 active state는 `#517BF6`만 사용한다.
5. 사용자에게 보이는 용어는 `수업 일정`, `사업`, `마을`, `프로그램`, `출석 대상`을 우선한다.

## 색상

| 토큰 | 값 | 용도 |
|---|---|---|
| `--background` | `#EBEBEB` | 메인 작업 영역 배경 |
| `--surface` | `#FFFFFF` | 카드, 패널, 입력, 모달 |
| `--surface-alt` | `#E0E0E0` | 비활성 버튼, 보조 면 |
| `--sidebar` | `#2A2D3E` | 인증 후 좌측 사이드바 |
| `--sidebar-ink` | `#8E9096` | 비활성 사이드바 텍스트 |
| `--accent` | `#517BF6` | CTA, active nav, focus |
| `--text-primary` | `#1E212F` | 제목, 본문 핵심 |
| `--text-secondary` | `#6B6F7A` | 설명, 메타, placeholder |
| `--border` | `#D4D4D4` | 구분선, 카드, 입력 |

상태 색상은 success `#1A7F4B`, warning `#A06000`, danger `#B03030`을 사용한다.

## 타이포그래피

- Font family: `'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif`
- Page title: `22px`, `800`, `line-height: 1.3`
- Section title: `16px`, `700`, `line-height: 1.4`
- Body: `13px`, `500`, `line-height: 1.55`
- Meta: `11px`, `600`, `line-height: 1.4`
- Badge: `10px`, `700`, `letter-spacing: 0.05em`

## Shell

- Sidebar: fixed `220px`, background `#2A2D3E`, padding `16px 10px`.
- Main: background `#EBEBEB`, padding `24px 28px`.
- Section gap: `20px`.
- Card gap: `16px`.

## Components

### Card

```txt
rounded-[18px] border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-[18px]
```

Use shadows only for floating UI such as modals, dropdowns, and toasts.

### Button

```txt
Primary: rounded-[10px] bg-[var(--color-accent)] px-[14px] py-2 text-[13px] font-bold text-white
Secondary: rounded-[10px] border border-[var(--color-border)] bg-white px-[14px] py-2 text-[13px] font-bold text-[var(--color-text-primary)]
Danger: rounded-[10px] border border-[rgba(176,48,48,0.3)] bg-white px-[14px] py-2 text-[13px] font-bold text-[var(--color-danger)]
```

### Input

```txt
h-9 rounded-[10px] border border-[var(--color-border)] bg-white px-3 text-[13px] font-medium text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[rgba(81,123,246,0.15)]
```

### Status Chip

```txt
inline-flex rounded-full px-[10px] py-[3px] text-[10px] font-bold tracking-[0.05em]
```

Use color plus a clear Korean label. Do not rely on color alone.
