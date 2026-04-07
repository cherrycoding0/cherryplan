# 🍒 CherryPlan — 프로젝트 가이드

## 프로젝트 개요
바이브코딩으로 만든 7개 미니앱을 모아둔 개인 포트폴리오 허브.
Claude Code로 7일 만에 완성. Netlify에 배포.

## 기술 스택
- React 18 + Vite 5
- React Router v6
- Tailwind CSS v3
- 폰트: Pretendard (CDN, index.html)

## 디자인 시스템

### 컬러
| 이름 | 헥스 | 용도 |
|------|------|------|
| 체리 핑크 | `#FF6B8A` | 메인 강조, 로고, 버튼 |
| 딥 체리 | `#E84393` | 그라디언트 끝, 태그 텍스트 |
| 소프트 핑크 | `#FFE4EC` | 태그 배경, 카드 강조 |
| 배경 | `#FAFAFA` | 페이지 배경 |
| 텍스트 | `#1A1A2E` | 본문 텍스트 |
| 카드 배경 | `#FFFFFF` | 카드 흰 배경 |

### 규칙
- `rounded-2xl` 기본 (버튼은 `rounded-full`)
- 카드: `shadow-md hover:shadow-xl transition-all`
- hover 이동: `hover:-translate-y-1`
- 폰트: `font-family: 'Pretendard', sans-serif` (index.css에 전역 적용)

## 파일 구조
```
src/
├── components/
│   ├── Header.jsx     # sticky 헤더, 앱 내부에서 "← 홈으로" 표시
│   ├── Footer.jsx     # 공통 푸터
│   └── AppCard.jsx    # 앱 카드 (클릭 → 라우팅)
├── pages/
│   ├── Home.jsx       # 메인 허브 (히어로 + 카드 그리드 + 통계)
│   ├── ReadingLog.jsx
│   ├── MenuPicker.jsx
│   ├── Pomodoro.jsx
│   ├── RetroBoard.jsx
│   ├── HabitTracker.jsx
│   ├── Budget.jsx
│   └── AiDiary.jsx
├── data/
│   └── apps.js        # 앱 메타데이터 배열 (Single Source of Truth)
├── App.jsx            # BrowserRouter + Routes + 페이지 전환 fade
├── main.jsx
└── index.css          # Tailwind directives + 전역 스타일
```

## 새 앱 추가하는 방법

1. **`src/data/apps.js`** 에 앱 메타데이터 객체 추가
2. **`src/pages/NewApp.jsx`** 파일 생성 (placeholder 또는 실제 구현)
3. **`src/App.jsx`** 에 import 및 `<Route>` 추가

```js
// apps.js 예시
{
  id: 'new-app',
  emoji: '🎯',
  name: '새 앱 이름',
  description: '한 줄 설명',
  tags: ['태그1', '태그2'],
  difficulty: '⭐',
  path: '/new-app',
  color: '#E8F5E9',
}
```

## localStorage 키 네이밍 규칙
```
cherryplan_[앱-id]
```
예시:
- `cherryplan_reading-log`
- `cherryplan_pomodoro`
- `cherryplan_habit-tracker`

## 환경 변수
```
VITE_ANTHROPIC_API_KEY=   # AI 일기 도우미에서 사용
VITE_TMDB_API_KEY=        # 영화/드라마 기록에서 사용
VITE_SYNC_PASSWORD=       # Notion 연동 동기화 비밀번호
NOTION_TOKEN=             # Notion API 토큰
```
`.env.example` 참고. 실제 키는 `.env` 파일에 (gitignore됨).

## 절대 하지 말 것
- ❌ 외부 DB 연결 (Firebase, Supabase 등) — localStorage만 사용
- ❌ 로그인/인증 구현
- ❌ 단일 컴포넌트 500줄 초과 — 분리할 것
- ❌ 한국어 UI가 깨지는 폰트 사용 (system-ui 단독 사용 금지)
- ❌ `console.log` 프로덕션 코드에 남기기

## 배포
- 플랫폼: Netlify
- 배포 URL: https://cherryplan.netlify.app/
- 빌드 커맨드: `npm run build`
- publish 디렉토리: `dist`
- SPA 리다이렉트: `public/_redirects` 파일에 `/* /index.html 200` 추가 필요

