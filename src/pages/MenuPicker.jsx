import { useState, useRef, useCallback, useEffect } from 'react'
import { syncMenu, fetchMenu } from '../utils/notionSync'
import NotionSyncButton from '../components/NotionSyncButton'

const MENU_KEY = 'cherryplan_menu-picker'

const MENUS = {
  korean:   ['된장찌개', '김치찌개', '비빔밥', '불고기', '삼겹살', '순두부찌개', '제육볶음', '갈비탕', '설렁탕', '삼계탕', '냉면', '부대찌개', '감자탕', '해물파전', '곰탕', '짬뽕떡볶이'],
  chinese:  ['짜장면', '짬뽕', '탕수육', '마파두부', '볶음밥', '마라탕', '양꼬치', '깐풍기', '유산슬', '마라샹궈'],
  japanese: ['초밥', '라멘', '우동', '돈카츠', '오야코동', '규동', '야키토리', '타코야키', '텐동', '소바'],
  western:  ['파스타', '피자', '스테이크', '버거', '리조또', '샌드위치', '그라탱', '뇨끼', '클럽샌드위치'],
}

const ALL_MENUS = Object.values(MENUS).flat()

const CATEGORIES = [
  { key: 'all',      label: '상관없어', emoji: '🎲' },
  { key: 'korean',   label: '한식',    emoji: '🍚' },
  { key: 'chinese',  label: '중식',    emoji: '🥢' },
  { key: 'japanese', label: '일식',    emoji: '🍣' },
  { key: 'western',  label: '양식',    emoji: '🍝' },
]

const SITUATIONS = [
  { key: 'all',      label: '상관없어', emoji: '😋' },
  { key: 'solo',     label: '혼밥',    emoji: '🙋' },
  { key: 'delivery', label: '배달',    emoji: '🛵' },
  { key: 'dineout',  label: '외식',    emoji: '🍽️' },
  { key: 'quick',    label: '간단하게', emoji: '⚡' },
]

const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.key, c.label]))
const SITUATION_LABEL = Object.fromEntries(SITUATIONS.map((s) => [s.key, s.label]))

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(MENU_KEY)) || [] } catch { return [] }
}

function saveHistory(history) {
  localStorage.setItem(MENU_KEY, JSON.stringify(history))
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function formatTime(iso) {
  return new Date(iso).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function MenuPicker() {
  const [category,     setCategory]     = useState('all')
  const [situation,    setSituation]    = useState('all')
  const [spinning,     setSpinning]     = useState(false)
  const [displayed,    setDisplayed]    = useState('?')
  const [result,       setResult]       = useState(null)
  const [history,      setHistory]      = useState(loadHistory)
  const [notionSample, setNotionSample] = useState([])
  const spinTimer = useRef(null)

  useEffect(() => {
    if (history.length === 0) fetchMenu().then(setNotionSample)
  }, [])

  const pool = category === 'all' ? ALL_MENUS : MENUS[category]

  const handleSpin = useCallback(() => {
    if (spinning) return
    setSpinning(true)
    setResult(null)

    let ticks = 0
    const totalTicks = 20
    const interval = 80

    function tick() {
      setDisplayed(randomFrom(pool))
      ticks++
      if (ticks < totalTicks) {
        spinTimer.current = setTimeout(tick, interval + ticks * 4)
      } else {
        const picked = randomFrom(pool)
        setDisplayed(picked)
        const entry = {
          id: Date.now().toString(),
          menu: picked,
          category,
          situation,
          pickedAt: new Date().toISOString(),
        }
        setResult(entry)
        const next = [entry, ...history].slice(0, 30)
        setHistory(next)
        saveHistory(next)
        setSpinning(false)
      }
    }
    tick()
  }, [spinning, pool, category, situation, history])

  async function handleNotionSync() {
    const { updated, errors } = await syncMenu(history)
    const idMap = Object.fromEntries(updated.map((s) => [s.id, s.notionId]))
    const next = history.map((h) => idMap[h.id] ? { ...h, notionId: idMap[h.id] } : h)
    setHistory(next)
    saveHistory(next)
    return { updated, errors }
  }

  function handleClearHistory() {
    if (!window.confirm('기록을 모두 삭제할까요?')) return
    setHistory([])
    saveHistory([])
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 flex flex-col gap-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">🍽️ 오늘의 메뉴</h1>
          <p className="text-sm text-gray-400 mt-0.5">뭐 먹을지 모를 땐 운명에 맡겨요</p>
        </div>
        <NotionSyncButton onSync={handleNotionSync} disabled={history.length === 0} />
      </div>

      {/* 카테고리 선택 */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-gray-500">어떤 종류?</p>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => { setCategory(key); setResult(null); setDisplayed('?') }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                category === key
                  ? 'bg-[#FF6B8A] text-white border-[#FF6B8A] shadow-sm'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-[#FF6B8A] hover:text-[#FF6B8A]'
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      {/* 상황 선택 */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-gray-500">어떤 상황?</p>
        <div className="flex gap-2 flex-wrap">
          {SITUATIONS.map(({ key, label, emoji }) => (
            <button
              key={key}
              onClick={() => setSituation(key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                situation === key
                  ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-[#1A1A2E] hover:text-[#1A1A2E]'
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>
      </div>

      {/* 룰렛 결과 영역 */}
      <div className="flex flex-col items-center gap-5">
        <div
          className={`w-full bg-white rounded-3xl shadow-md flex items-center justify-center py-12 transition-all duration-300 ${
            result ? 'border-2 border-[#FF6B8A]' : 'border border-gray-100'
          }`}
        >
          <span
            className={`text-5xl font-extrabold tabular-nums transition-all duration-100 ${
              spinning ? 'text-gray-300 scale-95' : result ? 'text-[#FF6B8A]' : 'text-gray-200'
            }`}
            style={{ letterSpacing: '-0.02em' }}
          >
            {displayed}
          </span>
        </div>

        {result && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="px-3 py-1 bg-[#FFE4EC] text-[#FF6B8A] rounded-full font-semibold">
              {CATEGORY_LABEL[result.category]}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full font-semibold">
              {SITUATION_LABEL[result.situation]}
            </span>
          </div>
        )}

        <button
          onClick={handleSpin}
          disabled={spinning}
          className="px-10 py-4 rounded-full font-extrabold text-white text-lg transition-all duration-200 hover:opacity-90 active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: '#FF6B8A' }}
        >
          {spinning ? '🎰 고르는 중...' : result ? '🔄 다시 고르기' : '🎲 오늘의 메뉴 고르기'}
        </button>
      </div>

      {/* 최근 기록 */}
      {(history.length > 0 || notionSample.length > 0) && (
        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[#1A1A2E]">최근 선택 기록</h2>
            {history.length > 0 && (
              <button onClick={handleClearHistory} className="text-xs text-gray-300 hover:text-red-400 transition-colors">
                전체 삭제
              </button>
            )}
          </div>
          {history.length === 0 && notionSample.length > 0 && (
            <p className="text-xs text-gray-400">📖 예시 데이터 · 메뉴를 고르면 내 기록이 표시돼요</p>
          )}
          <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {(history.length > 0 ? history : notionSample).map((h) => (
              <li key={h.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#1A1A2E]">{h.menu}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    {CATEGORY_LABEL[h.category]}
                  </span>
                </div>
                <span className="text-gray-400 text-xs shrink-0">{formatTime(h.pickedAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
