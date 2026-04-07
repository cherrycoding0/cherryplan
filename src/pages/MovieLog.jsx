import { useState, useEffect, useCallback, useRef } from 'react'
import { syncMovieLog } from '../utils/notionSync'
import NotionSyncButton from '../components/NotionSyncButton'
import MovieModal from '../components/MovieModal'

// TMDB API 검색 비활성화 시 목업 데이터 사용
const USE_MOCK = false

const LS_KEY = 'cherryplan_movie-log'
const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY || ''

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || [] } catch { return [] }
}
function save(items) { localStorage.setItem(LS_KEY, JSON.stringify(items)) }
function todayStr() { return new Date().toISOString().slice(0, 10) }

const MOCK_RESULTS = [
  { id: 1396, title: '브레이킹 배드', type: '드라마', poster: null, mediaType: 'tv' },
  { id: 238, title: '대부', type: '영화', poster: '/3bhkrj58Vtu7enYsLlegkAo.jpg', mediaType: 'movie' },
]

async function searchTMDB(query) {
  if (!query.trim()) return []
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300))
    return MOCK_RESULTS.filter((m) => m.title.toLowerCase().includes(query.toLowerCase()))
  }
  if (!TMDB_KEY) return []
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_KEY}&language=ko-KR&query=${encodeURIComponent(query)}`
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.results || [])
      .filter((r) => r.media_type === 'movie' || r.media_type === 'tv')
      .slice(0, 8)
      .map((r) => ({
        id: r.id,
        title: r.title || r.name || '제목 없음',
        type: r.media_type === 'movie' ? '영화' : '드라마',
        poster: r.poster_path || null,
        mediaType: r.media_type,
      }))
  } catch { return [] }
}

const TABS = [
  { id: 'all', label: '전체' },
  { id: 'want', label: '보고싶어요' },
  { id: 'watching', label: '보는중' },
  { id: 'done', label: '봤어요' },
]

const STATUS_STYLE = {
  want:     { bg: '#FFE4EC', text: '#E84393', label: '보고싶어요' },
  watching: { bg: '#FF6B8A', text: '#fff',    label: '보는중' },
  done:     { bg: '#E84393', text: '#fff',    label: '봤어요' },
}

function PosterImg({ poster, title }) {
  if (!poster) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#FFE4EC] text-4xl">
        🎬
      </div>
    )
  }
  return (
    <img
      src={`https://image.tmdb.org/t/p/w200${poster}`}
      alt={title}
      className="w-full h-full object-cover"
      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex' }}
    />
  )
}

function StarRating({ value }) {
  return (
    <span className="text-xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ opacity: i < value ? 1 : 0.25 }}>⭐</span>
      ))}
    </span>
  )
}

function MovieCard({ item, onClick }) {
  const st = STATUS_STYLE[item.status]
  return (
    <button
      onClick={() => onClick(item)}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden text-left flex flex-col"
    >
      <div className="relative w-full" style={{ aspectRatio: '2/3' }}>
        <PosterImg poster={item.poster} title={item.title} />
        <div style={{ display: 'none' }} className="w-full h-full absolute inset-0 items-center justify-center bg-[#FFE4EC] text-4xl">
          🎬
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="font-bold text-[#1A1A2E] text-sm leading-tight line-clamp-2">{item.title}</p>
        <p className="text-xs text-gray-400">{item.type}</p>
        {item.rating > 0 && <StarRating value={item.rating} />}
        <span
          className="self-start mt-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: st.bg, color: st.text }}
        >
          {st.label}
        </span>
      </div>
    </button>
  )
}

