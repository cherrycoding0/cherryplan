import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// 로컬 개발용 AI 프록시 — Netlify Function(anthropic.js)과 동일한 동작을 npm run dev에서 재현
// 클라이언트의 Claude 형식 요청을 Gemini로 변환해 호출하고, Claude 형식으로 감싸서 응답
function localAiProxy(env) {
  return {
    name: 'local-ai-proxy',
    configureServer(server) {
      server.middlewares.use('/api/anthropic', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end(JSON.stringify({ error: 'Method Not Allowed' }))
          return
        }
        const apiKey = env.GEMINI_API_KEY
        if (!apiKey) {
          res.statusCode = 503
          res.end(JSON.stringify({ error: 'GEMINI_API_KEY가 .env에 없어요' }))
          return
        }
        try {
          let raw = ''
          for await (const chunk of req) raw += chunk
          const body = JSON.parse(raw || '{}')
          const userText = (body.messages || []).map((m) => m.content).join('\n')
          const payload = {
            contents: [{ role: 'user', parts: [{ text: userText }] }],
            // thinking 모델이 내부 추론에 토큰을 쓰므로 여유 있게 + JSON 강제 출력
            generationConfig: { maxOutputTokens: 4096, responseMimeType: 'application/json' },
          }
          if (body.system) payload.systemInstruction = { parts: [{ text: body.system }] }

          const r = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
            { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
          )
          const data = await r.json()
          if (!r.ok) {
            res.statusCode = r.status
            res.end(JSON.stringify({ error: 'AI 오류', detail: JSON.stringify(data).slice(0, 300) }))
            return
          }
          const parts = data?.candidates?.[0]?.content?.parts || []
          const text = parts.map((p) => p.text || '').join('')
          res.end(JSON.stringify({ content: [{ text }] }))
        } catch (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'AI 요청에 실패했어요', detail: err.message }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // '' = VITE_ 접두사 없는 변수도 로드

  return {
    plugins: [react(), localAiProxy(env)],
    server: {
      proxy: {
        '/api/aladin': {
          target: 'https://www.aladin.co.kr',
          changeOrigin: true,
          followRedirects: true,
          rewrite: (path) =>
            path.replace(/^\/api\/aladin/, '/ttb/api/ItemSearch.aspx') +
            `&ttbkey=${env.ALADIN_API_KEY || ''}`,
        },
        '/api/notion': {
          target: 'https://api.notion.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/notion/, ''),
          headers: {
            'Authorization': `Bearer ${env.NOTION_TOKEN}`,
            'Notion-Version': '2022-06-28',
          },
        },
        '/api/tmdb': {
          target: 'https://api.themoviedb.org',
          changeOrigin: true,
          rewrite: (path) =>
            path.replace(/^\/api\/tmdb/, '/3/search/multi') +
            `&api_key=${env.TMDB_API_KEY}&language=ko-KR`,
        },
      },
    },
  }
})
