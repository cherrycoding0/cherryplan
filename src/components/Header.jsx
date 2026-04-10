import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { apps } from '../data/apps'

function GitHubIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

export default function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isHome = location.pathname === '/'
  const currentApp = apps.find((a) => a.path === location.pathname)

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-pink-100">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* 좌측: 로고 or 뒤로가기 */}
        <div className="flex items-center gap-3">
          {!isHome && (
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#FF6B8A] transition-colors mr-1"
              aria-label="홈으로"
            >
              <span>←</span>
              <span>홈으로</span>
            </button>
          )}
          <Link
            to="/"
            className="flex items-center gap-1.5 font-bold text-xl text-[#FF6B8A] hover:opacity-80 transition-opacity"
          >
            <span>🍒</span>
            <span>CherryPlan</span>
          </Link>
        </div>

        {/* 우측 */}
        <div className="flex items-center gap-3">
          {/* 대시보드 링크 — 데스크톱 */}
          <Link
            to="/dashboard"
            className="hidden sm:flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-[#FF6B8A] transition-colors border border-gray-200 hover:border-[#FF6B8A] px-2.5 py-1 rounded-full"
          >
            📊 대시보드
          </Link>

          {/* {currentApp?.devDiary && (
            <a
              href={currentApp.devDiary}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center text-xs font-semibold text-gray-400 hover:text-[#FF6B8A] transition-colors border border-gray-200 hover:border-[#FF6B8A] px-2.5 py-1 rounded-full"
            >
              📝 개발 일지
            </a>
          )} */}

          <a
            href="https://github.com/cherrycoding0/cherryplan"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-[#FF6B8A] transition-colors"
            aria-label="GitHub 프로필"
          >
            <GitHubIcon />
          </a>

          {/* 햄버거 — 모바일 */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="sm:hidden flex flex-col gap-1 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="메뉴"
          >
            <span className={`block w-5 h-0.5 bg-gray-500 transition-transform origin-center ${mobileOpen ? 'translate-y-1.5 rotate-45' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-500 transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-500 transition-transform origin-center ${mobileOpen ? '-translate-y-1.5 -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-pink-100 bg-white/95 px-4 py-3 flex flex-col gap-2">
          <Link
            to="/dashboard"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#FF6B8A] transition-colors py-1.5"
          >
            📊 대시보드
          </Link>
          {/* {currentApp?.devDiary && (
            <a
              href={currentApp.devDiary}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#FF6B8A] transition-colors py-1.5"
            >
              📝 개발 일지
            </a>
          )} */}
        </div>
      )}
    </header>
  )
}
