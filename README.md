# 🍒 CherryPlan

> 바이브코딩으로 만든 미니앱 모음 포트폴리오 — Claude로 기획부터 배포까지

## 소개

Claude(AI 코딩 어시스턴트)를 활용해 빠르게 프로토타이핑한 미니앱들을 한 곳에 모은 포트폴리오 허브입니다. React + Vite + Tailwind CSS로 제작했고 Netlify에 배포합니다. 외부 API 키가 필요한 기능은 클라이언트에 키를 노출하지 않도록 Netlify Functions로 프록시 처리했습니다.

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

### 환경 변수 설정

`.env.example`을 복사해 `.env`를 만들고 값을 채웁니다.

```bash
cp .env.example .env
```

API 키는 **서버(Netlify Functions)에서만** 사용하므로 `VITE_` 접두사 없이 등록합니다. (`VITE_` 접두사 변수는 클라이언트 번들에 그대로 포함되므로 민감 정보는 넣지 않습니다.)

| 변수 | 용도 | 노출 |
|------|------|------|
| `ANTHROPIC_API_KEY` | AI 일기 / 무드 트래커 | 서버 전용 |
| `TMDB_API_KEY` | 영화·드라마 검색 | 서버 전용 |
| `ALADIN_API_KEY` | 도서 검색 (알라딘 TTBKey) | 서버 전용 |
| `NOTION_TOKEN` | 노션 동기화 | 서버 전용 |
| `VITE_SYNC_PASSWORD` | 노션 동기화·AI 기능 잠금 비밀번호 | 클라이언트 |

로컬 개발은 Netlify Functions를 함께 띄우려면 `netlify dev`를, 프론트만 볼 때는 `npm run dev`를 사용하세요.

## 앱 목록

| # | 앱 | 설명 | 태그 | 난이도 |
|---|-----|------|------|--------|
| 1 | 🎂 성호 생일 축하 페이지 | 사진드컵·유형테스트·실시간 롤링페이퍼 (실사용자 있는 팬 프로젝트, 외부 링크) | Next.js, Supabase, Realtime, AI | ⭐⭐⭐ |
| 2 | 📚 독서 기록 | 읽은 책을 기록하고 별점과 감상을 남겨요 | localStorage, CRUD | ⭐ |
| 3 | 🎬 영화/드라마 기록 | 보고싶은 작품을 기록하고 별점과 감상을 남겨요 | TMDB, 기록 | ⭐⭐ |
| 4 | ⏱️ 포모도로 타이머 | 25분 집중, 5분 휴식. 생산성을 높여요 | 타이머, 전역 상태 | ⭐ |
| 5 | 📋 태스크 보드 | 할 일을 카드로 관리하고 드래그로 이동해요 | 칸반, 드래그앤드롭 | ⭐⭐ |
| 6 | ✅ 습관 트래커 | 매일 체크하고 연속 달성 스트릭을 쌓아요 | 히트맵, 스트릭 | ⭐⭐ |
| 7 | 💰 간단한 가계부 | 수입과 지출을 기록하고 차트로 확인해요 | Chart.js, 통계 | ⭐⭐ |
| 8 | 🤖 AI 일기 도우미 | 일기를 쓰면 AI가 감정을 분석하고 위로해줘요 | Claude API, AI | ⭐⭐⭐ |
| 9 | 😌 무드 트래커 | 오늘 기분을 기록하고 Claude의 한 마디를 받아요 | 감정, AI | ⭐⭐ |
| 10 | 📊 통합 대시보드 | 모든 앱의 데이터를 한눈에 요약해서 봐요 | 요약, 통계 | ⭐ |

## 기술 스택

- **프레임워크**: React 18 + Vite 5
- **라우팅**: React Router v6
- **스타일링**: Tailwind CSS v3
- **차트**: Chart.js (react-chartjs-2)
- **폰트**: Pretendard (CDN)
- **데이터 저장**: localStorage
- **서버리스**: Netlify Functions (API 키 프록시)
- **AI**: Claude API (Haiku)
- **배포**: Netlify

## 프로젝트 구조

```
├── index.html
├── netlify.toml           # 배포·리다이렉트 설정
├── netlify/functions/     # aladin / tmdb / anthropic / notion-proxy (API 키 서버 처리)
└── src/
    ├── components/        # Header, Footer, AppCard, DevDiarySection ...
    ├── context/           # 전역 포모도로 상태
    ├── pages/             # 각 앱 페이지
    ├── utils/             # 노션 동기화
    ├── data/apps.js       # 앱 메타데이터 (여기에 추가하면 홈에 자동 반영)
    └── App.jsx            # 라우터 설정
```

---

Made with ♥ by [cherrycoding0](https://github.com/cherrycoding0/cherryplan)
