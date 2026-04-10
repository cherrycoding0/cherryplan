import { useState, useEffect } from 'react'
import { syncMoodTracker } from '../utils/notionSync'
import NotionSyncButton from '../components/NotionSyncButton'

const USE_MOCK = false
const LS_KEY = 'cherryplan_mood-tracker'

const MOODS = [
  { emoji: '😊', label: '좋아요' },
  { emoji: '😐', label: '보통' },
  { emoji: '😔', label: '별로' },
  { emoji: '😢', label: '힘들어요' },
  { emoji: '😡', label: '화나요' },
]

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || [] } catch { return [] }
}
function save(entries) { localStorage.setItem(LS_KEY, JSON.stringify(entries)) }
function todayStr() { return new Date().toISOString().slice(0, 10) }

function getRecentDiaryKeywords() {
  try {
    const raw = localStorage.getItem('cherryplan_ai-diary')
    if (!raw) return null
    const entries = JSON.parse(raw)
    return entries
      .slice(-3)
      .map(e => e.emotion || e.feeling || '')
      .filter(Boolean)
      .join(', ')
  } catch { return null }
}

async function callClaude(mood, memo, keywords) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 1200))
    return { message: '오늘도 수고했어요. 어떤 하루였든 여기까지 온 것만으로도 충분해요. 내일은 조금 더 나아질 거예요 🍒' }
  }

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('API 키가 설정되지 않았어요. .env에 VITE_ANTHROPIC_API_KEY를 추가해주세요.')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: '당신은 따뜻한 감정 코치예요. 사용자의 오늘 기분을 듣고 위로와 동기부여가 담긴 한 마디를 해주세요. 반드시 JSON으로만 응답하세요: {"message": "응답 내용"}',
      messages: [{
        role: 'user',
        content: `오늘 기분: ${mood.emoji} ${mood.label}\n메모: ${memo || '없음'}\n최근 AI 일기 감정 키워드: ${keywords || '없음'}\n\n응답 형식 (JSON만):\n{"message": "위로와 동기부여 한 마디 (2~3문장, 친근한 한국어 존댓말)"}`,
      }],
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    throw new Error(`Claude API 오류 (${res.status}): ${errText}`)
  }

  const data = await res.json()
  const text = data.content[0].text.trim()
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('AI 응답 형식이 올바르지 않아요. 다시 시도해주세요.')
  return JSON.parse(jsonMatch[0])
}

function ClaudeCard({ message }) {
  return (
    <div className="bg-[#FFE4EC] border-l-4 border-[#FF6B8A] rounded-2xl p-5">
      <p className="text-xs font-bold text-[#E84393] mb-2">✨ Claude의 한 마디</p>
      <p className="text-sm text-[#1A1A2E] leading-relaxed">{message}</p>
    </div>
  )
}

function DayModal({ entry, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-80 max-w-[90vw] flex flex-col gap-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{entry.mood}</span>
            <div>
              <p className="text-sm font-bold text-[#1A1A2E]">{entry.moodLabel}</p>
              <p className="text-xs text-gray-400">{entry.date}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors text-lg leading-none">✕</button>
        </div>
        {entry.memo && (
          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{entry.memo}</p>
        )}
        {entry.claudeMessage && <ClaudeCard message={entry.claudeMessage} />}
      </div>
    </div>
  )
}

function CalendarView({ entries }) {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [selectedEntry, setSelectedEntry] = useState(null)

  const entryMap = {}
  entries.forEach(e => { entryMap[e.date] = e })

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const today = todayStr()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={prevMonth} className="w-9 h-9 rounded-full hover:bg-gray-100 transition-colors text-gray-500 text-xl flex items-center justify-center">‹</button>
        <p className="font-extrabold text-[#1A1A2E]">{year}년 {month + 1}월</p>
        <button onClick={nextMonth} className="w-9 h-9 rounded-full hover:bg-gray-100 transition-colors text-gray-500 text-xl flex items-center justify-center">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['일', '월', '화', '수', '목', '금', '토'].map(d => (
          <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const entry = entryMap[dateStr]
          const isToday = dateStr === today
          return (
            <button
              key={dateStr}
              onClick={() => entry && setSelectedEntry(entry)}
              disabled={!entry}
              className={`aspect-square flex flex-col items-center justify-center rounded-xl transition-all text-xs ${
                entry ? 'hover:shadow-md' : 'cursor-default'
              } ${isToday ? 'ring-2 ring-[#FF6B8A]' : ''}`}
              style={{ backgroundColor: entry ? '#FFE4EC' : '#F9F9F9' }}
            >
              <span className="text-gray-500 text-[11px]">{day}</span>
              {entry && <span className="text-base leading-tight">{entry.mood}</span>}
            </button>
          )
        })}
      </div>
      {selectedEntry && <DayModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}
    </div>
  )
}

