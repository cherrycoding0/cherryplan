import { useNavigate } from 'react-router-dom'

// TODO: 독서 기록 앱 구현 예정
// - localStorage 키: 'cherryplan_reading-log'
// - 기능: 책 추가/삭제, 별점(1~5), 감상 메모, 독서 상태(읽는 중/완독/읽고 싶음)
// - UI: 카드 리스트, 필터(상태별), 검색

export default function ReadingLog() {
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center gap-8 text-center">
      <span className="text-8xl">📚</span>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[#1A1A2E]">독서 기록</h1>
        <p className="text-gray-500 text-lg">읽은 책을 기록하고 별점과 감상을 남겨요</p>
      </div>
      <div className="flex items-center gap-2 bg-[#FFE4EC] text-[#E84393] font-semibold px-5 py-2.5 rounded-full text-base">
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
