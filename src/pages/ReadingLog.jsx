import { useState, useRef } from 'react'
import { syncReadingLog } from '../utils/notionSync'
import NotionSyncButton from '../components/NotionSyncButton'

const STORAGE_KEY = 'cherryplan_reading-log'
const API_KEY = import.meta.env.VITE_ALADIN_API_KEY

const STATUS_META = {
  want:    { label: '읽고 싶음', color: '#FF6B8A', bg: '#FFE4EC' },
  reading: { label: '읽는 중',   color: '#FF9800', bg: '#FFF3E0' },
  done:    { label: '완독',      color: '#4CAF50', bg: '#E8F5E9' },
}

function loadBooks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') }
  catch { return [] }
}

function saveBooks(books) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books))
}

function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={`text-xl transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <span style={{ color: star <= (hover || value) ? '#FF6B8A' : '#E0E0E0' }}>★</span>
        </button>
      ))}
    </div>
  )
}

function BookCard({ book, onDelete, onEdit }) {
  const status = STATUS_META[book.status]
  return (
    <article className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col">
      {/* 커버 */}
      <div className="relative bg-gray-50 flex items-center justify-center h-44">
        {book.cover
          ? <img src={book.cover} alt={book.title} className="h-full w-full object-contain p-2" />
          : <span className="text-5xl">📖</span>
        }
        <span
          className="absolute top-2 right-2 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ color: status.color, backgroundColor: status.bg }}
        >
          {status.label}
        </span>
      </div>

      {/* 정보 */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-bold text-[#1A1A2E] text-sm leading-snug line-clamp-2">{book.title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>
        </div>
        <StarRating value={book.rating} readonly />
        {book.status === 'reading' && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">진행률</span>
              <span className="text-xs font-bold" style={{ color: '#FF9800' }}>{book.progress ?? 0}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${book.progress ?? 0}%`, backgroundColor: '#FF9800' }}
              />
            </div>
          </div>
        )}
        {book.memo && <p className="text-xs text-gray-500 line-clamp-2 italic">"{book.memo}"</p>}
        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={() => onEdit(book)}
            className="flex-1 text-xs py-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            수정
          </button>
          <button
            onClick={() => onDelete(book.id)}
            className="flex-1 text-xs py-1.5 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>
    </article>
  )
}

