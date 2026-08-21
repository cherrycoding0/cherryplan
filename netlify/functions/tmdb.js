// TMDB 프록시 — API 키를 서버(환경변수)에서만 사용, 클라이언트 노출 없음
export const handler = async (event) => {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) {
    return {
      statusCode: 503,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: '영화 검색이 아직 설정되지 않았어요.', results: [] }),
    }
  }

  const query = (event.queryStringParameters || {}).query || ''
  if (!query.trim()) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ results: [] }),
    }
  }

  const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=ko-KR&query=${encodeURIComponent(query)}`

  try {
    const res = await fetch(url)
    const text = await res.text()
    return {
      statusCode: res.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: text,
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: '영화 검색에 실패했어요', detail: err.message, results: [] }),
    }
  }
}
