import { useNavigate } from 'react-router-dom'

// TODO: 오늘의 메뉴 추천기 구현 예정
// - localStorage 키: 'cherryplan_menu-picker'
// - 기능: 카테고리(한식/중식/일식/양식) 선택, 상황(혼밥/배달/외식) 선택, 룰렛 애니메이션으로 추천
// - UI: 조건 선택 폼, 돌리기 버튼, 결과 카드 + 슬롯머신 애니메이션

export default function MenuPicker() {
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center gap-8 text-center">
      <span className="text-8xl">🍽️</span>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[#1A1A2E]">오늘의 메뉴</h1>
        <p className="text-gray-500 text-lg">조건을 입력하면 오늘 뭐 먹을지 추천해줘요</p>
      </div>
      <div className="flex items-center gap-2 bg-[#FFF3E0] text-orange-500 font-semibold px-5 py-2.5 rounded-full text-base">
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
