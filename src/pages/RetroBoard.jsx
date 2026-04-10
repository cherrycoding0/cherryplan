import { useState, useMemo, useEffect } from 'react'
import { syncRetroBoard, fetchRetroBoard } from '../utils/notionSync'
import NotionSyncButton from '../components/NotionSyncButton'
import DevDiarySection from '../components/DevDiarySection'

const TASK_KEY = 'cherryplan_retro-board'

const COLUMNS = [
  { key: 'todo',  label: '해야할 일', emoji: '📋', bg: '#F5F5F5', color: '#757575', border: '#BDBDBD' },
  { key: 'doing', label: '하는 중',   emoji: '⚡', bg: '#E3F2FD', color: '#2196F3', border: '#90CAF9' },
  { key: 'done',  label: '완료',      emoji: '✅', bg: '#E8F5E9', color: '#4CAF50', border: '#A5D6A7' },
]

// 카테고리 색상 팔레트 (순서대로 자동 배정)
const CAT_COLORS = [
  { bg: '#FFE4EC', color: '#FF6B8A' },
  { bg: '#FFF3E0', color: '#FF9800' },
  { bg: '#F3E5F5', color: '#9C27B0' },
  { bg: '#E0F7FA', color: '#00BCD4' },
  { bg: '#FFF8E1', color: '#FFC107' },
  { bg: '#FCE4EC', color: '#E91E63' },
]

function load() {
  try { return JSON.parse(localStorage.getItem(TASK_KEY)) || [] } catch { return [] }
}
function save(cards) {
  localStorage.setItem(TASK_KEY, JSON.stringify(cards))
}

// 카테고리 → 색상 매핑 (목록 순서 기반)
function makeCatColorMap(categories) {
  return Object.fromEntries(categories.map((c, i) => [c, CAT_COLORS[i % CAT_COLORS.length]]))
}

function CategoryBadge({ category, colorMap }) {
  const cc = colorMap[category]
  if (!category || !cc) return null
  return (
    <span className="self-start text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: cc.bg, color: cc.color }}>
      {category}
    </span>
  )
}

