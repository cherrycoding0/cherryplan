import { useState, useEffect } from 'react'
import { syncHabit, fetchHabit } from '../utils/notionSync'
import NotionSyncButton from '../components/NotionSyncButton'
import DevDiarySection from '../components/DevDiarySection'

const HABIT_KEY = 'cherryplan_habit-tracker'

const PRESETS = [
  { emoji: '💧', name: '물 2L 마시기' },
  { emoji: '🏃', name: '30분 운동' },
  { emoji: '📖', name: '독서 30분' },
  { emoji: '🧘', name: '명상 10분' },
  { emoji: '🌅', name: '아침 기상' },
  { emoji: '🥗', name: '채소 먹기' },
  { emoji: '📝', name: '일기 쓰기' },
  { emoji: '😴', name: '11시 전 취침' },
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function load() {
  try { return JSON.parse(localStorage.getItem(HABIT_KEY)) || { habits: [], logs: [] } } catch { return { habits: [], logs: [] } }
}

function save(data) {
  localStorage.setItem(HABIT_KEY, JSON.stringify(data))
}

function recentDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().slice(0, 10)
  })
}

function calcStreak(habitId, logs) {
  const checked = new Set(logs.filter((l) => l.habitId === habitId && l.done).map((l) => l.date))
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    if (checked.has(ds)) streak++
    else break
  }
  return streak
}

function calcMaxStreak(habitId, logs) {
  const checked = new Set(logs.filter((l) => l.habitId === habitId && l.done).map((l) => l.date))
  const sorted = [...checked].sort()
  let max = 0, cur = 0, prev = null
  for (const ds of sorted) {
    cur = prev && (new Date(ds) - new Date(prev)) / 86400000 === 1 ? cur + 1 : 1
    max = Math.max(max, cur)
    prev = ds
  }
  return max
}

function HeatMap({ habitId, logs }) {
  const days = recentDays(28)
  const checked = new Set(logs.filter((l) => l.habitId === habitId && l.done).map((l) => l.date))
  const weeks = Array.from({ length: 4 }, (_, i) => days.slice(i * 7, i * 7 + 7))
  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1">
        {['월', '화', '수', '목', '금', '토', '일'].map((d) => (
          <span key={d} className="w-5 text-center text-[9px] text-gray-300">{d}</span>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="flex gap-1">
          {week.map((day) => (
            <div key={day} title={day} className="w-5 h-5 rounded-sm"
              style={{ backgroundColor: checked.has(day) ? '#9C27B0' : '#F3E5F5' }} />
          ))}
        </div>
      ))}
    </div>
  )
}

// 인라인 편집 폼
function EditHabitForm({ habit, onSave, onCancel }) {
  const [name, setName] = useState(habit.name)
  const [emoji, setEmoji] = useState(habit.emoji)
  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim(), emoji: emoji.trim() || '✅' })
  }
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 flex-1">
      <input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={2}
        className="w-10 text-center border border-purple-200 rounded-lg px-1 py-1 text-base focus:outline-none" />
      <input autoFocus value={name} onChange={(e) => setName(e.target.value)} maxLength={30}
        className="flex-1 border border-purple-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-purple-400" />
      <button type="submit" className="text-xs font-bold text-white bg-purple-500 px-2 py-1 rounded-lg">저장</button>
      <button type="button" onClick={onCancel} className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">취소</button>
    </form>
  )
}

// 습관 추가 폼 (프리셋 포함)
function AddHabitForm({ existingNames, onAdd, onCancel }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [tab, setTab] = useState('preset') // preset | custom

  function submit(n, e) {
    if (!n.trim()) return
    onAdd({ name: n.trim(), emoji: e.trim() || '✅' })
  }

  const available = PRESETS.filter((p) => !existingNames.has(p.name))

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-3">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {[['preset', '⚡ 빠른 추가'], ['custom', '✏️ 직접 입력']].map(([key, label]) => (
          <button key={key} type="button" onClick={() => setTab(key)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${tab === key ? 'bg-white shadow text-[#1A1A2E]' : 'text-gray-400'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'preset' ? (
        <div className="flex flex-col gap-1 max-h-52 overflow-y-auto">
          {available.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">모든 프리셋이 추가되었어요!</p>
          )}
          {available.map((p) => (
            <button key={p.name} type="button"
              onClick={() => submit(p.name, p.emoji)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 text-left transition-colors">
              <span className="text-xl">{p.emoji}</span>
              <span className="text-sm font-medium text-[#1A1A2E]">{p.name}</span>
              <span className="ml-auto text-purple-300 text-xs">+ 추가</span>
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); submit(name, emoji) }} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🏃" maxLength={2}
              className="w-12 text-center border border-gray-200 rounded-xl px-2 py-2 text-lg focus:outline-none focus:border-purple-300" />
            <input autoFocus value={name} onChange={(e) => setName(e.target.value)}
              placeholder="습관 이름" maxLength={30}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-300" />
          </div>
          <button type="submit"
            className="w-full py-2 rounded-xl text-sm font-bold text-white bg-purple-500 hover:bg-purple-600 transition-colors">
            추가
          </button>
        </form>
      )}

      <button type="button" onClick={onCancel}
        className="text-xs text-gray-300 hover:text-gray-500 text-center transition-colors">
        취소
      </button>
    </div>
  )
}

