import { useState } from 'react'

// 노션 동기화 버튼 — 모든 앱에서 공통으로 사용
// onSync: async () => { updated: [], errors: [] }
export default function NotionSyncButton({ onSync, disabled = false, label = '노션 동기화' }) {
  const [state, setState] = useState('idle') // idle | loading | done | error

  async function handleClick() {
    if (state === 'loading' || disabled) return
    setState('loading')
    try {
      const { errors } = await onSync()
      setState(errors.length === 0 ? 'done' : 'error')
    } catch {
      setState('error')
    } finally {
      setTimeout(() => setState('idle'), 3000)
    }
  }

  const styles = {
    idle:    { backgroundColor: '#F5F5F5', color: '#555',     borderColor: '#E0E0E0' },
    loading: { backgroundColor: '#F5F5F5', color: '#999',     borderColor: '#E0E0E0' },
    done:    { backgroundColor: '#E8F5E9', color: '#4CAF50',  borderColor: '#4CAF50' },
    error:   { backgroundColor: '#FFEBEE', color: '#F44336',  borderColor: '#F44336' },
  }

  const labels = {
    idle:    `↗ ${label}`,
    loading: '⏳ 동기화 중...',
    done:    '✅ 완료',
    error:   '❌ 실패',
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading' || disabled}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-40 whitespace-nowrap"
      style={styles[state]}
      title="노션 DB에 동기화"
    >
      {labels[state]}
    </button>
  )
}
