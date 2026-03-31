// 토큰은 서버사이드(Vite proxy / Netlify Function)에서 처리 — 클라이언트 노출 없음
const BASE = '/api/notion/v1'

export const NOTION_DB = {
  readingLog: '23fd81e3e0a14846bbeb0505c7444d8c',
  pomodoro:   'a7041cf4feda4bc4bbfe484683f9bcd0',
  menu:       '128ba0c13f524ba894cf402bf35d1796',
  retroBoard: '4c5905c527e24951b55b1bc360576888',
  habit:      '5c073afed9fe447fa15f1e1b3296b3ba',
  budget:     'f48a5fa8d5b54a36bc0bcd7567d57725',
}

async function createPage(databaseId, properties) {
  const res = await fetch(`${BASE}/pages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ parent: { database_id: databaseId }, properties }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${res.status}: ${body}`)
  }
  return res.json()
}

async function updatePage(pageId, properties) {
  const res = await fetch(`${BASE}/pages/${pageId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ properties }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${res.status}: ${body}`)
  }
  return res.json()
}

// 독서 기록 → 노션 프로퍼티 변환
const STATUS_MAP = { want: '읽고 싶음', reading: '읽는 중', done: '완독' }

function buildBookProps(book) {
  const props = {
    '제목':  { title:     [{ text: { content: book.title } }] },
    '저자':  { rich_text: [{ text: { content: book.author    || '' } }] },
    '출판사':{ rich_text: [{ text: { content: book.publisher  || '' } }] },
    '상태':  { select:    { name: STATUS_MAP[book.status] ?? '읽고 싶음' } },
    '별점':  { number:    book.rating   ?? 0 },
    '진행률':{ number:    book.progress ?? 0 },
    '감상':  { rich_text: [{ text: { content: book.memo || '' } }] },
  }
  if (book.cover)    props['커버']   = { url: book.cover }
  if (book.addedAt)  props['추가일'] = { date: { start: book.addedAt.slice(0, 10) } }
  return props
}

// 공통 동기화 헬퍼
async function syncItems({ items, dbId, buildProps, getTitle }) {
  const updated = []
  const errors  = []
  for (const item of items) {
    try {
      const props = buildProps(item)
      if (item.notionId) {
        try {
          await updatePage(item.notionId, props)
          updated.push(item)
        } catch (err) {
          // 아카이브된 페이지는 새로 생성
          if (err.message.includes('archived')) {
            const page = await createPage(dbId, props)
            updated.push({ ...item, notionId: page.id })
          } else {
            throw err
          }
        }
      } else {
        const page = await createPage(dbId, props)
        updated.push({ ...item, notionId: page.id })
      }
    } catch (err) {
      errors.push({ id: item.id, title: getTitle(item), error: err.message })
    }
  }
  return { updated, errors }
}

// ── 독서 기록 ──────────────────────────────────────────────
// books 배열 동기화 → { updated: books with notionId, errors: [] }
export async function syncReadingLog(books) {
  const updated = []
  const errors  = []

  return syncItems({
    items: books,
    dbId: NOTION_DB.readingLog,
    buildProps: buildBookProps,
    getTitle: (b) => b.title,
  })
}

// ── 포모도로 세션 ───────────────────────────────────────────
const TYPE_MAP = { focus: '집중', break: '휴식', longBreak: '긴 휴식' }

function buildSessionProps(session) {
  const props = {
    '할 일': { title: [{ text: { content: session.task || '(무제)' } }] },
    '타입':   { select: { name: TYPE_MAP[session.type] ?? '집중' } },
    '소요(분)': { number: Math.floor(session.duration / 60) },
  }
  if (session.completedAt) {
    props['완료 시간'] = { date: { start: session.completedAt } }
  }
  return props
}

export async function syncPomodoro(sessions) {
  return syncItems({
    items: sessions,
    dbId: NOTION_DB.pomodoro,
    buildProps: buildSessionProps,
    getTitle: (s) => s.task || TYPE_MAP[s.type] || '세션',
  })
}

// ── 오늘의 메뉴 ───────────────────────────────────────────────
const CATEGORY_LABEL = { all: '전체', korean: '한식', chinese: '중식', japanese: '일식', western: '양식' }
const SITUATION_LABEL = { all: '상관없어', solo: '혼밥', delivery: '배달', dineout: '외식', quick: '간단하게' }

function buildMenuProps(item) {
  const catLabel = CATEGORY_LABEL[item.category]
  const sitLabel = SITUATION_LABEL[item.situation]
  const props = {
    '메뉴명': { title: [{ text: { content: item.menu } }] },
    '메모': { rich_text: [{ text: { content: sitLabel && sitLabel !== '상관없어' ? sitLabel : '' } }] },
  }
  if (catLabel && catLabel !== '전체') props['카테고리'] = { select: { name: catLabel } }
  if (item.pickedAt) props['날짜'] = { date: { start: item.pickedAt.slice(0, 10) } }
  return props
}

export async function syncMenu(items) {
  return syncItems({
    items,
    dbId: NOTION_DB.menu,
    buildProps: buildMenuProps,
    getTitle: (m) => m.menu,
  })
}

// ── 태스크 보드 ───────────────────────────────────────────────
// 실제 DB 필드: 내용(title), 구분(select), 작성자(text), 날짜(date)
const COLUMN_LABEL = { todo: '해야할 일', doing: '하는 중', done: '완료' }

function buildRetroBoardProps(card) {
  const props = {
    '내용': { title: [{ text: { content: card.text } }] },
    '구분': { select: { name: COLUMN_LABEL[card.column] ?? '해야할 일' } },
  }
  if (card.category) props['작성자'] = { rich_text: [{ text: { content: card.category } }] }
  if (card.createdAt) props['날짜'] = { date: { start: card.createdAt.slice(0, 10) } }
  return props
}

export async function syncRetroBoard(cards) {
  return syncItems({
    items: cards,
    dbId: NOTION_DB.retroBoard,
    buildProps: buildRetroBoardProps,
    getTitle: (c) => c.text,
  })
}

// ── 습관 트래커 ────────────────────────────────────────────────
function buildHabitProps(log) {
  return {
    '습관명': { title: [{ text: { content: log.habitName || '습관' } }] },
    '완료':   { checkbox: log.done ?? false },
    '날짜':   { date: { start: log.date } },
  }
}

export async function syncHabit(logs) {
  return syncItems({
    items: logs,
    dbId: NOTION_DB.habit,
    buildProps: buildHabitProps,
    getTitle: (l) => l.habitName || '습관',
  })
}

// ── 가계부 ─────────────────────────────────────────────────────
// 실제 DB 필드: 내역(title), 타입(select), 금액(number), 카테고리(select), 날짜(date), 메모(text)
const BUDGET_TYPE_MAP = { income: '수입', expense: '지출' }

function buildBudgetProps(item) {
  return {
    '내역':    { title: [{ text: { content: item.memo || item.category } }] },
    '타입':    { select: { name: BUDGET_TYPE_MAP[item.type] ?? '지출' } },
    '금액':    { number: item.amount },
    '카테고리':{ select: { name: item.category } },
    '날짜':    { date: { start: item.date } },
    '메모':    { rich_text: [{ text: { content: item.memo || '' } }] },
  }
}

export async function syncBudget(items) {
  return syncItems({
    items,
    dbId: NOTION_DB.budget,
    buildProps: buildBudgetProps,
    getTitle: (i) => i.memo || i.category,
  })
}
