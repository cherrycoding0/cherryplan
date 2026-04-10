import { useState, useMemo, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { syncBudget, fetchBudget } from '../utils/notionSync'
import NotionSyncButton from '../components/NotionSyncButton'
import DevDiarySection from '../components/DevDiarySection'

ChartJS.register(ArcElement, Tooltip, Legend)

const BUDGET_KEY = 'cherryplan_budget'

const EXPENSE_CATS = ['식비', '교통', '문화/여가', '쇼핑', '의료', '주거', '통신', '기타']
const INCOME_CATS  = ['급여', '부업', '용돈', '기타수입']
const CAT_COLORS   = ['#FF6B8A', '#2196F3', '#9C27B0', '#FF9800', '#4CAF50', '#00BCD4', '#FFC107', '#9E9E9E']

function load() {
  try { return JSON.parse(localStorage.getItem(BUDGET_KEY)) || [] } catch { return [] }
}
function save(items) { localStorage.setItem(BUDGET_KEY, JSON.stringify(items)) }
function toYM(date) { return date.slice(0, 7) }
function fmt(n) { return Number(n).toLocaleString('ko-KR') }
function today() { return new Date().toISOString().slice(0, 10) }
function currentYM() { return today().slice(0, 7) }
function prevYM(ym) {
  const [y, m] = ym.split('-').map(Number)
  return m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`
}
function nextYM(ym) {
  const [y, m] = ym.split('-').map(Number)
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
}

function AddForm({ onAdd }) {
  const [type,     setType]     = useState('expense')
  const [amount,   setAmount]   = useState('')
  const [category, setCategory] = useState('식비')
  const [memo,     setMemo]     = useState('')
  const [date,     setDate]     = useState(today())

  const cats = type === 'expense' ? EXPENSE_CATS : INCOME_CATS

  function handleSubmit(e) {
    e.preventDefault()
    const amt = Number(amount.replace(/,/g, ''))
    if (!amt || amt <= 0) return
    onAdd({ type, amount: amt, category, memo: memo.trim(), date })
    setAmount('')
    setMemo('')
  }

  function handleTypeChange(t) {
    setType(t)
    setCategory(t === 'expense' ? '식비' : '급여')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4">
      {/* 수입/지출 탭 */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
        {[['expense', '지출'], ['income', '수입']].map(([v, l]) => (
          <button
            key={v} type="button"
            onClick={() => handleTypeChange(v)}
            className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${type === v ? 'bg-white shadow text-[#1A1A2E]' : 'text-gray-400'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* 금액 */}
        <div className="col-span-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="금액 (원)"
            min="1"
            required
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B8A] transition-colors"
          />
        </div>
        {/* 카테고리 */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B8A] bg-white"
        >
          {cats.map((c) => <option key={c}>{c}</option>)}
        </select>
        {/* 날짜 */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B8A]"
        />
        {/* 메모 */}
        <input
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="메모 (선택)"
          className="col-span-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#FF6B8A]"
        />
      </div>

      <button
        type="submit"
        className="py-2.5 rounded-xl text-sm font-bold text-white transition-colors"
        style={{ backgroundColor: type === 'expense' ? '#FF6B8A' : '#4CAF50' }}
      >
        {type === 'expense' ? '지출' : '수입'} 추가
      </button>
    </form>
  )
}

function TransactionItem({ item, onDelete }) {
  const isExp = item.type === 'expense'
  const catIdx = (isExp ? EXPENSE_CATS : INCOME_CATS).indexOf(item.category)
  const color = CAT_COLORS[catIdx % CAT_COLORS.length]

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0 group">
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <div>
          <p className="text-sm font-semibold text-[#1A1A2E]">
            {item.memo || item.category}
          </p>
          <p className="text-xs text-gray-400">{item.category} · {item.date}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-bold ${isExp ? 'text-[#FF6B8A]' : 'text-[#4CAF50]'}`}>
          {isExp ? '-' : '+'}{fmt(item.amount)}원
        </span>
        <button
          onClick={() => onDelete(item.id)}
          className="text-gray-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default function Budget() {
  const [items,        setItems]        = useState(load)
  const [ym,           setYm]           = useState(currentYM)
  const [showForm,     setShowForm]     = useState(false)
  const [notionSample, setNotionSample] = useState([])

  useEffect(() => {
    if (items.length === 0) fetchBudget().then(setNotionSample)
  }, [])

  const monthItems = useMemo(() => items.filter((i) => toYM(i.date) === ym), [items, ym])

  const income  = useMemo(() => monthItems.filter((i) => i.type === 'income').reduce((s, i) => s + i.amount, 0), [monthItems])
  const expense = useMemo(() => monthItems.filter((i) => i.type === 'expense').reduce((s, i) => s + i.amount, 0), [monthItems])
  const balance = income - expense

  // 도넛 차트 데이터 (지출 카테고리별)
  const expMap = useMemo(() => {
    const map = {}
    monthItems.filter((i) => i.type === 'expense').forEach((i) => {
      map[i.category] = (map[i.category] || 0) + i.amount
    })
    return map
  }, [monthItems])

  const chartData = {
    labels: Object.keys(expMap),
    datasets: [{
      data: Object.values(expMap),
      backgroundColor: Object.keys(expMap).map((cat) => {
        const idx = EXPENSE_CATS.indexOf(cat)
        return CAT_COLORS[idx % CAT_COLORS.length]
      }),
      borderWidth: 0,
    }],
  }

  function addItem(data) {
    const item = { id: Date.now().toString(), ...data }
    const next = [item, ...items]
    setItems(next)
    save(next)
    setShowForm(false)
  }

  function deleteItem(id) {
    if (!window.confirm('삭제할까요?')) return
    const next = items.filter((i) => i.id !== id)
    setItems(next)
    save(next)
  }

  async function handleNotionSync() {
    const { updated, errors } = await syncBudget(items)
    const idMap = Object.fromEntries(updated.map((i) => [i.id, i.notionId]))
    const next = items.map((i) => idMap[i.id] ? { ...i, notionId: idMap[i.id] } : i)
    setItems(next)
    save(next)
    return { updated, errors }
  }

  const [y, m] = ym.split('-')

  return (
    <div className="max-w-lg mx-auto px-4 py-10 flex flex-col gap-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">💰 간단한 가계부</h1>
          <p className="text-sm text-gray-400 mt-0.5">수입과 지출을 기록하고 차트로 확인해요</p>
        </div>
        <NotionSyncButton onSync={handleNotionSync} disabled={items.length === 0} />
      </div>

      {/* 월 선택 */}
      <div className="flex items-center justify-between bg-white rounded-2xl shadow-md px-5 py-4">
        <button onClick={() => setYm(prevYM(ym))} className="text-gray-400 hover:text-[#1A1A2E] text-lg transition-colors">‹</button>
        <span className="font-extrabold text-[#1A1A2E]">{y}년 {m}월</span>
        <button
          onClick={() => setYm(nextYM(ym))}
          disabled={ym >= currentYM()}
          className="text-gray-400 hover:text-[#1A1A2E] text-lg transition-colors disabled:opacity-30"
        >›</button>
      </div>

      {/* 잔액 요약 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '수입', value: income,  color: '#4CAF50' },
          { label: '지출', value: expense, color: '#FF6B8A' },
          { label: '잔액', value: balance, color: balance >= 0 ? '#2196F3' : '#FF6B8A' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl shadow-md p-4 flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-semibold">{label}</span>
            <span className="text-base font-extrabold tabular-nums" style={{ color }}>
              {fmt(Math.abs(value))}
            </span>
          </div>
        ))}
      </div>

      {/* 도넛 차트 */}
      {Object.keys(expMap).length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3">
          <h2 className="font-bold text-[#1A1A2E] text-sm">지출 카테고리</h2>
          <div className="flex items-center gap-6">
            <div className="w-36 h-36 shrink-0">
              <Doughnut
                data={chartData}
                options={{
                  cutout: '65%',
                  plugins: { legend: { display: false }, tooltip: { callbacks: {
                    label: (ctx) => ` ${fmt(ctx.raw)}원`
                  }}},
                }}
              />
            </div>
            <ul className="flex flex-col gap-1.5 flex-1 min-w-0">
              {Object.entries(expMap).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
                const idx = EXPENSE_CATS.indexOf(cat)
                const color = CAT_COLORS[idx % CAT_COLORS.length]
                const pct = expense > 0 ? Math.round((amt / expense) * 100) : 0
                return (
                  <li key={cat} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-gray-600 truncate">{cat}</span>
                    </div>
                    <span className="text-gray-400 shrink-0">{pct}%</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}

      {/* 내역 추가 토글 */}
      <button
        onClick={() => setShowForm((v) => !v)}
        className="py-3 rounded-2xl text-sm font-bold text-white transition-all active:scale-95"
        style={{ backgroundColor: '#FF6B8A' }}
      >
        {showForm ? '✕ 닫기' : '+ 내역 추가'}
      </button>

      {showForm && <AddForm onAdd={addItem} />}

      {/* 내역 리스트 */}
      {monthItems.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-5">
          <h2 className="font-bold text-[#1A1A2E] text-sm mb-3">
            {m}월 내역 ({monthItems.length}건)
          </h2>
          <div className="max-h-80 overflow-y-auto">
            {[...monthItems].sort((a, b) => b.date.localeCompare(a.date)).map((item) => (
              <TransactionItem key={item.id} item={item} onDelete={deleteItem} />
            ))}
          </div>
        </div>
      ) : items.length === 0 && notionSample.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-3">
          <p className="text-xs text-gray-400 font-semibold">📖 예시 데이터 · 직접 추가하면 내 기록이 표시돼요</p>
          <div className="max-h-80 overflow-y-auto opacity-70">
            {notionSample.map((item) => (
              <TransactionItem key={item.id} item={item} onDelete={() => {}} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400">
          <p className="text-3xl mb-2">💸</p>
          <p className="text-sm">{m}월 내역이 없어요</p>
        </div>
      )}
      <DevDiarySection
        devDiaryUrl="https://www.notion.so/334bb3574f30810f91b5f320cb4c3bea"
        prompts={[
          `가계부 앱(Budget.jsx)을 만들어줘.
수입/지출 입력, 카테고리별 분류, 월별 집계.
Chart.js Doughnut 차트로 카테고리 비율 시각화.
이전/다음 달 이동, 수입-지출 합계 표시.
localStorage cherryplan_budget 저장.`,
        ]}
      />
    </div>
  )
}
