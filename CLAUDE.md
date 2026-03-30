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
- 빌드 커맨드: `npm run build`
- publish 디렉토리: `dist`
- SPA 리다이렉트: `public/_redirects` 파일에 `/* /index.html 200` 추가 필요