export default function MoodTracker() {
  const [entries, setEntries] = useState(load)
  const [tab, setTab] = useState('today')
  const [selectedMood, setSelectedMood] = useState(null)
  const [memo, setMemo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  const today = todayStr()
  const todayEntry = entries.find(e => e.date === today)

  useEffect(() => { save(entries) }, [entries])

  async function handleSave() {
    if (!selectedMood || loading) return
    setLoading(true)
    setError('')
    try {
      const keywords = getRecentDiaryKeywords()
      const { message } = await callClaude(selectedMood, memo, keywords)
      const entry = {
        id: Date.now().toString(),
        date: today,
        mood: selectedMood.emoji,
        moodLabel: selectedMood.label,
        memo: memo.trim(),
        claudeMessage: message,
        createdAt: new Date().toISOString(),
      }
      setEntries(prev => [entry, ...prev.filter(e => e.date !== today)])
      setMemo('')
      setSelectedMood(null)
      setEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleDelete(id) {
    setEntries(prev => prev.filter(e => e.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  function startEdit() {
    setEditing(true)
    setSelectedMood(MOODS.find(m => m.emoji === todayEntry.mood) || null)
    setMemo(todayEntry.memo || '')
  }

  function cancelEdit() {
    setEditing(false)
    setSelectedMood(null)
    setMemo('')
  }

  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">😌 무드 트래커</h1>
          <p className="text-gray-400 text-sm mt-1">오늘 기분을 기록하고 Claude의 한 마디를 받아요</p>
        </div>
        {entries.length > 0 && (
          <NotionSyncButton onSync={() => syncMoodTracker(entries)} label="노션 동기화" />
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1">
        {[
          { key: 'today', label: '오늘 기록' },
          { key: 'calendar', label: '달력' },
          { key: 'list', label: '기록 리스트' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === t.key ? 'bg-white shadow text-[#FF6B8A]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'today' && (
        <div className="flex flex-col gap-6">
          {todayEntry && !editing ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-[#1A1A2E]">📅 {today} 기록됨</p>
                <div className="flex gap-3">
                  <button onClick={startEdit} className="text-xs text-[#FF6B8A] hover:underline transition-colors">수정</button>
                  <button onClick={() => handleDelete(todayEntry.id)} className="text-xs text-gray-300 hover:text-red-400 transition-colors">삭제</button>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white rounded-2xl shadow-md p-4">
                <span className="text-4xl">{todayEntry.mood}</span>
                <div>
                  <p className="font-bold text-[#1A1A2E]">{todayEntry.moodLabel}</p>
                  {todayEntry.memo && <p className="text-sm text-gray-500 mt-0.5">{todayEntry.memo}</p>}
                </div>
              </div>
              {todayEntry.claudeMessage && <ClaudeCard message={todayEntry.claudeMessage} />}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-sm font-bold text-[#1A1A2E] mb-3">오늘 기분이 어때요?</p>
                <div className="flex gap-3 flex-wrap">
                  {MOODS.map(m => (
                    <button
                      key={m.emoji}
                      onClick={() => setSelectedMood(m)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${
                        selectedMood?.emoji === m.emoji
                          ? 'border-[#FF6B8A] scale-110 bg-[#FFE4EC]'
                          : 'border-gray-100 hover:border-[#FF6B8A]/40 bg-white'
                      }`}
                    >
                      <span className="text-3xl">{m.emoji}</span>
                      <span className="text-xs text-gray-500">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={memo}
                onChange={e => setMemo(e.target.value)}
                placeholder="오늘 하루 어땠어요? (선택)"
                rows={3}
                disabled={loading}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#FF6B8A] transition-colors resize-none disabled:opacity-60 leading-relaxed"
              />
              {error && (
                <div className="text-xs text-red-500 bg-red-50 border border-red-200 px-4 py-3 rounded-xl leading-relaxed">
                  ⚠️ {error}
                </div>
              )}
              <div className="flex gap-2 justify-end">
                {editing && (
                  <button onClick={cancelEdit} className="px-5 py-2.5 rounded-full text-sm font-bold text-gray-400 bg-gray-100 hover:bg-gray-200 transition-colors">
                    취소
                  </button>
                )}
                <button
                  onClick={handleSave}
                  disabled={!selectedMood || loading}
                  className="px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(to right, #FF6B8A, #E84393)' }}
                >
                  {loading ? '✨ Claude가 오늘 기분을 읽고 있어요...' : '오늘 기분 저장 →'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'calendar' && <CalendarView entries={entries} />}

      {tab === 'list' && (
        <div className="flex flex-col gap-3">
          {sortedEntries.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center gap-3 text-gray-300">
              <span className="text-5xl">😌</span>
              <p className="text-sm">아직 기록이 없어요. 오늘 기분을 기록해봐요!</p>
            </div>
          ) : sortedEntries.map(entry => (
            <div key={entry.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{entry.mood}</span>
                  <div>
                    <p className="text-sm font-bold text-[#1A1A2E]">{entry.date}</p>
                    <p className="text-xs text-gray-400">
                      {entry.moodLabel}
                      {entry.memo ? ` · ${entry.memo.slice(0, 20)}${entry.memo.length > 20 ? '…' : ''}` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-gray-400 text-xs shrink-0 ml-2">
                  {expandedId === entry.id ? '접기 ▲' : '펼치기 ▼'}
                </span>
              </button>
              {expandedId === entry.id && (
                <div className="px-5 pb-5 flex flex-col gap-4">
                  <div className="flex justify-end">
                    <button onClick={() => handleDelete(entry.id)} className="text-xs text-gray-300 hover:text-red-400 transition-colors">삭제</button>
                  </div>
                  {entry.memo && (
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{entry.memo}</p>
                  )}
                  {entry.claudeMessage && <ClaudeCard message={entry.claudeMessage} />}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
