import { useState } from 'react'

const STATUS_OPTIONS = [
  { id: 'want',     label: '보고싶어요', bg: '#FFE4EC', text: '#E84393' },
  { id: 'watching', label: '보는중',     bg: '#FF6B8A', text: '#fff' },
  { id: 'done',     label: '봤어요',     bg: '#E84393', text: '#fff' },
]

function todayStr() { return new Date().toISOString().slice(0, 10) }

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const idx = i + 1
        const filled = idx <= (hovered || value)
        return (
          <button
            key={idx}
            type="button"
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(idx === value ? 0 : idx)}
            className="text-xl transition-transform hover:scale-110 active:scale-95"
            style={{ opacity: filled ? 1 : 0.25 }}
          >
            ⭐
          </button>
        )
      })}
    </div>
  )
}

export default function MovieModal({ item, onClose, onUpdate, onDelete }) {
  const [status, setStatus] = useState(item.status)
  const [rating, setRating] = useState(item.rating || 0)
  const [memo, setMemo] = useState(item.memo || '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleSave() {
    const doneAt = status === 'done' && item.status !== 'done' ? todayStr() : item.doneAt
    onUpdate({ ...item, status, rating, memo, doneAt })
    onClose()
  }

  function handleDelete() {
    onDelete(item.id)
  }

  const dirty = status !== item.status || rating !== (item.rating || 0) || memo !== (item.memo || '')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden max-h-[90vh]">
        {/* 포스터 + 기본 정보 */}
        <div className="flex gap-4 p-5 bg-[#FAFAFA] border-b border-gray-100">
          <div className="w-20 shrink-0 rounded-xl overflow-hidden shadow-md" style={{ aspectRatio: '2/3' }}>
            {item.poster ? (
              <img
                src={`https://image.tmdb.org/t/p/w200${item.poster}`}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#FFE4EC] text-3xl">
                🎬
              </div>
            )}
          </div>
          <div className="flex flex-col justify-center gap-1 min-w-0">
            <h2 className="font-extrabold text-[#1A1A2E] text-base leading-tight">{item.title}</h2>
            <p className="text-xs text-gray-400">{item.type}</p>
            {item.addedAt && (
              <p className="text-[10px] text-gray-300">추가일 {item.addedAt}</p>
            )}
            {item.doneAt && (
              <p className="text-[10px] text-gray-300">완료일 {item.doneAt}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="ml-auto self-start text-gray-300 hover:text-gray-500 transition-colors text-lg shrink-0"
          >
            ✕
          </button>
        </div>

        {/* 편집 영역 */}
        <div className="flex flex-col gap-5 p-5 overflow-y-auto">
          {/* 상태 */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-[#1A1A2E]">상태</p>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setStatus(opt.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                    status === opt.id ? 'shadow-md scale-105' : 'opacity-50 hover:opacity-80'
                  }`}
                  style={
                    status === opt.id
                      ? { backgroundColor: opt.bg, color: opt.text, borderColor: opt.bg }
                      : { backgroundColor: '#F5F5F5', color: '#888', borderColor: '#E0E0E0' }
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 별점 */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-[#1A1A2E]">별점 {rating > 0 && `(${rating}점)`}</p>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          {/* 감상 메모 */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold text-[#1A1A2E]">감상 메모</p>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="감상을 자유롭게 적어봐요..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#1A1A2E] focus:outline-none focus:border-[#FF6B8A] transition-colors resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 p-5 border-t border-gray-100">
          {confirmDelete ? (
            <>
              <p className="text-xs text-red-400 flex-1 flex items-center">정말 삭제할까요?</p>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-400 hover:bg-red-500 transition-colors"
              >
                삭제
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setConfirmDelete(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
              >
                삭제
              </button>
              <div className="flex-1" />
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={!dirty}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(to right, #FF6B8A, #E84393)' }}
              >
                저장
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
