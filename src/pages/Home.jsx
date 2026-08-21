import AppCard from '../components/AppCard'
import { apps } from '../data/apps'

// ── 기술 & 도구 (카테고리별) ─────────────────────────────
const TECH_STACK = [
  {
    category: 'AI 도구',
    icon: '🤖',
    items: ['Claude Code', 'Claude Fable 5', 'Gemini API', 'Kanana-o'],
  },
  {
    category: '프론트엔드',
    icon: '🎨',
    items: ['React', 'Next.js', 'Vite', 'TypeScript', 'Tailwind CSS'],
  },
  {
    category: '백엔드 · 인프라',
    icon: '⚙️',
    items: ['Supabase', 'Netlify Functions', 'Vercel', 'PostgreSQL RLS'],
  },
]

// 좌측 정렬 섹션 헤더 (액센트 바 + 카운트 배지)
function SectionHeader({ title, count, desc }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5">
        <span className="w-1 h-5 rounded-full bg-gradient-to-b from-[#FF6B8A] to-[#E84393]" />
        <h2 className="text-lg font-extrabold text-[#1A1A2E]">{title}</h2>
        {count != null && (
          <span className="text-xs font-bold text-[#E84393] bg-[#FFE4EC] px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {desc && <p className="text-sm text-gray-400 mt-1.5 ml-3.5">{desc}</p>}
    </div>
  )
}

export default function Home() {
  const showcaseApps = apps.filter((app) => app.external || app.showcase)
  const miniApps = apps.filter((app) => !app.external && !app.showcase)

  return (
    <div className="max-w-5xl mx-auto px-4 py-14 flex flex-col gap-14">
      {/* ── 히어로 ── */}
      <section className="text-center flex flex-col items-center gap-5">
        <span className="text-xs font-bold tracking-widest text-[#E84393] bg-[#FFE4EC] px-4 py-1.5 rounded-full uppercase">
          AI-Native Portfolio
        </span>

        <div className="flex items-center justify-center gap-2">
          <span className="text-5xl">🍒</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#FF6B8A] tracking-tight">
            CherryPlan
          </h1>
        </div>

        <div className="flex flex-col gap-2 max-w-xl">
          <p className="text-xl sm:text-2xl font-semibold text-[#1A1A2E] leading-snug">
            기획부터 배포까지, AI와 함께 만든 미니앱
          </p>
          <p className="text-sm text-gray-400 leading-relaxed">
            아이디어 검증부터 실사용자 서비스까지 — AI 페어코딩으로 빠르게 만들고,
            직접 배포하고, 운영하며 배운 것들을 모았어요.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="https://github.com/cherrycoding0"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2
              bg-[#1A1A2E] text-white
              px-5 py-2.5 rounded-full
              text-sm font-semibold
              hover:bg-[#FF6B8A] transition-colors duration-200
            "
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub @cherrycoding0
          </a>
          <a
            href="https://cherrycoding0.tistory.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2
              bg-white text-[#1A1A2E] border border-pink-200
              px-5 py-2.5 rounded-full
              text-sm font-semibold
              hover:border-[#FF6B8A] hover:text-[#FF6B8A] transition-colors duration-200
            "
          >
            ✍️ 개발 블로그
          </a>
          <a
            href="https://github.com/sponsors/cherrycoding0"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex items-center gap-2
              bg-[#FFE4EC] text-[#E84393]
              px-5 py-2.5 rounded-full
              text-sm font-semibold
              hover:bg-[#FF6B8A] hover:text-white transition-colors duration-200
            "
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 21.593c-.425-.403-8.941-7.89-8.941-13.195C3.059 4.607 5.354 2 8.529 2c1.81 0 3.567.956 4.471 2.507C13.904 2.956 15.66 2 17.471 2 20.646 2 22.94 4.607 22.94 8.398c0 5.305-8.516 12.792-8.941 13.195L12 22.818l-1-.225.001-.001z"/>
            </svg>
            Sponsor
          </a>
        </div>

        {/* 핵심 지표 스트립 */}
        <div className="w-full max-w-2xl grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { label: '실전 프로젝트', value: `${showcaseApps.length}` },
            { label: '연습 미니앱', value: `${miniApps.length}` },
            { label: 'AI 도구', value: `${TECH_STACK[0].items.length}` },
            { label: '배포 플랫폼', value: '2' },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-white/70 backdrop-blur border border-pink-100 rounded-2xl py-4 flex flex-col items-center gap-0.5"
            >
              <span className="text-2xl font-extrabold text-[#FF6B8A]">{value}</span>
              <span className="text-xs text-gray-400 font-medium">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 실전 프로젝트 ── */}
      <section>
        <SectionHeader
          title="🚀 실전 프로젝트"
          count={showcaseApps.length}
          desc="실제 사용자를 위해 기획하고 배포한 서비스예요"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {showcaseApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </section>

      {/* ── 연습 미니앱 ── */}
      <section>
        <SectionHeader
          title="🧩 연습 미니앱"
          count={miniApps.length}
          desc="기능 단위로 빠르게 만들어본 미니앱이에요 — 카드를 누르면 바로 실행돼요"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {miniApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </section>

      {/* ── 기술 & 도구 ── */}
      <section>
        <SectionHeader
          title="🛠️ Tech & Tools"
          desc="프로젝트마다 목적에 맞는 도구를 골라 썼어요"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TECH_STACK.map(({ category, icon, items }) => (
            <div
              key={category}
              className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3 border border-transparent hover:border-pink-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{icon}</span>
                <h3 className="text-sm font-extrabold text-[#1A1A2E]">{category}</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {items.map((item) => (
                  <span
                    key={item}
                    className="text-xs bg-[#FFE4EC] text-[#E84393] font-medium px-2.5 py-1 rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
