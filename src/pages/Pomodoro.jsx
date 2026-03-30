import { useNavigate } from 'react-router-dom'

// TODO: 포모도로 타이머 구현 예정
// - localStorage 키: 'cherryplan_pomodoro'
// - 기능: 25분 집중 / 5분 휴식 타이머, 세션 기록, 오늘의 집중 시간 통계
// - UI: 원형 프로그레스바, 시작/일시정지/리셋 버튼, 세션 기록 리스트

export default function Pomodoro() {
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center gap-8 text-center">
      <span className="text-8xl">⏱️</span>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[#1A1A2E]">포모도로 타이머</h1>
        <p className="text-gray-500 text-lg">25분 집중, 5분 휴식. 생산성을 높여요</p>
      </div>
      <div className="flex items-center gap-2 bg-[#E8F5E9] text-green-600 font-semibold px-5 py-2.5 rounded-full text-base">
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
