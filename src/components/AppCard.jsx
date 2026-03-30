import { useNavigate } from 'react-router-dom'

export default function AppCard({ app }) {
  const navigate = useNavigate()
  const { emoji, name, description, tags, difficulty, path, color, highlight } = app

  return (
    <article
      onClick={() => navigate(path)}
      className="
        bg-white rounded-2xl shadow-md hover:shadow-xl
        cursor-pointer overflow-hidden
        transition-all duration-200
        hover:-translate-y-1
        border border-transparent hover:border-pink-100
      "
      role="button"
      tabIndex={0}
      aria-label={`${name} 앱 열기`}
      onKeyDown={(e) => e.key === 'Enter' && navigate(path)}
    >
      {/* 카드 상단 - 컬러 배경 + 이모지 */}
      <div
        className="flex items-center justify-center py-8 relative"
        style={{ backgroundColor: color }}
      >
        <span className="text-5xl select-none" role="img" aria-hidden="true">
          {emoji}
        </span>
        {highlight && (
          <span className="
            absolute top-3 right-3
            bg-gradient-to-r from-[#FF6B8A] to-[#E84393]
            text-white text-xs font-semibold
            px-2 py-0.5 rounded-full
          ">
            ✨ AI 탑재
          </span>
        )}
      </div>

      {/* 카드 하단 - 정보 */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base text-[#1A1A2E] leading-tight">
            {name}
          </h3>
          <span className="text-sm shrink-0" title="난이도" aria-label={`난이도 ${difficulty}`}>
            {difficulty}
          </span>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed">
          {description}
        </p>

        {/* 태그 뱃지 */}
        <div className="flex flex-wrap gap-1.5 mt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-[#FFE4EC] text-[#E84393] font-medium px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}
