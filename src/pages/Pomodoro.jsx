import { useState, useEffect } from 'react'
import { usePomodoroContext, DEFAULT_MINS } from '../context/PomodoroContext'
import { syncPomodoro, fetchPomodoro } from '../utils/notionSync'
import NotionSyncButton from '../components/NotionSyncButton'

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0')
  const s = String(seconds % 60).padStart(2, '0')
  return `${m}:${s}`
}

function formatCompletedAt(isoString) {
  return new Date(isoString).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

function todaySessions(sessions) {
  const today = new Date().toDateString()
  return sessions.filter((s) => new Date(s.completedAt).toDateString() === today)
}

function CircleProgress({ progress, color, children }) {
  const r = 88
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - progress)
  return (
    <div className="relative flex items-center justify-center w-56 h-56">
      <svg className="absolute inset-0 -rotate-90" width="224" height="224" viewBox="0 0 224 224">
        <circle cx="112" cy="112" r={r} fill="none" stroke="#F0F0F0" strokeWidth="10" />
        <circle
          cx="112" cy="112" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="relative z-10 flex flex-col items-center">{children}</div>
    </div>
  )
}

// 설정 패널
function SettingsPanel({ customMins, setCustomMins, onClose }) {
  const [draft, setDraft] = useState({ ...customMins })

  function handleChange(key, val) {
    const num = Math.max(1, Math.min(99, Number(val) || 1))
    setDraft((prev) => ({ ...prev, [key]: num }))
  }

  function handleSave() {
    setCustomMins(draft)
    onClose()
  }

  function handleReset() {
    setDraft({ ...DEFAULT_MINS })
  }

  const fields = [
    { key: 'focus',     label: '집중 시간',   color: '#FF6B8A' },
    { key: 'break',     label: '휴식 시간',   color: '#4CAF50' },
    { key: 'longBreak', label: '긴 휴식 시간', color: '#2196F3' },
  ]

  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-[#1A1A2E]">⚙️ 타이머 설정</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
      </div>

      <div className="flex flex-col gap-3">
        {fields.map(({ key, label, color }) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-600">{label}</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleChange(key, draft[key] - 1)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors"
              >−</button>
              <span
                className="w-10 text-center font-extrabold tabular-nums"
                style={{ color }}
              >
                {draft[key]}
              </span>
              <button
                onClick={() => handleChange(key, draft[key] + 1)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold transition-colors"
              >+</button>
              <span className="text-xs text-gray-400 w-5">분</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleReset}
          className="flex-1 py-2 rounded-xl text-sm font-semibold text-gray-400 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          기본값
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: '#FF6B8A' }}
        >
          저장
        </button>
      </div>
    </div>
  )
}

