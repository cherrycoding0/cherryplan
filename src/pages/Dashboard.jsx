import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import DevDiarySection from '../components/DevDiarySection'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, ArcElement,
  Tooltip, Legend, Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement, ArcElement,
  Tooltip, Legend, Filler,
)

function todayStr() { return new Date().toISOString().slice(0, 10) }
function currentYM() { return todayStr().slice(0, 7) }
function fmtKRW(n) { return Number(n).toLocaleString('ko-KR') }

function ls(key) {
  try { return JSON.parse(localStorage.getItem(key)) ?? null } catch { return null }
}

// ── 데이터 파싱 ────────────────────────────────────────────────

function useReadingStats() {
  return useMemo(() => {
    const books = ls('cherryplan_reading-log')
    if (!books || books.length === 0) return null
    const done    = books.filter(b => b.status === 'done').length
    const reading = books.find(b => b.status === 'reading')
    return { done, total: books.length, readingTitle: reading?.title || null }
  }, [])
}

function usePomodoroStats() {
  return useMemo(() => {
    const sessions = ls('cherryplan_pomodoro')
    if (!sessions || sessions.length === 0) return null
    const today = todayStr()
    const todayFocus = sessions.filter(
      s => s.type === 'focus' && s.completedAt?.slice(0, 10) === today
    )
    const totalMins = Math.round(todayFocus.reduce((sum, s) => sum + (s.duration || 0), 0) / 60)
    return { totalMins, sessionCount: todayFocus.length }
  }, [])
}

function useHabitStats() {
  return useMemo(() => {
    const data = ls('cherryplan_habit-tracker')
    if (!data || !data.habits?.length) return null
    const today = todayStr()
    const total  = data.habits.length
    const done   = data.logs?.filter(l => l.date === today && l.done).length ?? 0
    return { done, total }
  }, [])
}

function useBudgetStats() {
  return useMemo(() => {
    const items = ls('cherryplan_budget')
    if (!items || items.length === 0) return null
    const ym = currentYM()
    const expense = items
      .filter(i => i.type === 'expense' && i.date?.startsWith(ym))
      .reduce((sum, i) => sum + (i.amount || 0), 0)
    return { expense }
  }, [])
}

function useTaskStats() {
  return useMemo(() => {
    const cards = ls('cherryplan_retro-board')
    if (!cards || cards.length === 0) return null
    const total = cards.length
    const done  = cards.filter(c => c.column === 'done').length
    return { done, total }
  }, [])
}

function useMovieStats() {
  return useMemo(() => {
    const items = ls('cherryplan_movie-log')
    if (!items || items.length === 0) return null
    const watching = items.filter(i => i.status === 'watching').length
    const done     = items.filter(i => i.status === 'done').length
    const latest   = items[0]
    return { watching, done, total: items.length, latestTitle: latest?.title || null }
  }, [])
}

function useMoodStats() {
  return useMemo(() => {
    const entries = ls('cherryplan_mood-tracker')
    if (!entries || entries.length === 0) return null
    const todayEntry = entries.find(e => e.date === todayStr())
    const total = entries.length
    return { todayEntry, total }
  }, [])
}

// ── 위젯 공통 카드 ─────────────────────────────────────────────

function WidgetCard({ emoji, title, path, children, accent = '#FF6B8A' }) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 p-5 flex flex-col gap-3 min-h-[140px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <span className="text-sm font-extrabold text-[#1A1A2E]">{title}</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center">
        {children}
      </div>
      <Link
        to={path}
        className="self-end text-xs font-semibold transition-colors"
        style={{ color: accent }}
      >
        앱 열기 →
      </Link>
    </div>
  )
}

function Empty() {
  return <p className="text-sm text-gray-300">아직 데이터 없어요 🍒</p>
}

// ── 위젯 개별 컴포넌트 ─────────────────────────────────────────

