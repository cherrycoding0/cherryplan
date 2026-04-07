import { useState, useEffect } from 'react'
import { syncAiDiary, NOTION_DB } from '../utils/notionSync'
import NotionSyncButton from '../components/NotionSyncButton'

// dev: USE_MOCK=true 로 설정하면 Claude API 호출 없이 목업 응답 반환
const USE_MOCK = false

const LS_KEY = 'cherryplan_ai-diary'
const SYNC_PW = import.meta.env.VITE_SYNC_PASSWORD || ''
const SESSION_KEY = 'cherryplan_sync_auth'

function isAuthed() {
  return !SYNC_PW || sessionStorage.getItem(SESSION_KEY) === 'true'
}

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || [] } catch { return [] }
}
function save(entries) { localStorage.setItem(LS_KEY, JSON.stringify(entries)) }
function todayStr() { return new Date().toISOString().slice(0, 10) }

const MOCK_FEEDBACK = {
  emotion: '😌 평온함 속에 약간의 피곤함이 느껴져요. 하루를 열심히 살아낸 흔적이 보여요.',
  reframe: '오늘 힘들었던 순간들은 모두 당신이 성장하고 있다는 증거예요. 작은 시도 하나하나가 쌓여 큰 변화를 만들어갑니다.',
  tomorrow: '내일은 오늘보다 조금 더 나를 위한 시간을 가져봐요. 당신은 충분히 잘하고 있어요. 🌸',
}

async function callClaude(content) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 1500))
    return MOCK_FEEDBACK
  }

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았어요. .env 파일에 VITE_ANTHROPIC_API_KEY를 추가해주세요.')
  }

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
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `다음 일기를 읽고 한국어로 따뜻하게 피드백해줘. 반드시 아래 JSON 형식으로만 응답해.

일기:
${content}

응답 형식 (JSON만, 다른 텍스트 없이):
{
  "emotion": "감정 분석 (이모지 포함, 2-3문장)",
  "reframe": "긍정적 리프레이밍 (2-3문장)",
  "tomorrow": "내일을 위한 한 마디 (1-2문장)"
}`,
        },
      ],
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

