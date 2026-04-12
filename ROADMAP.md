# CherryPlan 개발 로드맵

## 배포 정보

- **배포 URL**: https://cherryplan.netlify.app/
- **GitHub**: https://github.com/cherrycoding0/cherryplan
- **Netlify 환경변수**: `NOTION_TOKEN`, `VITE_SYNC_PASSWORD`, `VITE_ANTHROPIC_API_KEY`

---

## ✅ 완성된 앱 & 기능

### 미니앱 9개

| 앱                 | Notion 연동 | 개발 일지 | 비고               |
| ------------------ | ----------- | --------- | ------------------ |
| 📚 독서 기록       | ✅          | ✅        | 알라딘 API 검색    |
| 🍽️ 오늘의 메뉴     | ✅          | ✅        | 룰렛 애니메이션    |
| ⏱️ 포모도로 타이머 | ✅          | ✅        | Context API        |
| 📋 태스크 보드     | ✅          | ✅        | 드래그앤드롭       |
| ✅ 습관 트래커     | ✅          | ✅        | 히트맵 + 스트릭    |
| 💰 가계부          | ✅          | ✅        | Chart.js 도넛 차트 |
| 🤖 AI 일기 도우미  | ✅          | ✅        | Claude Haiku API   |

### 공통 기능

| 기능                           | 상태 | 비고                               |
| ------------------------------ | ---- | ---------------------------------- |
| Notion 동기화 (쓰기)           | ✅   | 비밀번호 인증, 전 앱               |
| Notion 기본 데이터 표시 (읽기) | ✅   | localStorage 비어있을 때 자동 로드 |
| AI 피드백 비밀번호 인증        | ✅   | Notion 동기화와 세션 공유          |
| AI 일기 공개/비공개 토글       | ✅   | Notion `공개` 체크박스 연동        |
| AI 일기 공개 둘러보기          | ✅   | Notion 공개 항목만 필터링          |
| SPA 리다이렉트 (`_redirects`)  | ✅   | Netlify 배포                       |

---

## 🔜 남은 작업

### 1순위 — 🩷 GitHub Sponsors 버튼

- **상태**: 승인 대기 중 (https://github.com/sponsors/cherrycoding0)
- **작업 내용**: 승인되면 `Footer.jsx`에 버튼 추가
- **스타일**: 다크 버튼 `#24292E`, 텍스트 `🩷 Sponsor`, 새 탭 열기
- **막히는 것 없음** — 승인만 나면 바로 5분 작업

### 2순위 — 🎬 영화/드라마 기록

- **상태**: 미시작
- **주요 스펙**:
  - TMDB API 사용 (무료, `VITE_TMDB_API_KEY`)
  - 검색: `/search/multi`, `language=ko-KR`
  - 상태: `want` / `watching` / `done`
  - 별점, 감상 메모
  - Notion 연동 (신규 DB 생성 필요)
- **참고**: 기존 독서 기록 앱과 구조 유사 → 코드 재사용 가능

### 3순위 — 😌 무드 트래커

- **상태**: 미시작
- **주요 스펙**:
  - 감정 5단계: 😄 최고야 / 😊 좋아 / 😐 보통 / 😔 별로야 / 😤 힘들어
  - 하루 1개 기록, 수정 가능
  - 월간 히트맵 (감정별 색상)
  - AI 일기와 연동 고려: 오늘 무드를 Claude 컨텍스트로 전달
  - localStorage: `cherryplan_mood-tracker`
  - Notion 필드: 날짜, 감정(select), 메모

### 4순위 — 📊 통합 대시보드 (마지막)

- **상태**: 미시작, 반드시 다른 앱 모두 완성 후 작업
- **주요 스펙**:
  - 별도 데이터 저장 없음 — 전 앱 localStorage 읽어서 집계
  - 표시 항목:
    - 오늘 습관 달성률
    - 포모도로 집중 시간
    - 태스크 현황 (todo/doing/done 개수)
    - 가계부 이번 달 잔액
    - 무드 최근 7일 흐름
    - 독서 / 영화 시청 현황
  - Notion 연동 없음

---

## 배포 단계

```
1차 ✅  — 가계부까지 6개 앱 완성
2차 ✅  — AI 일기 완성 + Notion 읽기 기능 전 앱 적용
3차 🔜 — 영화/드라마 기록 추가
4차 🔜 — 무드 트래커 추가
최종 🔜 — 통합 대시보드 (포트폴리오 완성 선언)
```

---

## 기술 부채 / 개선 고려사항

- `VITE_ANTHROPIC_API_KEY` 클라이언트 번들에 포함 — Netlify Function 프록시로 전환하면 더 안전 (현재는 비밀번호 인증으로 보완)
- `ReadingLog.jsx` 약 490줄 — 영화/드라마 작업 시 컴포넌트 분리 검토
- AI 일기 Notion DB ID: `7e49ec25746f487ab6e15023339e8100` (notionSync.js에 하드코딩)