## 후원 버튼
- GitHub Sponsors 승인 대기 중 (https://github.com/sponsors/cherrycoding0)
- ❌ Buy Me a Coffee 사용 안 함 (한국 환경에 맞지 않음)
- ✅ 승인되면 Footer.jsx에 GitHub Sponsors 버튼 추가 예정
  - 스타일: GitHub 다크 버튼 `#24292E`, 텍스트 `🩷 Sponsor`
  - 위치: Footer 하단, 새 탭으로 열기

---

## 📝 아티클 기록 (ARTICLE_NOTES)

> 이 섹션은 작업하면서 아티클 소재를 쌓는 공간이야.
> 작업 완료할 때마다 아래 형식으로 추가해줘.
> 나중에 "CherryPlan 제작기" 2편 아티클로 만들 예정.

### 기록 형식
```
### [날짜] [작업한 것]
- **뭘 만들었나:** 한 줄 요약
- **쓴 프롬프트:** 핵심 프롬프트
- **막힌 부분:** (있었다면)
- **어떻게 해결했나:** 해결 방법
- **결과:** 완성된 것, 느낀 점
```

---

### ✅ 완성된 앱 기록 (요약)
- 📚 독서 기록 — Notion 연동, 개발 일지 등록 완료
- 🍽️ 오늘의 메뉴 — Notion 연동, 개발 일지 등록 완료
- ⏱️ 포모도로 타이머 — Notion 연동, 개발 일지 등록 완료
- 📋 태스크 보드 — Notion 연동, 개발 일지 등록 완료
- ✅ 습관 트래커 — Notion 연동, 개발 일지 등록 완료
- 💰 가계부 — Notion 연동, 개발 일지 등록 완료

---

### 🔜 남은 작업 기록 (작업 완료 시 채우기)

### [ ] 🩷 GitHub Sponsors 버튼 (승인 후 작업)
- **뭘 만들었나:**
- **쓴 프롬프트:**
- **막힌 부분:**
- **어떻게 해결했나:**
- **결과:**

### [2026-04-07] 🤖 AI 일기 도우미
- **뭘 만들었나:** 일기 텍스트 입력 → Claude Haiku API 호출 → 감정 분석 / 긍정적 리프레이밍 / 내일을 위한 한 마디 피드백 카드 표시. localStorage 저장 + Notion 동기화 지원.
- **쓴 프롬프트:** "AI 일기 도우미 앱(AiDiary.jsx)을 완성해줘. Claude API로 감정 분석·긍정적 리프레이밍·내일을 위한 한 마디 피드백 생성. USE_MOCK=true일 때 목업 응답. Notion 연동. CherryPlan 디자인 시스템 통일."
- **막힌 부분:** 브라우저에서 Anthropic API 직접 호출 시 CORS 정책 → `anthropic-dangerous-direct-browser-access: true` 헤더 필요. Notion AI 일기 DB는 별도 생성 필요(ID 플레이스홀더로 처리).
- **어떻게 해결했나:** fetch 헤더에 `anthropic-dangerous-direct-browser-access: true` 추가. AI 응답을 JSON으로 강제하는 프롬프트 작성 + regex로 JSON 파싱. USE_MOCK 상수로 목업/실API 분기.
- **결과:** textarea 입력 → 로딩("✨ Claude가 읽고 있어요...") → 체리 핑크 피드백 카드 표시. 과거 일기 아코디언 목록. 삭제 기능. Notion 동기화 버튼(DB ID 미설정 시 안내 메시지 표시).

### [ ] 🎬 영화/드라마 기록
- **뭘 만들었나:**
- **쓴 프롬프트:**
- **막힌 부분:**
- **어떻게 해결했나:**
- **결과:**

### [ ] 😌 무드 트래커
- **뭘 만들었나:**
- **쓴 프롬프트:**
- **막힌 부분:**
- **어떻게 해결했나:**
- **결과:**

### [ ] 📊 통합 대시보드
- **뭘 만들었나:**
- **쓴 프롬프트:**
- **막힌 부분:**
- **어떻게 해결했나:**
- **결과:**