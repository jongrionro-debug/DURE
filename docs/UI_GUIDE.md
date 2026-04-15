# UI 디자인 가이드

`docs/UI_GUIDE.md`는 `/Users/nojonghyeon/Documents/GitHub/BIGLETTER/design_system.md`의 방향을 기준으로, 실제 구현과 리뷰에 바로 쓸 수 있는 UI 규칙만 정리한 문서다.

## 디자인 원칙
1. 메신저처럼 친근해야 한다. 운영 도구이지만 차갑거나 무겁게 보이면 안 된다.
2. 빠르게 스캔되어야 한다. 정보는 작고 명확한 블록으로 나누고, 상태는 한눈에 읽혀야 한다.
3. 장식보다 사용성이 우선이다. 시선은 액션, 상태, 흐름으로 모이고 시각 효과는 이를 보조해야 한다.
4. 데스크톱에서도 모바일 앱처럼 익숙해야 한다. 탭, 채널 리스트, 버블형 패널 같은 패턴을 적극 활용한다.
5. 컴팩트하지만 거칠면 안 된다. 운영 화면답게 밀도는 확보하되, 여백과 라운드, 컬러 대비로 부담을 줄인다.

## 브랜드 방향
- Tone: 친근한 메신저 UI + 가벼운 operations console
- Mood: 밝고 따뜻한 중성 배경, 빠른 상태 확인, 최소한의 크롬
- Metaphor: chat bubble, channel tab, quick action tray

## AI 슬롭 안티패턴
| 금지 사항 | 이유 |
|-----------|------|
| 유리질감 `backdrop-filter`, 과한 blur 레이어 | 메신저 기반의 선명한 정보 구조를 흐린다 |
| 보라/인디고 중심 SaaS 컬러 | 현재 제품 언어와 맞지 않고 KakaoTalk 계열 인상을 해친다 |
| 과한 네온 글로우, pulse shadow | 운영 도구가 아니라 프로모션 랜딩처럼 보인다 |
| 모든 패널을 동일한 카드로 반복 | 채널, 버블, 액션 트레이라는 구조적 차이가 사라진다 |
| 장식용 gradient orb, 3D blob | 정보 밀도보다 배경 장식이 먼저 보이게 된다 |
| 모든 상태를 노란색으로 강조 | 노란색은 가장 중요한 active/primary 상태에만 써야 한다 |
| 데스크톱에서 과도하게 중앙 정렬된 랜딩 레이아웃 | 실사용 운영 화면의 흐름과 맞지 않는다 |

## 색상
### 코어 토큰
| 토큰 | 값 | 용도 |
|------|------|------|
| Primary Accent | `#FEE500` | 주요 CTA, 선택된 탭, 핵심 활성 상태 |
| Accent Surface | `#FFF3A4` | 선택 영역 배경, 노란색이 직접 닿기 부담스러운 보조 면 |
| Accent Ink | `#1F1A17` | 노란 배경 위 텍스트와 아이콘 |
| Background | `#F6F1E8` | 페이지 기본 배경 |
| Surface | `#FFFDF8` | 기본 패널, 카드, 모달 |
| Surface Alt | `#F3EBDD` | 보조 패널, 리스트 hover, 구획 분리 |
| Border | `#E5DAC8` | 경계선, divider, input border |
| Text Primary | `#1C1A17` | 본문, 제목 |
| Text Secondary | `#6B665E` | 설명, 메타 정보, 비활성 라벨 |
| Success | `#2F9E5B` | 성공, 완료, 정상 |
| Warning | `#C9831A` | 주의, 대기, 검토 필요 |
| Danger | `#D95C4A` | 실패, 삭제, 위험 |

### 색상 사용 규칙
- 노란색은 가장 중요한 active state와 primary action에만 사용한다.
- 대부분의 면은 `Surface`, `Surface Alt`, `Background`로 해결한다.
- 텍스트 대비는 강하게 유지하되, 검정 대신 따뜻한 잉크 계열로 맞춘다.
- 상태 표현은 배경 채움보다 chip, badge, inline label 중심으로 처리한다.

## 타이포그래피
### 기본 폰트
- Primary UI Font: `Pretendard Variable`
- Fallbacks: `SUIT Variable`, `Apple SD Gothic Neo`, `Noto Sans KR`, `sans-serif`

### 스타일 원칙
- 제목은 굵고 타이트하게 잡는다.
- 라벨과 컨트롤은 `medium`에서 `semibold` 사이를 기본으로 한다.
- 문장은 짧게 유지하고, 설명 텍스트도 줄 수를 길게 늘이지 않는다.
- 영어보다 한국어 가독성을 우선해 line-height를 과하게 낮추지 않는다.

### 추천 스타일 예시
| 용도 | 스타일 예시 |
|------|-------------|
| 페이지 제목 | `text-3xl font-bold tracking-[-0.03em] text-[#1C1A17]` |
| 섹션 제목 | `text-lg font-semibold tracking-[-0.02em] text-[#1C1A17]` |
| 카드/패널 제목 | `text-sm font-semibold text-[#1C1A17]` |
| 본문 | `text-sm leading-6 text-[#1C1A17]` |
| 메타/보조 | `text-xs leading-5 text-[#6B665E]` |
| 버튼/탭 라벨 | `text-sm font-semibold text-[#1F1A17]` |