function ReadingWidget() {
  const s = useReadingStats()
  return (
    <WidgetCard emoji="📚" title="독서 기록" path="/reading-log">
      {!s ? <Empty /> : (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#FF6B8A]">{s.done}</span>
            <span className="text-sm text-gray-400">권 완독 / 전체 {s.total}권</span>
          </div>
          {s.readingTitle && (
            <p className="text-xs text-gray-500 truncate">
              읽는 중 · <span className="text-[#1A1A2E] font-semibold">{s.readingTitle}</span>
            </p>
          )}
        </div>
      )}
    </WidgetCard>
  )
}

function PomodoroWidget() {
  const s = usePomodoroStats()
  return (
    <WidgetCard emoji="⏱️" title="포모도로" path="/pomodoro">
      {!s ? <Empty /> : (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#FF6B8A]">{s.totalMins}</span>
            <span className="text-sm text-gray-400">분 집중</span>
          </div>
          <p className="text-xs text-gray-500">오늘 {s.sessionCount}세션 완료</p>
        </div>
      )}
    </WidgetCard>
  )
}

function HabitWidget() {
  const s = useHabitStats()
  const pct = s ? Math.round((s.done / s.total) * 100) : 0
  return (
    <WidgetCard emoji="✅" title="습관 트래커" path="/habit-tracker">
      {!s ? <Empty /> : (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#FF6B8A]">{s.done}</span>
            <span className="text-sm text-gray-400">/ {s.total} 완료</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: 'linear-gradient(to right, #FF6B8A, #E84393)' }}
            />
          </div>
          <p className="text-xs text-gray-400">{pct}% 달성</p>
        </div>
      )}
    </WidgetCard>
  )
}

