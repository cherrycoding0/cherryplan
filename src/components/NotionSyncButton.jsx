import { useState } from 'react'

const SYNC_PW = import.meta.env.VITE_SYNC_PASSWORD || ''
const SESSION_KEY = 'cherryplan_sync_auth'

function isAuthed() {
  return sessionStorage.getItem(SESSION_KEY) === 'true'
}

function PasswordModal({ onConfirm, onCancel }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (input === SYNC_PW) {
      sessionStorage.setItem(SESSION_KEY, 'true')
      onConfirm()
    } else {
      setError(true)
      setInput('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-6 flex flex-col gap-4 w-72"
      >
        <div>
          <h2 className="font-extrabold text-[#1A1A2E] text-base">🔒 노션 동기화</h2>
          <p className="text-xs text-gray-400 mt-1">비밀번호를 입력하세요</p>
        </div>
        <input
          autoFocus
          type="password"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(false) }}
          placeholder="비밀번호"
          className={`px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${
            error ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-[#FF6B8A]'
          }`}
        />
        {error && <p className="text-xs text-red-400 -mt-2">비밀번호가 틀렸어요</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 py-2 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: '#FF6B8A' }}
          >
            확인
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl text-sm font-bold text-gray-400 bg-gray-100 hover:bg-gray-200"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  )
}

export default function NotionSyncButton({ onSync, disabled = false, label = '노션 동기화' }) {
  const [state,       setState]       = useState('idle') // idle | loading | done | error
  const [showModal,   setShowModal]   = useState(false)
  const [errMsg,      setErrMsg]      = useState('')

  async function runSync() {
    setState('loading')
    setErrMsg('')
    try {
      const { errors } = await onSync()
      if (errors.length === 0) {
        setState('done')
      } else {
        setState('error')
        setErrMsg(errors[0].error)
      }
    } catch (e) {
      setState('error')
      setErrMsg(e.message)
    } finally {
      setTimeout(() => { setState('idle'); setErrMsg('') }, 5000)
    }
  }

  function handleClick() {
    if (state === 'loading' || disabled) return
    if (!SYNC_PW || isAuthed()) {
      runSync()
    } else {
      setShowModal(true)
    }
  }

  const styles = {
    idle:    { backgroundColor: '#F5F5F5', color: '#555',    borderColor: '#E0E0E0' },
    loading: { backgroundColor: '#F5F5F5', color: '#999',    borderColor: '#E0E0E0' },
    done:    { backgroundColor: '#E8F5E9', color: '#4CAF50', borderColor: '#4CAF50' },
    error:   { backgroundColor: '#FFEBEE', color: '#F44336', borderColor: '#F44336' },
  }
  const labels = {
    idle:    `↗ ${label}`,
    loading: '⏳ 동기화 중...',
    done:    '✅ 완료',
    error:   '❌ 실패',
  }

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={handleClick}
          disabled={state === 'loading' || disabled}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-40 whitespace-nowrap"
          style={styles[state]}
          title="노션 DB에 동기화"
        >
          {labels[state]}
        </button>
        {errMsg && (
          <p className="text-xs text-red-400 max-w-xs text-right break-all">{errMsg}</p>
        )}
      </div>

      {showModal && (
        <PasswordModal
          onConfirm={() => { setShowModal(false); runSync() }}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  )
}

