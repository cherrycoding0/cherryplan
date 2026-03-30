import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
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

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <AnimatedRoutes />
        <Footer />
      </div>
    </BrowserRouter>
  )
}
