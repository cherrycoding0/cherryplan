import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

export const DEFAULT_MINS = { focus: 25, break: 5, longBreak: 15 }

export const MODE_META = {
  focus:     { label: '집중',    color: '#FF6B8A' },
  break:     { label: '휴식',    color: '#4CAF50' },
  longBreak: { label: '긴 휴식', color: '#2196F3' },
}

// customMins를 받아 실제 seconds가 포함된 MODES 반환
export function buildModes(customMins) {
  return {
    focus:     { ...MODE_META.focus,     seconds: customMins.focus     * 60 },
    break:     { ...MODE_META.break,     seconds: customMins.break     * 60 },
    longBreak: { ...MODE_META.longBreak, seconds: customMins.longBreak * 60 },
  }
}

const STORAGE_KEY = 'cherryplan_pomodoro'
const SETTINGS_KEY = 'cherryplan_pomodoro_settings'

function loadSessions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

function loadSettings() {
  try { return { ...DEFAULT_MINS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') } }
  catch { return DEFAULT_MINS }
}

function saveSessions(sessions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

const PomodoroContext = createContext(null)

export function PomodoroProvider({ children }) {
  const [mode, setMode] = useState('focus')
  const [isRunning, setIsRunning] = useState(false)
  const [sessionCount, setSessionCount] = useState(0)
  const [sessions, setSessions] = useState(loadSessions)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [currentTask, setCurrentTask] = useState('')    // 이번 집중 할 일
  const [customMins, setCustomMinsState] = useState(loadSettings)
  const intervalRef = useRef(null)

  const modes = buildModes(customMins)
  const [timeLeft, setTimeLeft] = useState(modes.focus.seconds)

  // 설정 저장 + 미시작 상태면 timeLeft도 갱신
  function setCustomMins(newMins) {
    setCustomMinsState(newMins)
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newMins))
    if (!sessionStarted) {
      setTimeLeft(newMins[mode] * 60)
    }
  }

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const completeSession = useCallback((completedMode, task) => {
    const newSession = {
      type: completedMode,
      completedAt: new Date().toISOString(),
      duration: modes[completedMode].seconds,
      task: task || '',
    }
    setSessions((prev) => {
      const updated = [newSession, ...prev]
      saveSessions(updated)
      return updated
    })

    if (Notification.permission === 'granted') {
      new Notification('🍒 CherryPlan', {
        body: completedMode === 'focus'
          ? '집중 완료! 잠깐 쉬어가세요 ☕'
          : '휴식 끝! 다시 집중해봐요 💪',
      })
    }

    if (completedMode === 'focus') {
      const next = sessionCount + 1
      setSessionCount(next)
      const nextMode = next % 4 === 0 ? 'longBreak' : 'break'
      setMode(nextMode)
      setTimeLeft(modes[nextMode].seconds)
      setCurrentTask('')
    } else {
      setMode('focus')
      setTimeLeft(modes.focus.seconds)
    }
    setIsRunning(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionCount, customMins])

  useEffect(() => {
    if (isRunning) {
      const taskSnapshot = currentTask
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearTimer()
            completeSession(mode, taskSnapshot)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      clearTimer()
    }
    return clearTimer
  }, [isRunning, mode, clearTimer, completeSession, currentTask])

  useEffect(() => {
    if (Notification.permission === 'default') Notification.requestPermission()
  }, [])

  useEffect(() => {
    if (isRunning) {
      const m = String(Math.floor(timeLeft / 60)).padStart(2, '0')
      const s = String(timeLeft % 60).padStart(2, '0')
      document.title = `${m}:${s} — ${modes[mode].label} | 🍒 CherryPlan`
    } else {
      document.title = '🍒 CherryPlan'
    }
  }, [timeLeft, isRunning, mode, modes])

  // 탭 전환 — confirm은 UI에서 처리 후 이 함수 호출
  function handleModeChange(newMode) {
    clearTimer()
    setMode(newMode)
    setTimeLeft(customMins[newMode] * 60)
    setIsRunning(false)
    setSessionStarted(false)
    setCurrentTask('')
  }

  function handleStartPause() {
    setSessionStarted(true)
    setIsRunning((prev) => !prev)
  }

  function handleReset() {
    clearTimer()
    setIsRunning(false)
    setSessionStarted(false)
    setTimeLeft(customMins[mode] * 60)
  }

  const isActive = isRunning || sessionStarted

  return (
    <PomodoroContext.Provider value={{
      mode, timeLeft, isRunning, sessionCount, sessions,
      isActive, sessionStarted,
      currentTask, setCurrentTask,
      customMins, setCustomMins,
      modes,
      handleModeChange, handleStartPause, handleReset,
    }}>
      {children}
    </PomodoroContext.Provider>
  )
}

export function usePomodoroContext() {
  return useContext(PomodoroContext)
}
