import { useNavigate } from 'react-router-dom'

// TODO: 습관 트래커 구현 예정
// - localStorage 키: 'cherryplan_habit-tracker'
// - 기능: 습관 추가/삭제, 매일 체크, 연속 달성 스트릭 계산, GitHub 스타일 히트맵
// - UI: 습관 목록 + 오늘 체크, 월간 히트맵 캘린더, 최장/현재 스트릭 표시

export default function HabitTracker() {
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center gap-8 text-center">
      <span className="text-8xl">✅</span>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[#1A1A2E]">습관 트래커</h1>
        <p className="text-gray-500 text-lg">매일 체크하고 연속 달성 스트릭을 쌓아요</p>
      </div>
      <div className="flex items-center gap-2 bg-[#F3E5F5] text-purple-600 font-semibold px-5 py-2.5 rounded-full text-base">
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
