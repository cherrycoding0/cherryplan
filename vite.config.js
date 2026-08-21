import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '') // '' = VITE_ 접두사 없는 변수도 로드

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/aladin': {
          target: 'http://www.aladin.co.kr',
          changeOrigin: true,
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
        // /api/anthropic (AI)는 Gemini 프록시 Function을 통하므로 로컬은 `netlify dev`로 실행하세요.
      },
    },
  }
})