function BudgetWidget() {
  const s = useBudgetStats()
  const ym = currentYM()
  return (
    <WidgetCard emoji="💰" title="가계부" path="/budget">
      {!s ? <Empty /> : (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs text-gray-400">{ym} 지출</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-[#FF6B8A]">{fmtKRW(s.expense)}</span>
            <span className="text-sm text-gray-400">원</span>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}

function TaskWidget() {
  const s = useTaskStats()
  const pct = s ? Math.round((s.done / s.total) * 100) : 0
  return (
    <WidgetCard emoji="📋" title="태스크 보드" path="/retro-board">
      {!s ? <Empty /> : (
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#FF6B8A]">{s.done}</span>
            <span className="text-sm text-gray-400">/ {s.total} 완료</span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: 'linear-gradient(to right, #FF6B8A, #E84393)' }}
            />
          </div>
        </div>
      )}
    </WidgetCard>
  )
}

function MovieWidget() {
  const s = useMovieStats()
  return (
    <WidgetCard emoji="🎬" title="영화/드라마" path="/movie-log">
      {!s ? <Empty /> : (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold text-[#FF6B8A]">{s.done}</span>
            <span className="text-sm text-gray-400">편 완료 / 전체 {s.total}편</span>
          </div>
          {s.watching > 0 && (
            <p className="text-xs text-gray-500">보는 중 {s.watching}편</p>
          )}
          {s.latestTitle && (
            <p className="text-xs text-gray-400 truncate">
              최근 · <span className="text-[#1A1A2E] font-semibold">{s.latestTitle}</span>
            </p>
          )}
        </div>
      )}
    </WidgetCard>
  )
}

function MoodWidget() {
  const s = useMoodStats()
  return (
    <WidgetCard emoji="😌" title="무드 트래커" path="/mood-tracker">
      {!s ? <Empty /> : (
        <div className="flex flex-col gap-1.5">
          {s.todayEntry ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-3xl">{s.todayEntry.mood}</span>
                <span className="text-sm font-bold text-[#1A1A2E]">{s.todayEntry.moodLabel}</span>
              </div>
              {s.todayEntry.claudeMessage && (
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {s.todayEntry.claudeMessage}
                </p>
              )}
            </>
          ) : (
            <div className="flex flex-col gap-0.5">
              <p className="text-sm text-gray-400">오늘 기분 미기록</p>
              <p className="text-xs text-gray-300">누적 {s.total}일 기록 중</p>
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  )
}

// ── 차트 데이터 훅 ────────────────────────────────────────────

// 이번 주 월~일 날짜 배열 (오늘 이후는 포함, 데이터 없으면 0)
function thisWeekDays() {
  const today = new Date()
  const dow = today.getDay() // 0=일
  const mon = new Date(today)
  mon.setDate(today.getDate() - ((dow + 6) % 7)) // 이번 주 월요일
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mon)
    d.setDate(mon.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

function recentDays(n) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().slice(0, 10)
  })
}

function usePomodoroChartData() {
  return useMemo(() => {
    const sessions = ls('cherryplan_pomodoro') || []
    const days = thisWeekDays()
    const labels = days.map(d => {
      const day = new Date(d).getDay()
      return ['일', '월', '화', '수', '목', '금', '토'][day]
    })
    const data = days.map(date =>
      Math.round(
        sessions
          .filter(s => s.type === 'focus' && s.completedAt?.slice(0, 10) === date)
          .reduce((sum, s) => sum + (s.duration || 0), 0) / 60
      )
    )
    return { labels, data, hasData: data.some(v => v > 0) }
  }, [])
}

function useBudgetChartData() {
  return useMemo(() => {
    const items = ls('cherryplan_budget') || []
    const ym = currentYM()
    const monthly = items.filter(i => i.type === 'expense' && i.date?.startsWith(ym))
    const map = {}
    monthly.forEach(i => { map[i.category] = (map[i.category] || 0) + i.amount })
    const labels = Object.keys(map)
    const data = Object.values(map)
    const palette = ['#FF6B8A','#E84393','#FF9DB5','#FFB3C6','#FFC2D0','#FFD6E0','#F48FB1','#F06292']
    return {
      labels,
      data,
      colors: labels.map((_, i) => palette[i % palette.length]),
      hasData: data.length > 0,
    }
  }, [])
}

function useHabitChartData() {
  return useMemo(() => {
    const raw = ls('cherryplan_habit-tracker')
    if (!raw?.habits?.length) return { labels: [], data: [], hasData: false }
    const days = recentDays(7)
    const total = raw.habits.length
    const labels = days.map(d => {
      const day = new Date(d).getDay()
      return ['일', '월', '화', '수', '목', '금', '토'][day]
    })
    const data = days.map(date => {
      const done = raw.logs?.filter(l => l.date === date && l.done).length ?? 0
      return total > 0 ? Math.round((done / total) * 100) : 0
    })
    return { labels, data, hasData: data.some(v => v > 0) }
  }, [])
}

// ── 차트 공통 카드 ─────────────────────────────────────────────

function ChartCard({ emoji, title, path, children, noData }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{emoji}</span>
          <span className="text-sm font-extrabold text-[#1A1A2E]">{title}</span>
        </div>
        <Link to={path} className="text-xs font-semibold text-[#FF6B8A]">앱 열기 →</Link>
      </div>
      {noData
        ? <p className="text-sm text-gray-300 py-6 text-center">아직 데이터 없어요 🍒</p>
        : children
      }
    </div>
  )
}

const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { display: false } },
}

function PomodoroBarChart() {
  const { labels, data, hasData } = usePomodoroChartData()
  return (
    <ChartCard emoji="⏱️" title="이번 주 집중 시간 (분)" path="/pomodoro" noData={!hasData}>
      <Bar
        data={{
          labels,
          datasets: [{
            data,
            backgroundColor: labels.map((_, i) => {
              const today = ['일','월','화','수','목','금','토'][new Date().getDay()]
              return labels[i] === today ? '#E84393' : '#FF6B8A'
            }),
            borderRadius: 8,
            borderSkipped: false,
          }],
        }}
        options={{
          ...BASE_OPTS,
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 12 } } },
            y: {
              beginAtZero: true,
              grid: { color: '#F5F5F5' },
              ticks: { stepSize: 25, font: { size: 11 } },
            },
          },
        }}
      />
    </ChartCard>
  )
}

