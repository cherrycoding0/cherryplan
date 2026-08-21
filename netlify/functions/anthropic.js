// AI 프록시 — Google Gemini 사용, API 키는 서버(환경변수)에서만 처리
// 클라이언트는 기존 Claude 형식으로 요청/응답을 주고받으므로 프론트 코드 변경 불필요
const cors = () => ({
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
})

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors(), body: JSON.stringify({ error: 'Method Not Allowed' }) }
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { statusCode: 503, headers: cors(), body: JSON.stringify({ error: 'AI 기능이 아직 설정되지 않았어요.' }) }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    // 기존 Claude 형식 body → Gemini 형식 변환
    const userText = (body.messages || []).map((m) => m.content).join('\n')
    const payload = {
      contents: [{ role: 'user', parts: [{ text: userText }] }],
      generationConfig: { maxOutputTokens: body.max_tokens || 600 },
    }
    if (body.system) {
      payload.systemInstruction = { parts: [{ text: body.system }] }
    }

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    )

    if (!res.ok) {
      const errText = await res.text()
      return { statusCode: res.status, headers: cors(), body: JSON.stringify({ error: 'AI 오류', detail: errText }) }
    }

    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    // Gemini 응답 → 기존 Claude 형식으로 감싸서 반환 (클라이언트가 그대로 파싱)
    return { statusCode: 200, headers: cors(), body: JSON.stringify({ content: [{ text }] }) }
  } catch (err) {
    return { statusCode: 500, headers: cors(), body: JSON.stringify({ error: 'AI 요청에 실패했어요', detail: err.message }) }
  }
}