## 레이아웃
- 전체 배경은 밝은 캔버스를 유지한다. 흰 카드만 깔아두는 대신 warm neutral 배경과 구획 대비를 함께 사용한다.
- 좌측에는 채널 리스트나 네비게이션 스택, 상단에는 pill tab 또는 상태 필터를 두는 구조를 우선한다.
- 메인 작업 영역은 한 번에 한 가지 흐름이 읽히도록 구성한다.
- 카드 격자보다 "리스트 + 상세 패널" 또는 "대화 버블형 그룹" 구성을 우선 고려한다.
- 데스크톱에서도 콘텐츠 폭을 지나치게 넓히지 않는다. 읽기와 클릭이 안정적인 범위에서 끊어준다.

### 간격 가이드
- 컴포넌트 내부 패딩: `12px` - `20px`
- 섹션 간 간격: `24px` - `32px`
- 리스트 아이템 간 간격: `8px` - `12px`
- 정보 밀도가 높은 영역에서는 작은 간격을 쓰되, 구획 간 경계는 더 분명하게 준다

## 형태 언어
- 기본 라운드는 충분히 둥글게 가져간다.
- 핵심 패널은 한쪽 코너를 더 크게 주거나, 말풍선처럼 비대칭 느낌을 줄 수 있다.
- 완전히 기계적인 직사각형보다는 "친근한 도구"처럼 보이는 모서리 언어를 유지한다.
- 그림자는 깊지 않게, 얕고 부드럽게 사용한다.

## 컴포넌트 가이드
### 패널 / 카드
```txt
rounded-[24px] bg-[#FFFDF8] border border-[#E5DAC8] shadow-[0_8px_24px_rgba(60,44,20,0.06)]
```

규칙:
- 모든 패널을 동일한 카드처럼 만들지 말고, 역할에 따라 버블형/리스트형/트레이형으로 차이를 둔다.
- 장식용 gradient보다 border, 배경 톤 차이, 라운드 차이로 계층을 만든다.

### 채널 리스트 아이템
```txt
rounded-[18px] bg-transparent px-3 py-2 text-[#1C1A17]
hover:bg-[#F3EBDD]
active:bg-[#FFF3A4] active:text-[#1F1A17]
```

규칙:
- 선택 상태는 노란 배경 또는 accent surface로 명확히 구분한다.
- 텍스트 외에 unread dot, 상태 chip, count badge를 함께 둘 수 있다.

### 탭 / 필터 칩
```txt
rounded-full border border-[#E5DAC8] bg-[#FFFDF8] px-4 py-2 text-sm font-semibold text-[#6B665E]
data-[active=true]:bg-[#FEE500] data-[active=true]:text-[#1F1A17] data-[active=true]:border-[#FEE500]
```

규칙:
- 탭은 pill 형태를 기본으로 한다.
- 활성 탭만 명확히 밝아지고, 비활성 탭은 surface 기반으로 둔다.

### 버튼
```txt
Primary: rounded-full bg-[#FEE500] px-4 py-2.5 text-sm font-semibold text-[#1F1A17] hover:brightness-[0.98]
Secondary: rounded-full bg-[#FFFDF8] border border-[#E5DAC8] px-4 py-2.5 text-sm font-semibold text-[#1C1A17]
Text: text-sm font-medium text-[#6B665E] hover:text-[#1C1A17]
```

규칙:
- Primary 버튼은 한 화면에서 남발하지 않는다.
- Secondary 버튼은 흰 surface와 보더만으로 충분히 분리한다.

### 입력 필드
```txt
rounded-[18px] bg-[#FFFDF8] border border-[#E5DAC8] px-4 py-3 text-sm text-[#1C1A17] placeholder:text-[#6B665E]
focus:border-[#FEE500] focus:ring-2 focus:ring-[#FFF3A4]
```

규칙:
- 입력창은 어두운 필드를 쓰지 않는다.
- 포커스는 노란색 계열로 보여주되 자극적이지 않게 accent surface를 함께 사용한다.

### 상태 칩
```txt
Success: bg-[rgba(47,158,91,0.12)] text-[#2F9E5B]
Warning: bg-[rgba(201,131,26,0.14)] text-[#C9831A]
Danger:  bg-[rgba(217,92,74,0.12)] text-[#D95C4A]
Neutral: bg-[#F3EBDD] text-[#6B665E]
```

규칙:
- 상태는 큰 배너보다 작은 chip으로 자주 노출한다.
- 색만 바꾸지 말고 label 문구도 짧고 명확하게 유지한다.

## 아이콘
- 너무 무겁거나 테크 브랜드 느낌이 강한 아이콘보다, 단순하고 빠르게 읽히는 선형 아이콘을 우선한다.
- 기본은 `strokeWidth 1.5` 전후의 선형 아이콘을 사용한다.
- 노란 원 안에 아이콘을 반복적으로 넣는 패턴은 남용하지 않는다.
- 아이콘은 상태 전달보다 탐색 보조 역할에 가깝게 쓴다.

## 애니메이션
- 허용: 짧은 fade, subtle slide, hover background transition
- 권장 지속시간: `150ms` - `250ms`
- 금지: bounce, glow pulse, 과도한 spring, 의미 없는 skeleton shimmer 반복
- 애니메이션은 "빠르게 반응한다"는 인상만 주고 존재감은 낮아야 한다

## 구현 체크리스트
- 첫 화면에서 가장 먼저 보이는 것은 장식이 아니라 현재 상태와 다음 액션인가
- 노란색이 핵심 포인트에만 쓰이고 있는가
- 패널 구성이 메신저/채널/버블 메타포를 충분히 반영하는가
- 정보가 compact하지만 답답하지 않게 구획되어 있는가
- 데스크톱에서도 모바일 앱처럼 익숙한 탐색 흐름이 유지되는가