function BookModal({ initial, onSave, onClose }) {
  const isEdit = !!initial?.id
  const [tab, setTab] = useState(isEdit ? 'form' : 'search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(
    initial ?? { title: '', author: '', cover: '', publisher: '', status: 'want', rating: 0, memo: '', progress: 0 }
  )
  const debounceRef = useRef(null)

  async function search(q) {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ttbkey: API_KEY,
        Query: q,
        QueryType: 'Keyword',
        MaxResults: '8',
        SearchTarget: 'Book',
        output: 'js',
        Version: '20131101',
      })
      const res = await fetch(`/api/aladin?${params}`)
      const data = await res.json()
      setResults(data.item || [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  function handleQueryChange(e) {
    const val = e.target.value
    setQuery(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 400)
  }

  function selectBook(item) {
    setForm((prev) => ({
      ...prev,
      title: item.title.replace(/\s*\(.*?\)\s*$/g, '').trim(),
      author: item.author?.replace(/\s*(지은이|옮긴이|저|역)\s*/g, '').trim() || '',
      cover: item.cover?.replace('http://', 'https://') || '',
      publisher: item.publisher || '',
    }))
    setTab('form')
  }

  function handleSave() {
    if (!form.title.trim()) return
    onSave({
      ...form,
      id: initial?.id ?? Date.now(),
      addedAt: initial?.addedAt ?? new Date().toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex gap-2">
            {!isEdit && (
              <>
                <button
                  onClick={() => setTab('search')}
                  className={`text-sm font-semibold px-3 py-1 rounded-full transition-colors ${tab === 'search' ? 'bg-[#FFE4EC] text-[#FF6B8A]' : 'text-gray-400'}`}
                >
                  🔍 책 검색
                </button>
                <button
                  onClick={() => setTab('form')}
                  className={`text-sm font-semibold px-3 py-1 rounded-full transition-colors ${tab === 'form' ? 'bg-[#FFE4EC] text-[#FF6B8A]' : 'text-gray-400'}`}
                >
                  ✏️ 직접 입력
                </button>
              </>
            )}
            {isEdit && <span className="text-sm font-bold text-[#1A1A2E]">책 수정</span>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 flex flex-col gap-4">
          {/* 검색 탭 */}
          {tab === 'search' && (
            <>
              <input
                autoFocus
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="책 제목 또는 저자명 검색"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B8A] transition-colors"
              />
              {loading && <p className="text-sm text-center text-gray-400 py-4">검색 중...</p>}
              {!loading && results.length === 0 && query && (
                <p className="text-sm text-center text-gray-400 py-4">검색 결과가 없어요</p>
              )}
              <ul className="flex flex-col gap-2">
                {results.map((item) => (
                  <li
                    key={item.isbn13 || item.isbn}
                    onClick={() => selectBook(item)}
                    className="flex gap-3 p-3 rounded-xl hover:bg-[#FFF0F5] cursor-pointer transition-colors border border-transparent hover:border-pink-100"
                  >
                    {item.cover
                      ? <img src={item.cover.replace('http://', 'https://')} alt="" className="w-12 h-16 object-cover rounded-lg shrink-0" />
                      : <div className="w-12 h-16 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center text-xl">📖</div>
                    }
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#1A1A2E] line-clamp-2 leading-snug">
                        {item.title.replace(/\s*\(.*?\)\s*$/g, '').trim()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.author}</p>
                      <p className="text-xs text-gray-300">{item.publisher}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* 입력 폼 탭 */}
          {tab === 'form' && (
            <>
              {form.cover && (
                <div className="flex justify-center">
                  <img src={form.cover} alt="" className="h-32 object-contain rounded-xl shadow" />
                </div>
              )}

              {[
                { key: 'title',     label: '제목 *', placeholder: '책 제목' },
                { key: 'author',    label: '저자',   placeholder: '저자명' },
                { key: 'publisher', label: '출판사', placeholder: '출판사' },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500">{label}</label>
                  <input
                    type="text"
                    value={form[key]}
                    onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                    placeholder={placeholder}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B8A] transition-colors"
                  />
                </div>
              ))}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">독서 상태</label>
                <div className="flex gap-2">
                  {Object.entries(STATUS_META).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, status: key }))}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold border transition-all"
                      style={form.status === key
                        ? { backgroundColor: val.bg, color: val.color, borderColor: val.color }
                        : { borderColor: '#E5E7EB', color: '#9CA3AF' }
                      }
                    >
                      {val.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">별점</label>
                <StarRating value={form.rating} onChange={(v) => setForm((p) => ({ ...p, rating: v }))} />
              </div>

              {form.status === 'reading' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500">읽은 진행률</label>
                    <span className="text-xs font-bold" style={{ color: '#FF9800' }}>{form.progress ?? 0}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={form.progress ?? 0}
                    onChange={(e) => {
                      const val = Number(e.target.value)
                      if (val === 100 && window.confirm('100%를 달성했어요! 🎉\n완독 상태로 변경할까요?')) {
                        setForm((p) => ({ ...p, progress: 100, status: 'done' }))
                      } else {
                        setForm((p) => ({ ...p, progress: val }))
                      }
                    }}
                    className="w-full accent-orange-400 cursor-pointer"
                  />
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{ width: `${form.progress ?? 0}%`, backgroundColor: '#FF9800' }}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">한 줄 감상</label>
                <textarea
                  value={form.memo}
                  onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
                  placeholder="책에 대한 감상을 남겨요 (선택)"
                  rows={2}
                  maxLength={200}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-[#FF6B8A] transition-colors"
                />
              </div>
            </>
          )}
        </div>

        {/* 저장 버튼 */}
        {tab === 'form' && (
          <div className="px-5 py-4 border-t border-gray-100">
            <button
              onClick={handleSave}
              disabled={!form.title.trim()}
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-40"
              style={{ backgroundColor: '#FF6B8A' }}
            >
              {isEdit ? '수정 저장' : '책 추가'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ReadingLog() {
  const [books, setBooks] = useState(loadBooks)
  const [filter, setFilter] = useState('all')
  const [modal, setModal] = useState(null) // null | 'add' | book(for edit)

  async function handleNotionSync() {
    const { updated } = await syncReadingLog(books)
    setBooks((prev) => {
      const idMap = Object.fromEntries(updated.map((b) => [b.id, b.notionId]))
      const next = prev.map((b) => idMap[b.id] ? { ...b, notionId: idMap[b.id] } : b)
      saveBooks(next)
      return next
    })
    return { updated, errors: [] }
  }

  function handleSave(book) {
    setBooks((prev) => {
      const exists = prev.find((b) => b.id === book.id)
      const updated = exists
        ? prev.map((b) => b.id === book.id ? book : b)
        : [book, ...prev]
      saveBooks(updated)
      return updated
    })
    setModal(null)
  }

  function handleDelete(id) {
    if (!window.confirm('이 책을 삭제할까요?')) return
    setBooks((prev) => {
      const updated = prev.filter((b) => b.id !== id)
      saveBooks(updated)
      return updated
    })
  }

  const filtered = filter === 'all' ? books : books.filter((b) => b.status === filter)
  const counts = {
    all: books.length,
    want: books.filter((b) => b.status === 'want').length,
    reading: books.filter((b) => b.status === 'reading').length,
    done: books.filter((b) => b.status === 'done').length,
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">📚 독서 기록</h1>
          <p className="text-sm text-gray-400 mt-0.5">읽은 책을 기록하고 별점과 감상을 남겨요</p>
        </div>
        <NotionSyncButton onSync={handleNotionSync} disabled={books.length === 0} />
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-2xl">
        {[
          { key: 'all', label: '전체' },
          { key: 'want', label: '읽고 싶음' },
          { key: 'reading', label: '읽는 중' },
          { key: 'done', label: '완독' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
              filter === key ? 'bg-white shadow text-[#1A1A2E]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {label}
            <span className="ml-1 text-xs opacity-60">({counts[key]})</span>
          </button>
        ))}
      </div>

      {/* 카드 그리드 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-6xl">📖</span>
          <p className="text-gray-400">
            {filter === 'all' ? '아직 기록된 책이 없어요' : `${STATUS_META[filter]?.label} 책이 없어요`}
          </p>
          <button
            onClick={() => setModal('add')}
            className="mt-2 px-5 py-2 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: '#FF6B8A' }}
          >
            첫 번째 책 추가하기
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onDelete={handleDelete}
              onEdit={(b) => setModal(b)}
            />
          ))}
        </div>
      )}

      {/* 플로팅 추가 버튼 */}
      <button
        onClick={() => setModal('add')}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white text-2xl hover:opacity-90 active:scale-95 transition-all"
        style={{ backgroundColor: '#FF6B8A' }}
        title="책 추가"
      >
        +
      </button>

      {/* 모달 */}
      {modal && (
        <BookModal
          initial={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
