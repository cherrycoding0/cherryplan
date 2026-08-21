import { devlog } from '../data/devlog'

export default function DevLog() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1A1A2E]">📝 개발 일지</h1>
        <p className="text-gray-400 text-sm mt-1">
          그날그날 뭘 만들고 뭘 배웠는지 기록해요
        </p>
      </div>

      <div className="relative flex flex-col gap-8">
        {/* 타임라인 세로선 */}
        <span
          className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-pink-100"
          aria-hidden="true"
        />

        {devlog.map((entry) => (
          <article key={entry.date} className="relative pl-8">
            {/* 타임라인 점 */}
            <span
              className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-gradient-to-br from-[#FF6B8A] to-[#E84393] ring-4 ring-white"
              aria-hidden="true"
            />

            <p className="text-xs font-bold text-[#E84393]">{entry.date}</p>
            <h2 className="text-base font-extrabold text-[#1A1A2E] mt-1">
              {entry.title}
            </h2>

            <div className="flex flex-wrap gap-1.5 mt-2">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-[#FFE4EC] text-[#E84393] font-medium px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <ul className="mt-3 bg-white rounded-2xl shadow-md p-5 flex flex-col gap-2.5">
              {entry.items.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600 leading-relaxed">
                  <span className="text-[#FF6B8A] shrink-0" aria-hidden="true">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      {devlog.length === 0 && (
        <div className="text-center py-16 flex flex-col items-center gap-3 text-gray-300">
          <span className="text-5xl">📝</span>
          <p className="text-sm">아직 기록이 없어요</p>
        </div>
      )}
    </div>
  )
}