export default function MovieLog() {
  const [items, setItems] = useState(load)
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const debounceRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => { save(items) }, [items])

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSearch = useCallback((value) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) { setResults([]); setShowDropdown(false); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const found = await searchTMDB(value)
      setResults(found)
      setShowDropdown(true)
      setSearching(false)
    }, 300)
  }, [])

  function addItem(result) {
    const exists = items.find((i) => i.id === `tmdb_${result.id}`)
    if (exists) { setSelectedItem(exists); setShowDropdown(false); setQuery(''); return }
    const newItem = {
      id: `tmdb_${result.id}`,
      title: result.title,
      type: result.type,
      poster: result.poster,
      status: 'want',
      rating: 0,
      memo: '',
      addedAt: todayStr(),
      doneAt: '',
    }
    setItems((prev) => [newItem, ...prev])
    setSelectedItem(newItem)
    setShowDropdown(false)
    setQuery('')
  }

  function updateItem(updated) {
    setItems((prev) => prev.map((i) => i.id === updated.id ? updated : i))
    setSelectedItem(updated)
  }

  function deleteItem(id) {
    setItems((prev) => prev.filter((i) => i.id !== id))
    setSelectedItem(null)
  }

  const filtered = tab === 'all' ? items : items.filter((i) => i.status === tab)

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-8">
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">🎬 영화/드라마 기록</h1>
          <p className="text-gray-400 text-sm mt-1">보고싶은 작품을 기록하고 별점과 감상을 남겨요</p>
        </div>
        {items.length > 0 && (
          <NotionSyncButton
            onSync={() => syncMovieLog(items)}
            label="노션 동기화"
          />
        )}
      </div>

      {/* 검색바 */}
      <div className="relative" ref={searchRef}>
        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 focus-within:border-[#FF6B8A] bg-white transition-colors shadow-sm">
          <span className="text-gray-300 text-sm">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => results.length > 0 && setShowDropdown(true)}
            placeholder={
              !TMDB_KEY && !USE_MOCK
                ? 'VITE_TMDB_API_KEY를 .env에 추가하면 검색할 수 있어요'
                : '영화나 드라마를 검색해서 추가해요'
            }
            className="flex-1 text-sm text-[#1A1A2E] placeholder-gray-300 focus:outline-none bg-transparent"
            disabled={!TMDB_KEY && !USE_MOCK}
          />
          {searching && <span className="text-xs text-gray-300 animate-pulse">검색중...</span>}
        </div>

        {showDropdown && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 z-30 overflow-hidden">
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => addItem(r)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFE4EC] transition-colors text-left"
              >
                <div className="w-8 h-12 rounded-lg overflow-hidden bg-[#FFE4EC] shrink-0 flex items-center justify-center text-lg">
                  {r.poster
                    ? <img src={`https://image.tmdb.org/t/p/w200${r.poster}`} alt={r.title} className="w-full h-full object-cover" />
                    : '🎬'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1A1A2E]">{r.title}</p>
                  <p className="text-xs text-gray-400">{r.type}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {showDropdown && results.length === 0 && query.trim() && !searching && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 z-30 px-4 py-4">
            <p className="text-sm text-gray-400 text-center">검색 결과가 없어요</p>
          </div>
        )}
      </div>

      {/* 탭 */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((t) => {
          const count = t.id === 'all' ? items.length : items.filter((i) => i.status === t.id).length
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                tab === t.id
                  ? 'text-white shadow-md'
                  : 'bg-white text-gray-400 border border-gray-200 hover:border-[#FF6B8A] hover:text-[#FF6B8A]'
              }`}
              style={tab === t.id ? { background: 'linear-gradient(to right, #FF6B8A, #E84393)' } : {}}
            >
              {t.label} {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* 카드 그리드 */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {filtered.map((item) => (
            <MovieCard key={item.id} item={item} onClick={setSelectedItem} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 flex flex-col items-center gap-3 text-gray-300">
          <span className="text-5xl">🎬</span>
          <p className="text-sm">
            {tab === 'all' ? '아직 기록한 작품이 없어요. 검색해서 추가해봐요!' : `${STATUS_STYLE[tab]?.label ?? ''} 목록이 비어있어요`}
          </p>
        </div>
      )}

      {/* 상세 모달 */}
      {selectedItem && (
        <MovieModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={updateItem}
          onDelete={deleteItem}
        />
      )}
    </div>
  )
}
