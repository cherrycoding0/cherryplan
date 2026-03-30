import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import ReadingLog from './pages/ReadingLog'
import MenuPicker from './pages/MenuPicker'
import Pomodoro from './pages/Pomodoro'
import RetroBoard from './pages/RetroBoard'
import HabitTracker from './pages/HabitTracker'
import Budget from './pages/Budget'
import AiDiary from './pages/AiDiary'
import { PomodoroProvider, usePomodoroContext } from './context/PomodoroContext'

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

// 전역 플로팅 포모도로 버튼
function PomodoroFloat() {
  const { mode, timeLeft, isRunning, isActive, handleStartPause, handleReset, modes } = usePomodoroContext()
  const navigate = useNavigate()
  const location = useLocation()
  const currentMode = modes[mode]

  // 포모도로 페이지에서는 숨김 (페이지 자체에 컨트롤이 있으므로)
  if (!isActive || location.pathname === '/pomodoro') return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* 종료 버튼 */}
      <button
        onClick={handleReset}
        title="타이머 종료"
        className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-200 transition-all duration-200 active:scale-95"
      >
        ✕
      </button>
      {/* 재생/일시정지 토글 버튼 */}
      <button
        onClick={handleStartPause}
        title={isRunning ? '일시정지' : '재생'}
        className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white text-xl transition-all duration-200 hover:opacity-90 active:scale-95"
        style={{ backgroundColor: currentMode.color }}
      >
        {isRunning ? '⏸' : '▶'}
      </button>
      {/* 남은 시간 — 클릭 시 포모도로 페이지로 이동 */}
      <button
        onClick={() => navigate('/pomodoro')}
        className="text-xs font-bold px-2.5 py-1 rounded-full text-white shadow hover:opacity-80 transition-opacity"
        style={{ backgroundColor: currentMode.color }}
        title="포모도로 페이지로 이동"
      >
        {currentMode.label} {formatTime(timeLeft)}
      </button>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.style.opacity = '0'
      mainRef.current.style.transform = 'translateY(8px)'
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (mainRef.current) {
            mainRef.current.style.transition = 'opacity 250ms ease, transform 250ms ease'
            mainRef.current.style.opacity = '1'
            mainRef.current.style.transform = 'translateY(0)'
          }
        })
      })
    }
  }, [location.pathname])

  return (
    <main ref={mainRef} className="min-h-screen">
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/reading-log" element={<ReadingLog />} />
        <Route path="/menu-picker" element={<MenuPicker />} />
        <Route path="/pomodoro" element={<Pomodoro />} />
        <Route path="/retro-board" element={<RetroBoard />} />
        <Route path="/habit-tracker" element={<HabitTracker />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/ai-diary" element={<AiDiary />} />
      </Routes>
    </main>
  )
}

function AppShell() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <AnimatedRoutes />
      <Footer />
      <PomodoroFloat />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <PomodoroProvider>
        <AppShell />
      </PomodoroProvider>
    </BrowserRouter>
  )
}