async function fetchPublicDiaries() {
  if (!NOTION_DB.aiDiary) return []
  try {
    const res = await fetch(`/api/notion/v1/databases/${NOTION_DB.aiDiary}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filter: { property: '공개', checkbox: { equals: true } },
        sorts: [{ property: '날짜', direction: 'descending' }],
        page_size: 10,
      }),
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.results.map((page) => ({
      id: page.id,
      date: page.properties['날짜']?.title?.[0]?.plain_text || '',
      content: page.properties['일기내용']?.rich_text?.[0]?.plain_text || '',
      feedback: {
        emotion:  page.properties['감정분석']?.rich_text?.[0]?.plain_text || '',
        reframe:  page.properties['리프레이밍']?.rich_text?.[0]?.plain_text || '',
        tomorrow: page.properties['내일한마디']?.rich_text?.[0]?.plain_text || '',
      },
    }))
  } catch {
    return []
  }
}

function FeedbackCard({ feedback }) {
  return (
    <div className="flex flex-col gap-4 bg-[#FFE4EC] border-l-4 border-[#FF6B8A] rounded-2xl p-5">
      <h3 className="font-extrabold text-[#E84393] text-sm">✨ Claude의 피드백</h3>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-xs font-bold text-[#E84393] mb-1.5">감정 분석</p>
          <p className="text-sm text-[#1A1A2E] leading-relaxed">{feedback.emotion}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-[#E84393] mb-1.5">긍정적 리프레이밍</p>
          <p className="text-sm text-[#1A1A2E] leading-relaxed">{feedback.reframe}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-[#E84393] mb-1.5">내일을 위한 한 마디</p>
          <p className="text-sm text-[#1A1A2E] leading-relaxed">{feedback.tomorrow}</p>
        </div>
      </div>
    </div>
  )
}

function PasswordModal({ onConfirm, onCancel }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (input === SYNC_PW) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      onConfirm()
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 w-72"
      >
        <div>
          <h2 className="font-extrabold text-[#1A1A2E] text-base">🔒 AI 피드백</h2>
          <p className="text-xs text-gray-400 mt-1">비밀번호를 입력하세요</p>
        </div>
        <input
          autoFocus
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false) }}
          placeholder="비밀번호"
          className={`px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#FF6B8A]'
          }`}
        />
        {error && <p className="text-xs text-red-400 -mt-2">비밀번호가 틀렸어요</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 py-2 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: '#FF6B8A' }}
          >
            확인
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-sm font-bold text-gray-400 bg-gray-100 hover:bg-gray-200"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}

export default function AiDiary() {
  const [entries, setEntries] = useState(load)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [publicDiaries, setPublicDiaries] = useState([])
  const [expandedPublicId, setExpandedPublicId] = useState(null)

  const today = todayStr()
  const todayEntry = entries.find((e) => e.date === today)
  const pastEntries = entries.filter((e) => e.date !== today)

  useEffect(() => { save(entries) }, [entries])

  useEffect(() => {
    fetchPublicDiaries().then(setPublicDiaries)
  }, [])

  async function runFeedback() {
    setLoading(true)
    setError('')
    try {
      const feedback = await callClaude(content.trim())
      const entry = {
        id: Date.now().toString(),
        date: today,
        content: content.trim(),
        feedback,
        isPublic: false,
      }
      setEntries((prev) => {
        const filtered = prev.filter((e) => e.date !== today)
        return [entry, ...filtered]
      })
      setContent('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleClick(e) {
    e.preventDefault()
    if (!content.trim() || loading) return
    if (isAuthed()) {
      runFeedback()
    } else {
      setShowModal(true)
    }
  }

  function togglePublic(id) {
    setEntries((prev) =>
      prev.map((e) => e.id === id ? { ...e, isPublic: !e.isPublic } : e)
    )
  }

  function handleDelete(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    if (expandedId === id) setExpandedId(null)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">🤖 AI 일기 도우미</h1>
          <p className="text-gray-400 text-sm mt-1">일기를 쓰면 Claude가 감정을 분석하고 응원해줘요</p>
        </div>
        {entries.length > 0 && (
          <NotionSyncButton
            onSync={() => syncAiDiary(entries)}
            label="노션 동기화"
          />
        )}
      </div>

      {/* 오늘 일기 입력 */}
      <form onSubmit={handleClick} className="flex flex-col gap-3">
        <label className="text-sm font-bold text-[#1A1A2E]">
          📅 {today} — 오늘의 일기
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="오늘 어떤 하루를 보냈나요? 자유롭게 써봐요 🌸"
          rows={5}
          disabled={loading}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#FF6B8A] transition-colors resize-none disabled:opacity-60 leading-relaxed"
        />
        {error && (
          <div className="text-xs text-red-500 bg-red-50 border border-red-200 px-4 py-3 rounded-xl leading-relaxed">
            ⚠️ {error}
          </div>
        )}
        <button
          type="submit"
          disabled={!content.trim() || loading}
          className="self-end px-6 py-2.5 rounded-full text-sm font-bold text-white transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(to right, #FF6B8A, #E84393)' }}
        >
          {loading ? '✨ Claude가 읽고 있어요...' : 'AI 피드백 받기 →'}
        </button>
      </form>

      {/* 오늘 피드백 */}
      {todayEntry && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 font-semibold">오늘 일기의 Claude 피드백</p>
            <button
              onClick={() => handleDelete(todayEntry.id)}
              className="text-xs text-gray-300 hover:text-red-400 transition-colors"
            >
              삭제
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-4 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
            {todayEntry.content}
          </div>
          <FeedbackCard feedback={todayEntry.feedback} />
          <PublicToggle entry={todayEntry} onToggle={togglePublic} />
        </div>
      )}

      {/* 과거 일기 목록 */}
      {pastEntries.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-extrabold text-[#1A1A2E]">지난 일기</h2>
          {pastEntries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#1A1A2E]">{entry.date}</span>
                  {entry.isPublic && (
                    <span className="text-[10px] font-bold text-[#E84393] bg-[#FFE4EC] px-2 py-0.5 rounded-full">공개</span>
                  )}
                  <span className="text-xs text-gray-300 line-clamp-1 max-w-[140px] hidden sm:block">
                    {entry.content.slice(0, 28)}{entry.content.length > 28 ? '…' : ''}
                  </span>
                </div>
                <span className="text-gray-400 text-xs shrink-0 ml-2">
                  {expandedId === entry.id ? '접기 ▲' : '펼치기 ▼'}
                </span>
              </button>
              {expandedId === entry.id && (
                <div className="px-5 pb-5 flex flex-col gap-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-xs text-gray-300 hover:text-red-400 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                  <FeedbackCard feedback={entry.feedback} />
                  <PublicToggle entry={entry} onToggle={togglePublic} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 빈 상태 */}
      {entries.length === 0 && publicDiaries.length === 0 && (
        <div className="text-center py-16 flex flex-col items-center gap-3 text-gray-300">
          <span className="text-5xl">📝</span>
          <p className="text-sm">아직 일기가 없어요. 오늘의 이야기를 써봐요!</p>
        </div>
      )}

      {/* 공개 일기 둘러보기 */}
      {publicDiaries.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-[#1A1A2E]">📖 일기 둘러보기</h2>
            <span className="text-xs text-gray-400">공개된 일기예요</span>
          </div>
          {publicDiaries.map((entry) => (
            <div key={entry.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedPublicId(expandedPublicId === entry.id ? null : entry.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-[#1A1A2E]">{entry.date}</span>
                  <span className="text-xs text-gray-300 line-clamp-1 max-w-[160px] hidden sm:block">
                    {entry.content.slice(0, 28)}{entry.content.length > 28 ? '…' : ''}
                  </span>
                </div>
                <span className="text-gray-400 text-xs shrink-0 ml-2">
                  {expandedPublicId === entry.id ? '접기 ▲' : '펼치기 ▼'}
                </span>
              </button>
              {expandedPublicId === entry.id && (
                <div className="px-5 pb-5 flex flex-col gap-4">
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {entry.content}
                  </p>
                  <FeedbackCard feedback={entry.feedback} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <PasswordModal
          onConfirm={() => { setShowModal(false); runFeedback() }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function PublicToggle({ entry, onToggle }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer self-start select-none">
      <div
        onClick={() => onToggle(entry.id)}
        className={`w-9 h-5 rounded-full transition-colors relative ${
          entry.isPublic ? 'bg-[#FF6B8A]' : 'bg-gray-200'
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            entry.isPublic ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </div>
      <span className="text-xs text-gray-500">
        {entry.isPublic ? '공개 — 노션 동기화 시 공개됩니다' : '비공개'}
      </span>
    </label>
  )
}
