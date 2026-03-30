import { useNavigate } from 'react-router-dom'

// TODO: 간단한 가계부 구현 예정
// - localStorage 키: 'cherryplan_budget'
// - 기능: 수입/지출 내역 CRUD, 카테고리별 분류, 월별 통계, 도넛 차트(Chart.js)
// - UI: 잔액 헤더, 내역 리스트, 카테고리 필터, 월별 차트

export default function Budget() {
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center gap-8 text-center">
      <span className="text-8xl">💰</span>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[#1A1A2E]">간단한 가계부</h1>
        <p className="text-gray-500 text-lg">수입과 지출을 기록하고 차트로 확인해요</p>
      </div>
      <div className="flex items-center gap-2 bg-[#E0F7FA] text-cyan-600 font-semibold px-5 py-2.5 rounded-full text-base">
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
