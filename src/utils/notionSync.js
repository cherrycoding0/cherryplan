// 토큰은 서버사이드(Vite proxy / Netlify Function)에서 처리 — 클라이언트 노출 없음
const BASE = '/api/notion/v1'

export const NOTION_DB = {
  readingLog: '23fd81e3e0a14846bbeb0505c7444d8c',
  pomodoro:   'a7041cf4feda4bc4bbfe484683f9bcd0',
  menu:       '128ba0c13f524ba894cf402bf35d1796',
  retroBoard: '4c5905c527e24951b55b1bc360576888',
  habit:      '5c073afed9fe447fa15f1e1b3296b3ba',
  budget:     'f48a5fa8d5b54a36bc0bcd7567d57725',
  aiDiary:    '7e49ec25746f487ab6e15023339e8100',
  movieLog:   import.meta.env.VITE_NOTION_MOVIE_DB_ID || '',
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

// ── AI 일기 ────────────────────────────────────────────────────
// Notion DB 필드: 날짜(title), 일기내용(rich_text), 감정분석(rich_text), 리프레이밍(rich_text), 내일한마디(rich_text)
function buildDiaryProps(entry) {
  return {
    '날짜':       { title:     [{ text: { content: entry.date } }] },
    '일기내용':   { rich_text: [{ text: { content: entry.content || '' } }] },
    '감정분석':   { rich_text: [{ text: { content: entry.feedback?.emotion  || '' } }] },
    '리프레이밍': { rich_text: [{ text: { content: entry.feedback?.reframe  || '' } }] },
    '내일한마디': { rich_text: [{ text: { content: entry.feedback?.tomorrow || '' } }] },
    '공개':       { checkbox: entry.isPublic ?? false },
  }
}

// ── Notion 조회 공통 헬퍼 ────────────────────────────────────────
function txt(prop) {
  return prop?.title?.[0]?.plain_text ?? prop?.rich_text?.[0]?.plain_text ?? ''
}
function sel(prop)  { return prop?.select?.name ?? '' }
function num(prop)  { return prop?.number ?? 0 }
function chk(prop)  { return prop?.checkbox ?? false }
function dt(prop)   { return prop?.date?.start ?? '' }

async function queryDB(dbId, body = {}) {
  if (!dbId) return []
  try {
    const res = await fetch(`${BASE}/databases/${dbId}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page_size: 12, ...body }),
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.results ?? []
  } catch { return [] }
}

// ── 독서 기록 조회 ──────────────────────────────────────────────
const STATUS_REVERSE = { '읽고 싶음': 'want', '읽는 중': 'reading', '완독': 'done' }

export async function fetchReadingLog() {
  const rows = await queryDB(NOTION_DB.readingLog, {
    sorts: [{ property: '추가일', direction: 'descending' }],
  })
  return rows.map((p) => ({
    id:        p.id,
    title:     txt(p.properties['제목']),
    author:    txt(p.properties['저자']),
    publisher: txt(p.properties['출판사']),
    status:    STATUS_REVERSE[sel(p.properties['상태'])] ?? 'want',
    rating:    num(p.properties['별점']),
    progress:  num(p.properties['진행률']),
    memo:      txt(p.properties['감상']),
    addedAt:   dt(p.properties['추가일']),
  }))
}

// ── 오늘의 메뉴 조회 ─────────────────────────────────────────────
const CAT_REVERSE = { '한식': 'korean', '중식': 'chinese', '일식': 'japanese', '양식': 'western' }

export async function fetchMenu() {
  const rows = await queryDB(NOTION_DB.menu, {
    sorts: [{ property: '날짜', direction: 'descending' }],
  })
  return rows.map((p) => ({
    id:       p.id,
    menu:     txt(p.properties['메뉴명']),
    category: CAT_REVERSE[sel(p.properties['카테고리'])] ?? 'all',
    pickedAt: dt(p.properties['날짜']) || p.created_time,
  }))
}

// ── 포모도로 세션 조회 ────────────────────────────────────────────
const TYPE_REVERSE = { '집중': 'focus', '휴식': 'break', '긴 휴식': 'longBreak' }

export async function fetchPomodoro() {
  const rows = await queryDB(NOTION_DB.pomodoro, {
    sorts: [{ property: '완료 시간', direction: 'descending' }],
  })
  return rows.map((p) => ({
    id:          p.id,
    task:        txt(p.properties['할 일']),
    type:        TYPE_REVERSE[sel(p.properties['타입'])] ?? 'focus',
    duration:    num(p.properties['소요(분)']) * 60,
    completedAt: dt(p.properties['완료 시간']) || p.created_time,
  }))
}

// ── 태스크 보드 조회 ─────────────────────────────────────────────
const COL_REVERSE = { '해야할 일': 'todo', '하는 중': 'doing', '완료': 'done' }

export async function fetchRetroBoard() {
  const rows = await queryDB(NOTION_DB.retroBoard, {
    sorts: [{ property: '날짜', direction: 'descending' }],
  })
  return rows.map((p) => ({
    id:        p.id,
    text:      txt(p.properties['내용']),
    column:    COL_REVERSE[sel(p.properties['구분'])] ?? 'todo',
    category:  txt(p.properties['작성자']),
    createdAt: dt(p.properties['날짜']) || p.created_time,
  }))
}

// ── 습관 트래커 조회 ─────────────────────────────────────────────
export async function fetchHabit() {
  const rows = await queryDB(NOTION_DB.habit, {
    sorts: [{ property: '날짜', direction: 'descending' }],
    page_size: 20,
  })
  return rows.map((p) => ({
    id:        p.id,
    habitName: txt(p.properties['습관명']),
    done:      chk(p.properties['완료']),
    date:      dt(p.properties['날짜']),
  }))
}

// ── 가계부 조회 ──────────────────────────────────────────────────
const BUDGET_TYPE_REVERSE = { '수입': 'income', '지출': 'expense' }

export async function fetchBudget() {
  const rows = await queryDB(NOTION_DB.budget, {
    sorts: [{ property: '날짜', direction: 'descending' }],
  })
  return rows.map((p) => ({
    id:       p.id,
    type:     BUDGET_TYPE_REVERSE[sel(p.properties['타입'])] ?? 'expense',
    amount:   num(p.properties['금액']),
    category: sel(p.properties['카테고리']),
    memo:     txt(p.properties['메모']) || txt(p.properties['내역']),
    date:     dt(p.properties['날짜']),
  }))
}

// ── 영화/드라마 기록 ────────────────────────────────────────────
const MOVIE_STATUS_MAP = { want: '보고싶어요', watching: '보는중', done: '봤어요' }

function buildMovieProps(item) {
  const props = {
    '제목':  { title:     [{ text: { content: item.title || '' } }] },
    '타입':  { select:    { name: item.type === '드라마' ? '드라마' : '영화' } },
    '상태':  { select:    { name: MOVIE_STATUS_MAP[item.status] ?? '보고싶어요' } },
    '별점':  { number:    item.rating ?? 0 },
    '감상':  { rich_text: [{ text: { content: item.memo || '' } }] },
  }
  if (item.doneAt) props['완료일'] = { date: { start: item.doneAt } }
  return props
}

export async function syncMovieLog(items) {
  if (!NOTION_DB.movieLog) {
    throw new Error('Notion 영화/드라마 DB ID가 설정되지 않았어요. .env에 VITE_NOTION_MOVIE_DB_ID를 추가해주세요.')
  }
  return syncItems({
    items,
    dbId: NOTION_DB.movieLog,
    buildProps: buildMovieProps,
    getTitle: (i) => i.title,
  })
}

export async function syncAiDiary(entries) {
  if (!NOTION_DB.aiDiary) {
    throw new Error('Notion AI 일기 DB ID가 설정되지 않았어요. notionSync.js의 NOTION_DB.aiDiary를 채워주세요.')
  }
  return syncItems({
    items: entries,
    dbId: NOTION_DB.aiDiary,
    buildProps: buildDiaryProps,
    getTitle: (e) => e.date,
  })
}
