import AppCard from '../components/AppCard'
import { apps } from '../data/apps'

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 flex flex-col gap-8">
      {/* 히어로 섹션 */}
      <section className="text-center flex flex-col items-center gap-5">
        <div className="flex items-center justify-center gap-2">
          <span className="text-5xl">🍒</span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#FF6B8A] tracking-tight">
            CherryPlan
          </h1>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xl sm:text-2xl font-semibold text-[#1A1A2E]">
            바이브코딩으로 만든 미니앱 모음
          </p>
        </div>

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
      </section>

      {/* 앱 카드 그리드 */}
      <section>
        <h2 className="text-lg font-semibold text-gray-400 mb-6 text-center tracking-wide uppercase text-sm">
          미니앱 둘러보기
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="flex flex-wrap justify-center gap-6 py-8 border-t border-pink-100">
        {[
          { label: '총 앱 수', value: '7개' },
          { label: '사용 도구', value: 'Claude Code' },
          { label: '배포 플랫폼', value: 'Netlify' },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-2xl font-extrabold text-[#FF6B8A]">{value}</span>
            <span className="text-sm text-gray-400">{label}</span>
          </div>
        ))}
      </section>
    </div>
  )
}
