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
        '/api/anthropic': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/anthropic/, '/v1/messages'),
          headers: {
            'x-api-key': env.ANTHROPIC_API_KEY || '',
            'anthropic-version': '2023-06-01',
          },
        },
      },
    },
  }
})