export default function HabitTracker() {
  const [data, setData] = useState(load)
  const [adding, setAdding] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [editing, setEditing] = useState(null)
  const [showInactive, setShowInactive] = useState(false)
  const [notionSample, setNotionSample] = useState([])
  const today = todayStr()

  useEffect(() => {
    if (data.habits.length === 0) fetchHabit().then(setNotionSample)
  }, [])

  function updateData(next) { setData(next); save(next) }

  function addHabit({ name, emoji }) {
    const habit = { id: Date.now().toString(), name, emoji, active: true, createdAt: today }
    updateData({ ...data, habits: [...data.habits, habit] })
    setAdding(false)
  }

  function saveEdit(id, { name, emoji }) {
    updateData({ ...data, habits: data.habits.map((h) => h.id === id ? { ...h, name, emoji } : h) })
    setEditing(null)
  }

  // 활성/비활성 토글 — 기록은 유지
  function toggleActive(id) {
    updateData({ ...data, habits: data.habits.map((h) => h.id === id ? { ...h, active: !h.active } : h) })
  }

  function deleteHabit(id) {
    if (!window.confirm('습관을 삭제할까요? 모든 기록도 삭제됩니다.')) return
    updateData({ habits: data.habits.filter((h) => h.id !== id), logs: data.logs.filter((l) => l.habitId !== id) })
    if (expanded === id) setExpanded(null)
  }

  function toggleToday(habitId) {
    const existing = data.logs.find((l) => l.habitId === habitId && l.date === today)
    const nextLogs = existing
      ? data.logs.map((l) => l.habitId === habitId && l.date === today ? { ...l, done: !l.done } : l)
      : [...data.logs, { id: `${habitId}_${today}`, habitId, date: today, done: true }]
    updateData({ ...data, logs: nextLogs })
  }

  function isDoneToday(habitId) {
    return data.logs.some((l) => l.habitId === habitId && l.date === today && l.done)
  }

  async function handleNotionSync() {
    const items = data.logs.filter((l) => l.done).map((l) => {
      const habit = data.habits.find((h) => h.id === l.habitId)
      return { ...l, habitName: habit ? `${habit.emoji} ${habit.name}` : '(삭제된 습관)' }
    })
    const { updated, errors } = await syncHabit(items)
    const idMap = Object.fromEntries(updated.map((l) => [l.id, l.notionId]))
    const nextLogs = data.logs.map((l) => idMap[l.id] ? { ...l, notionId: idMap[l.id] } : l)
    updateData({ ...data, logs: nextLogs })
    return { updated, errors }
  }

  const activeHabits = data.habits.filter((h) => h.active !== false)
  const inactiveHabits = data.habits.filter((h) => h.active === false)
  const todayDoneCount = activeHabits.filter((h) => isDoneToday(h.id)).length
  const existingNames = new Set(data.habits.map((h) => h.name))

  function renderHabit(habit) {
    const done = isDoneToday(habit.id)
    const streak = calcStreak(habit.id, data.logs)
    const maxStreak = calcMaxStreak(habit.id, data.logs)
    const isExpanded = expanded === habit.id
    const isEditing = editing === habit.id
    const isInactive = habit.active === false

    return (
      <div key={habit.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-opacity ${isInactive ? 'opacity-50' : ''}`}>
        <div className="flex items-center gap-3 p-4">
          {/* 체크 버튼 — 비활성이면 비활성화 */}
          <button
            onClick={() => !isInactive && toggleToday(habit.id)}
            disabled={isInactive}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-200 shrink-0 ${
              isInactive ? 'bg-gray-100 cursor-not-allowed' :
              done ? 'bg-purple-500 scale-105' : 'bg-gray-100 hover:bg-purple-100'
            }`}
          >
            {done && !isInactive ? '✅' : habit.emoji}
          </button>

          {isEditing ? (
            <EditHabitForm habit={habit} onSave={(v) => saveEdit(habit.id, v)} onCancel={() => setEditing(null)} />
          ) : (
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${done && !isInactive ? 'line-through text-gray-300' : isInactive ? 'text-gray-400' : 'text-[#1A1A2E]'}`}>
                {habit.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {isInactive ? (
                  <span className="text-xs text-gray-400">일시정지됨</span>
                ) : (
                  <>
                    {streak > 0 && <span className="text-xs text-orange-500 font-semibold">🔥 {streak}일 연속</span>}
                    {maxStreak > 0 && <span className="text-xs text-gray-400">최장 {maxStreak}일</span>}
                  </>
                )}
              </div>
            </div>
          )}

          {!isEditing && (
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setEditing(habit.id)} title="수정"
                className="text-gray-200 hover:text-purple-400 transition-colors px-1.5 py-1 text-xs">✏️</button>
              <button onClick={() => setExpanded(isExpanded ? null : habit.id)} title="히트맵"
                className="text-gray-200 hover:text-purple-400 transition-colors px-1.5 py-1 text-xs">
                {isExpanded ? '▲' : '📊'}
              </button>
              <button onClick={() => toggleActive(habit.id)} title={isInactive ? '활성화' : '일시정지'}
                className={`transition-colors px-1.5 py-1 text-xs ${isInactive ? 'text-green-400 hover:text-green-600' : 'text-gray-200 hover:text-yellow-400'}`}>
                {isInactive ? '▶' : '⏸'}
              </button>
              <button onClick={() => deleteHabit(habit.id)} title="삭제"
                className="text-gray-200 hover:text-red-400 transition-colors px-1.5 py-1 text-xs">✕</button>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-50 pt-3">
            <p className="text-xs text-gray-400 mb-2">최근 4주 달성 현황</p>
            <HeatMap habitId={habit.id} logs={data.logs} />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 flex flex-col gap-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">✅ 습관 트래커</h1>
          <p className="text-sm text-gray-400 mt-0.5">매일 체크하고 스트릭을 쌓아요</p>
        </div>
        <NotionSyncButton onSync={handleNotionSync} disabled={data.logs.filter((l) => l.done).length === 0} />
      </div>

      {/* 오늘 요약 */}
      {activeHabits.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">오늘의 달성</p>
            <p className="text-2xl font-extrabold text-[#1A1A2E]">{todayDoneCount} / {activeHabits.length}</p>
            {inactiveHabits.length > 0 && (
              <p className="text-xs text-gray-300 mt-0.5">일시정지 {inactiveHabits.length}개 제외</p>
            )}
          </div>
          <div className="w-16 h-16 relative flex items-center justify-center">
            <svg className="-rotate-90" width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#F3E5F5" strokeWidth="6" />
              <circle cx="32" cy="32" r="26" fill="none" stroke="#9C27B0" strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 26}`}
                strokeDashoffset={`${2 * Math.PI * 26 * (1 - (activeHabits.length > 0 ? todayDoneCount / activeHabits.length : 0))}`}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <span className="absolute text-xs font-bold text-purple-600">
              {activeHabits.length > 0 ? Math.round(todayDoneCount / activeHabits.length * 100) : 0}%
            </span>
          </div>
        </div>
      )}

      {/* 활성 습관 목록 */}
      <div className="flex flex-col gap-3">
        {activeHabits.map(renderHabit)}

        {/* 추가 폼 or 버튼 */}
        {adding ? (
          <AddHabitForm existingNames={existingNames} onAdd={addHabit} onCancel={() => setAdding(false)} />
        ) : (
          <button onClick={() => setAdding(true)}
            className="w-full py-3 rounded-2xl text-sm font-semibold text-purple-400 border-2 border-dashed border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all">
            + 새 습관 추가
          </button>
        )}
      </div>

      {/* 일시정지된 습관 */}
      {inactiveHabits.length > 0 && (
        <div className="flex flex-col gap-2">
          <button onClick={() => setShowInactive((v) => !v)}
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors">
            <span>{showInactive ? '▲' : '▼'}</span>
            일시정지된 습관 {inactiveHabits.length}개
          </button>
          {showInactive && (
            <div className="flex flex-col gap-3">
              {inactiveHabits.map(renderHabit)}
            </div>
          )}
        </div>
      )}

      {/* 빈 상태 / 예시 */}
      {data.habits.length === 0 && !adding && (
        notionSample.length > 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-xs text-gray-400 font-semibold">📖 예시 데이터 · 직접 추가하면 내 기록이 표시돼요</p>
            {[...new Set(notionSample.map((l) => l.habitName))].slice(0, 6).map((name) => {
              const logs = notionSample.filter((l) => l.habitName === name)
              const doneCount = logs.filter((l) => l.done).length
              return (
                <div key={name} className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between opacity-70">
                  <span className="text-sm font-semibold text-[#1A1A2E]">{name}</span>
                  <span className="text-xs text-gray-400">{doneCount}회 완료</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-4xl mb-3">🌱</p>
            <p className="text-sm">첫 번째 습관을 추가해보세요!</p>
          </div>
        )
      )}
      <DevDiarySection
        devDiaryUrl="https://www.notion.so/333bb3574f30818fb08fc4d51975f1b"
        prompts={[
          `습관 트래커(HabitTracker.jsx)를 만들어줘.
습관 추가/삭제, 매일 체크, 연속 달성 스트릭 자동 계산.
최근 30일 히트맵 표시 (달성 = 체리 핑크).
localStorage cherryplan_habit-tracker 저장.`,
        ]}
      />
    </div>
  )
}
