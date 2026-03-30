# 🍒 CherryPlan

> 바이브코딩으로 만든 미니앱 모음 포트폴리오 — Claude Code로 7일 만에 완성

## 소개

Claude Code(AI 코딩 어시스턴트)를 활용해 빠르게 프로토타이핑한 7가지 미니앱을 한 곳에 모은 포트폴리오 허브입니다. React + Vite + Tailwind CSS로 제작되었으며 Netlify에 배포됩니다.

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 시작 (http://localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview
```

### AI 일기 기능 사용 시
`.env.example`을 복사해 `.env` 파일을 만들고 API 키를 입력하세요:
```bash
cp .env.example .env
# .env 파일에서 VITE_ANTHROPIC_API_KEY 값 입력
```

## 앱 목록

| # | 앱 | 설명 | 태그 | 난이도 |
|---|-----|------|------|--------|
| 1 | 📚 독서 기록 | 읽은 책을 기록하고 별점과 감상을 남겨요 | localStorage, CRUD | ⭐ |
| 2 | 🍽️ 오늘의 메뉴 | 조건을 입력하면 오늘 뭐 먹을지 추천해줘요 | 랜덤, 애니메이션 | ⭐ |
| 3 | ⏱️ 포모도로 타이머 | 25분 집중, 5분 휴식. 생산성을 높여요 | 타이머, 기록 | ⭐ |
| 4 | 📌 팀 회고 보드 | KPT 포스트잇으로 팀 회고를 진행해요 | 협업, 투표 | ⭐⭐ |
| 5 | ✅ 습관 트래커 | 매일 체크하고 연속 달성 스트릭을 쌓아요 | 히트맵, 스트릭 | ⭐⭐ |
| 6 | 💰 간단한 가계부 | 수입과 지출을 기록하고 차트로 확인해요 | Chart.js, 통계 | ⭐⭐ |
| 7 | 🤖 AI 일기 도우미 | 일기를 쓰면 AI가 감정을 분석하고 위로해줘요 | Claude API, AI | ⭐⭐⭐ |

## 기술 스택

- **프레임워크**: React 18 + Vite 5
- **라우팅**: React Router v6
- **스타일링**: Tailwind CSS v3
- **폰트**: Pretendard (CDN)
- **데이터 저장**: localStorage
- **AI**: Claude API (Haiku)
- **배포**: Netlify

## 프로젝트 구조

```
src/
├── components/    # Header, Footer, AppCard
├── pages/         # 각 앱 페이지
├── data/          # apps.js (앱 메타데이터)
└── App.jsx        # 라우터 설정
```

---

Made with ♥ by [cherrycoding0](https://github.com/cherrycoding0)