export default function Pomodoro() {
  const {
    mode, timeLeft, isRunning, sessionCount, sessions, isActive, sessionStarted,
    currentTask, setCurrentTask,
    customMins, setCustomMins,
    modes,
    handleModeChange, handleStartPause, handleReset,
  } = usePomodoroContext()

  const [showSettings, setShowSettings] = useState(false)
  const [notionSample, setNotionSample] = useState([])

  const POMODORO_KEY = 'cherryplan_pomodoro'

  useEffect(() => {
    if (sessions.length === 0) fetchPomodoro().then(setNotionSample)
  }, [])

  async function handleNotionSync() {
    const { updated, errors } = await syncPomodoro(sessions)
    // notionId를 localStorage에 반영
    const idMap = Object.fromEntries(updated.map((s) => [s.completedAt, s.notionId]))
    const next = sessions.map((s) => idMap[s.completedAt] ? { ...s, notionId: idMap[s.completedAt] } : s)
    localStorage.setItem(POMODORO_KEY, JSON.stringify(next))
    return { updated, errors }
  }

  const currentMode = modes[mode]
  const progress = timeLeft / currentMode.seconds
  const dotsFilled = sessionCount % 4
  const todayList = todaySessions(sessions)
  const todayFocusCount = todayList.filter((s) => s.type === 'focus').length
  const todayFocusMin = todayFocusCount * customMins.focus

  // 탭 전환 — 진행 중이면 confirm
  function handleTabClick(key) {
    if (key === mode) return
    if (sessionStarted) {
      const ok = window.confirm(
        `현재 ${currentMode.label} 모드가 진행 중이에요.\n${modes[key].label} 모드로 전환하면 현재 세션이 종료됩니다.\n\n계속하시겠어요?`
      )
      if (!ok) return
    }
    handleModeChange(key)
    setShowSettings(false)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 flex flex-col gap-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">⏱️ 포모도로 타이머</h1>
          <p className="text-sm text-gray-400 mt-0.5">25분 집중, 5분 휴식으로 생산성을 높여요</p>
        </div>
        <div className="flex items-center gap-2">
          <NotionSyncButton onSync={handleNotionSync} disabled={sessions.length === 0} />
          <button
            onClick={() => setShowSettings((v) => !v)}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-base transition-colors ${showSettings ? 'bg-[#FFE4EC] text-[#FF6B8A]' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
            title="타이머 설정"
          >
            ⚙️
          </button>
        </div>
      </div>

      {/* 설정 패널 */}
      {showSettings && (
        <SettingsPanel
          customMins={customMins}
          setCustomMins={setCustomMins}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* 모드 탭 */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl">
        {Object.entries(modes).map(([key, val]) => (
          <button
            key={key}
            onClick={() => handleTabClick(key)}
            className={`
              flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200
              ${mode === key ? 'bg-white shadow text-[#1A1A2E]' : 'text-gray-400 hover:text-gray-600'}
            `}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* 타이머 원형 */}
      <div className="flex flex-col items-center gap-6">
        <CircleProgress progress={progress} color={currentMode.color}>
          <span className="text-5xl font-extrabold tabular-nums" style={{ color: currentMode.color }}>
            {formatTime(timeLeft)}
          </span>
          <span className="text-sm text-gray-400 mt-1">{currentMode.label}</span>
        </CircleProgress>

        {/* 세션 도트 */}
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full transition-colors duration-300"
              style={{ backgroundColor: i < dotsFilled ? currentMode.color : '#E0E0E0' }}
            />
          ))}
          <span className="text-xs text-gray-400 ml-1">{dotsFilled}/4 후 긴 휴식</span>
        </div>

        {/* 할 일 입력 — 집중 모드이고 아직 시작 전일 때만 */}
        {mode === 'focus' && !isRunning && (
          <div className="w-full">
            <input
              type="text"
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              placeholder="지금 뭐 할 건지 입력해요 (선택)"
              maxLength={50}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#1A1A2E] placeholder-gray-300 focus:outline-none focus:border-[#FF6B8A] transition-colors"
            />
          </div>
        )}

        {/* 진행 중일 때 할 일 표시 */}
        {mode === 'focus' && isRunning && currentTask && (
          <p className="text-sm font-medium text-[#FF6B8A] bg-[#FFE4EC] px-4 py-2 rounded-full">
            🎯 {currentTask}
          </p>
        )}

        {/* 컨트롤 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={handleStartPause}
            className="px-8 py-3 rounded-full font-bold text-white text-base transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ backgroundColor: currentMode.color }}
          >
            {isRunning ? '⏸ 일시정지' : '▶ 시작'}
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-3 rounded-full font-bold text-gray-500 bg-gray-100 text-base hover:bg-gray-200 transition-colors active:scale-95"
          >
            ↺
          </button>
        </div>
      </div>

      {/* 오늘 통계 */}
      <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-[#1A1A2E]">오늘의 기록</h2>
          <span className="text-sm text-gray-400">
            🍅 {todayFocusCount}세션 · {todayFocusMin}분 집중
          </span>
        </div>

        {todayList.length === 0 && sessions.length === 0 && notionSample.length > 0 ? (
          <>
            <p className="text-xs text-gray-400">📖 예시 데이터 · 세션 완료 시 내 기록이 표시돼요</p>
            <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {notionSample.map((s) => (
                <li key={s.id} className="flex items-start justify-between text-sm gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: modes[s.type]?.color ?? '#FF6B8A' }} />
                    <div className="min-w-0">
                      <span className="text-gray-600">{modes[s.type]?.label ?? '집중'} {Math.floor(s.duration / 60)}분</span>
                      {s.task && <p className="text-xs text-gray-400 truncate">{s.task}</p>}
                    </div>
                  </div>
                  <span className="text-gray-400 shrink-0">{s.completedAt ? formatCompletedAt(s.completedAt) : ''}</span>
                </li>
              ))}
            </ul>
          </>
        ) : todayList.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            아직 완료된 세션이 없어요. 시작해볼까요? 💪
          </p>
        ) : (
          <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {todayList.map((s, i) => (
              <li key={i} className="flex items-start justify-between text-sm gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full mt-1 shrink-0"
                    style={{ backgroundColor: modes[s.type].color }}
                  />
                  <div className="min-w-0">
                    <span className="text-gray-600">
                      {modes[s.type].label} {Math.floor(s.duration / 60)}분
                    </span>
                    {s.task && (
                      <p className="text-xs text-gray-400 truncate">{s.task}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-gray-400">{formatCompletedAt(s.completedAt)}</span>
                  <span className="text-green-500">✅</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 페이지 내 플로팅 버튼 */}
      {isActive && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          <button
            onClick={handleReset}
            title="타이머 종료"
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:border-red-200 transition-all duration-200 active:scale-95"
          >
            ✕
          </button>
          <button
            onClick={handleStartPause}
            title={isRunning ? '일시정지' : '재생'}
            className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white text-xl transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ backgroundColor: currentMode.color }}
          >
            {isRunning ? '⏸' : '▶'}
          </button>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full text-white shadow"
            style={{ backgroundColor: currentMode.color }}
          >
            {currentMode.label} {formatTime(timeLeft)}
          </span>
        </div>
      )}
    </div>
  )
}
