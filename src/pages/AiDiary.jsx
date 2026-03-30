import { useNavigate } from 'react-router-dom'

// TODO: AI 일기 도우미 구현 예정
// - localStorage 키: 'cherryplan_ai-diary'
// - env 변수: VITE_ANTHROPIC_API_KEY
// - 기능: 일기 작성 → Claude API로 감정 분석 → 위로/응원 메시지 반환
// - UI: 일기 입력 폼, 감정 태그(기쁨/슬픔/화남/평온 등), AI 응답 버블, 과거 일기 목록
// - API: Claude claude-haiku-4-5-20251001 사용 (비용 최적화)

export default function AiDiary() {
  const navigate = useNavigate()

  return (
    <div className="max-w-5xl mx-auto px-4 py-20 flex flex-col items-center gap-8 text-center">
      <span className="text-8xl">🤖</span>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-[#1A1A2E]">AI 일기 도우미</h1>
        <p className="text-gray-500 text-lg">일기를 쓰면 AI가 감정을 분석하고 위로해줘요</p>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 bg-[#FFF8E1] text-amber-600 font-semibold px-5 py-2.5 rounded-full text-base">
          🚧 Coming Soon
        </div>
        <span className="
          bg-gradient-to-r from-[#FF6B8A] to-[#E84393]
          text-white text-xs font-semibold
          px-3 py-1 rounded-full
        ">
          ✨ AI 탑재 — Claude API 사용
        </span>
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