// 추가 / 수정 공용 폼
function CardForm({ initialText = '', initialCategory = '', categories, colColor, onSubmit, onCancel, submitLabel = '추가' }) {
  const [text, setText]         = useState(initialText)
  const [category, setCategory] = useState(initialCategory)

  function handleSubmit(e) {
    e.preventDefault()
    const t = text.trim()
    if (!t) return
    onSubmit({ text: t, category: category.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-3 bg-white rounded-xl border-2" style={{ borderColor: colColor }}>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="할 일을 입력하세요"
        rows={3}
        className="resize-none text-sm text-[#1A1A2E] placeholder-gray-300 focus:outline-none"
        onKeyDown={(e) => { if (e.key === 'Escape') onCancel() }}
      />
      <input
        list="cat-datalist"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        placeholder="카테고리 (선택) — 예: 포트폴리오"
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-gray-400 placeholder-gray-300"
      />
      <datalist id="cat-datalist">
        {categories.map((c) => <option key={c} value={c} />)}
      </datalist>
      <div className="flex gap-2">
        <button type="submit" className="flex-1 py-1.5 rounded-lg text-xs font-bold text-white" style={{ backgroundColor: colColor }}>
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 py-1.5 rounded-lg text-xs font-bold text-gray-400 bg-gray-100 hover:bg-gray-200">
          취소
        </button>
      </div>
    </form>
  )
}

function Card({ card, colorMap, onDelete, onEdit, isDragging, onDragStart, onDragEnd }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-white rounded-xl p-3 shadow-sm flex flex-col gap-2 group cursor-grab active:cursor-grabbing select-none transition-opacity duration-150 ${isDragging ? 'opacity-30 scale-95' : 'opacity-100'}`}
    >
      {card.category && <CategoryBadge category={card.category} colorMap={colorMap} />}
      <p className="text-sm text-[#1A1A2E] leading-relaxed whitespace-pre-wrap break-words">{card.text}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-300">
          {new Date(card.createdAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })}
        </span>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(card.id)} className="text-gray-300 hover:text-blue-400 transition-colors text-sm" title="수정">
            ✎
          </button>
          <button onClick={() => onDelete(card.id)} className="text-gray-300 hover:text-red-400 transition-colors text-xs" title="삭제">
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TaskBoard() {
  const [cards, setCards]             = useState(load)
  const [adding, setAdding]           = useState(null)
  const [editingId, setEditingId]     = useState(null)
  const [filterCat, setFilterCat]     = useState('all')
  const [dragId, setDragId]           = useState(null)
  const [dragOverCol, setDragOverCol] = useState(null)
  const [notionSample, setNotionSample] = useState([])

  useEffect(() => {
    if (cards.length === 0) fetchRetroBoard().then(setNotionSample)
  }, [])

  const allCategories = useMemo(
    () => [...new Set(cards.map((c) => c.category).filter(Boolean))].sort(),
    [cards]
  )
  const colorMap = useMemo(() => makeCatColorMap(allCategories), [allCategories])

  const visibleCards = filterCat === 'all' ? cards : cards.filter((c) => c.category === filterCat)

  function update(next) { setCards(next); save(next) }

  function addCard(colKey, { text, category }) {
    const card = { id: Date.now().toString(), column: colKey, text, category, createdAt: new Date().toISOString() }
    update([...cards, card])
    setAdding(null)
  }

  function editCard(id, { text, category }) {
    update(cards.map((c) => c.id === id ? { ...c, text, category } : c))
    setEditingId(null)
  }

  function deleteCard(id) {
    if (!window.confirm('카드를 삭제할까요?')) return
    update(cards.filter((c) => c.id !== id))
  }

  function moveCard(id, targetCol) {
    const card = cards.find((c) => c.id === id)
    if (!card || card.column === targetCol) return
    update(cards.map((c) => c.id === id ? { ...c, column: targetCol } : c))
  }

  function handleDrop(e, colKey) {
    e.preventDefault()
    if (dragId) moveCard(dragId, colKey)
    setDragId(null)
    setDragOverCol(null)
  }

  function clearAll() {
    if (!window.confirm('보드를 초기화할까요? 모든 카드가 삭제됩니다.')) return
    update([])
  }

  async function handleNotionSync() {
    const { updated, errors } = await syncRetroBoard(cards)
    const idMap = Object.fromEntries(updated.map((c) => [c.id, c.notionId]))
    update(cards.map((c) => idMap[c.id] ? { ...c, notionId: idMap[c.id] } : c))
    return { updated, errors }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 flex flex-col gap-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">📋 나만의 태스크 보드</h1>
          <p className="text-sm text-gray-400 mt-0.5">할 일을 카드로 관리하고 드래그로 이동해요</p>
        </div>
        <div className="flex items-center gap-2">
          <NotionSyncButton onSync={handleNotionSync} disabled={cards.length === 0} />
          {cards.length > 0 && (
            <button onClick={clearAll} className="text-xs text-gray-300 hover:text-red-400 transition-colors px-2 py-1">
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 카테고리 필터 */}
      {allCategories.length > 0 && (
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs text-gray-400 font-semibold">필터:</span>
          <button
            onClick={() => setFilterCat('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              filterCat === 'all'
                ? 'bg-[#1A1A2E] text-white border-[#1A1A2E]'
                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
            }`}
          >
            전체 {cards.length}
          </button>
          {allCategories.map((cat) => {
            const cc = colorMap[cat]
            const count = cards.filter((c) => c.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setFilterCat(filterCat === cat ? 'all' : cat)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border transition-all"
                style={
                  filterCat === cat
                    ? { backgroundColor: cc.color, color: '#fff', borderColor: cc.color }
                    : { backgroundColor: cc.bg, color: cc.color, borderColor: cc.bg }
                }
              >
                {cat} {count}
              </button>
            )
          })}
        </div>
      )}

      {/* 3열 칸반 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map(({ key, label, emoji, bg, color, border }) => {
          const colCards = visibleCards.filter((c) => c.column === key)
          const isOver = dragOverCol === key

          return (
            <div
              key={key}
              className="flex flex-col gap-3"
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(key) }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragOverCol(null) }}
              onDrop={(e) => handleDrop(e, key)}
            >
              {/* 컬럼 헤더 */}
              <div
                className="rounded-2xl p-4 transition-all duration-150"
                style={{ backgroundColor: isOver ? border : bg, outline: isOver ? `2px solid ${border}` : 'none' }}
              >
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-base" style={{ color }}>{emoji} {label}</h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: color }}>
                    {colCards.length}
                  </span>
                </div>
              </div>

              {/* 카드 목록 */}
              <div className={`flex flex-col gap-2 min-h-[80px] rounded-2xl p-2 transition-all duration-150 ${isOver ? 'bg-blue-50' : ''}`}>
                {cards.length === 0 && notionSample.filter((c) => c.column === key).map((card) => (
                  <div key={card.id} className="bg-white rounded-xl shadow-sm p-3 flex flex-col gap-1.5 opacity-70">
                    <p className="text-sm text-[#1A1A2E] leading-snug">{card.text}</p>
                    {card.category && (
                      <span className="self-start text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">{card.category}</span>
                    )}
                  </div>
                ))}
                {colCards.map((card) =>
                  editingId === card.id ? (
                    <CardForm
                      key={card.id}
                      initialText={card.text}
                      initialCategory={card.category || ''}
                      categories={allCategories}
                      colColor={color}
                      onSubmit={(data) => editCard(card.id, data)}
                      onCancel={() => setEditingId(null)}
                      submitLabel="저장"
                    />
                  ) : (
                    <Card
                      key={card.id}
                      card={card}
                      colorMap={colorMap}
                      onDelete={deleteCard}
                      onEdit={setEditingId}
                      isDragging={dragId === card.id}
                      onDragStart={() => setDragId(card.id)}
                      onDragEnd={() => { setDragId(null); setDragOverCol(null) }}
                    />
                  )
                )}
                {isOver && dragId && colCards.every((c) => c.id !== dragId) && (
                  <div className="rounded-xl border-2 border-dashed h-16 flex items-center justify-center text-xs" style={{ borderColor: border, color }}>
                    여기에 놓기
                  </div>
                )}
              </div>

              {/* 카드 추가 */}
              {adding === key ? (
                <CardForm
                  categories={allCategories}
                  colColor={color}
                  onSubmit={(data) => addCard(key, data)}
                  onCancel={() => setAdding(null)}
                />
              ) : (
                <button
                  onClick={() => setAdding(key)}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold border-2 border-dashed transition-all hover:border-solid"
                  style={{ borderColor: border, color, backgroundColor: `${bg}80` }}
                >
                  + 카드 추가
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* 빈 상태 */}
      {cards.length === 0 && notionSample.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">각 열의 <strong>+ 카드 추가</strong>를 눌러 할 일을 등록해요</p>
          <p className="text-xs mt-2 text-gray-300">카드를 드래그해서 열 사이를 이동할 수 있어요</p>
        </div>
      )}
      <DevDiarySection
        devDiaryUrl="https://www.notion.so/4c5905c527e24951b55b1bc360576888"
        prompts={[
          `태스크 보드(RetroBoard.jsx)를 만들어줘.
해야할 일 / 하는 중 / 완료 3칸 칸반 보드.
카드 드래그앤드롭으로 열 이동.
카테고리별 색상 자동 배정 (6색 팔레트 순환).
localStorage cherryplan_retro-board 저장.`,
        ]}
      />
    </div>
  )
}