function BudgetDoughnutChart() {
  const { labels, data, colors, hasData } = useBudgetChartData()
  const total = data.reduce((s, v) => s + v, 0)
  return (
    <ChartCard emoji="💰" title={`이번 달 지출 카테고리 · ${fmtKRW(total)}원`} path="/budget" noData={!hasData}>
      <div className="flex items-center gap-6">
        <div className="w-40 shrink-0">
          <Doughnut
            data={{
              labels,
              datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 }],
            }}
            options={{
              ...BASE_OPTS,
              cutout: '68%',
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: ctx => ` ${fmtKRW(ctx.parsed)}원`,
                  },
                },
              },
            }}
          />
        </div>
        <ul className="flex flex-col gap-1.5 min-w-0">
          {labels.map((label, i) => (
            <li key={label} className="flex items-center gap-2 text-xs text-gray-600 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: colors[i] }} />
              <span className="truncate">{label}</span>
              <span className="ml-auto shrink-0 font-semibold text-[#1A1A2E]">{fmtKRW(data[i])}원</span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  )
}

function HabitLineChart() {
  const { labels, data, hasData } = useHabitChartData()
  return (
    <ChartCard emoji="✅" title="습관 달성률 추이 (최근 7일, %)" path="/habit-tracker" noData={!hasData}>
      <Line
        data={{
          labels,
          datasets: [{
            data,
            borderColor: '#FF6B8A',
            backgroundColor: 'rgba(255, 107, 138, 0.08)',
            borderWidth: 2.5,
            pointBackgroundColor: '#FF6B8A',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.4,
            fill: true,
          }],
        }}
        options={{
          ...BASE_OPTS,
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 12 } } },
            y: {
              beginAtZero: true,
              max: 100,
              grid: { color: '#F5F5F5' },
              ticks: {
                stepSize: 25,
                font: { size: 11 },
                callback: v => `${v}%`,
              },
            },
          },
        }}
      />
    </ChartCard>
  )
}

// ── 메인 ──────────────────────────────────────────────────────

export default function Dashboard() {
  const today = todayStr()

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1A1A2E]">📊 통합 대시보드</h1>
          <p className="text-gray-400 text-sm mt-1">{today} · 모든 앱의 요약을 한눈에</p>
        </div>
        {/* <a
          href="https://www.notion.so/33ebb3574f3081898df8cf4d51975f1b"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap"
          style={{ backgroundColor: '#F5F5F5', color: '#555', borderColor: '#E0E0E0' }}
        >
          ↗ 📝 개발일지 열기
        </a> */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ReadingWidget />
        <PomodoroWidget />
        <HabitWidget />
        <BudgetWidget />
        <TaskWidget />
        <MovieWidget />
        <MoodWidget />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-base font-extrabold text-[#1A1A2E]">차트</h2>
        <PomodoroBarChart />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BudgetDoughnutChart />
          <HabitLineChart />
        </div>
      </div>
      <DevDiarySection
        devDiaryUrl="https://www.notion.so/33ebb3574f3081898df8cf4d51975f1b"
        prompts={[
          `통합 대시보드(Dashboard.jsx)를 만들어줘.
각 앱의 localStorage 데이터를 읽어 요약 위젯 카드로 표시.
Chart.js Bar(포모도로 주간 집중) / Doughnut(지출 카테고리) / Line(습관 달성률 7일) 차트 3종.
외부 라이브러리 없이 데이터 파싱은 커스텀 훅으로 분리.
데이터 없으면 "아직 데이터 없어요 🍒" 표시.`,
        ]}
      />
    </div>
  )
}
