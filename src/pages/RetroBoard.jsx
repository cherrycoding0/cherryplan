import { useNavigate } from 'react-router-dom'

// TODO: 팀 회고 보드 구현 예정
// - localStorage 키: 'cherryplan_retro-board'
// - 기능: KPT(Keep/Problem/Try) 3열 포스트잇 보드, 카드 추가/삭제/이동, 좋아요 투표
// - UI: 3열 칸반 스타일, 드래그 앤 드롭(옵션), 색상별 포스트잇 카드

export default function RetroBoard() {
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center gap-8 text-center">
      <span className="text-8xl">📌</span>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[#1A1A2E]">팀 회고 보드</h1>
        <p className="text-gray-500 text-lg">KPT 포스트잇으로 팀 회고를 진행해요</p>
      </div>
      <div className="flex items-center gap-2 bg-[#E3F2FD] text-blue-500 font-semibold px-5 py-2.5 rounded-full text-base">
        🚧 Coming Soon
      </div>
      <button
        onClick={() => navigate('/')}
        className="text-sm text-gray-400 hover:text-[#FF6B8A] transition-colors underline underline-offset-2 mt-4"
      >
        홈으로 돌아가기
      </button>
    </div>
  )
}
