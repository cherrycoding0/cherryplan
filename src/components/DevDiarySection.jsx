export default function DevDiarySection({ prompts = [], devDiaryUrl }) {
  const FULL_DIARY = 'https://www.notion.so/333bb3574f3081eaa722d4dd4be9cf2d'

  return (
    <div className="mt-12 border-t border-gray-100 pt-8 flex flex-col gap-4">
      <div>
        <h2 className="text-base font-extrabold text-[#1A1A2E]">🛠️ 이 앱 어떻게 만들었어요?</h2>
        <p className="text-sm text-gray-400 mt-1">
          Claude Code로 바이브코딩했어요. 아래 프롬프트 참고하세요!
        </p>
      </div>

      {prompts.map((p, i) => (
        <pre
          key={i}
          className="bg-[#1A1A2E] text-[#FFE4EC] text-xs rounded-2xl px-5 py-4 whitespace-pre-wrap leading-relaxed overflow-x-auto"
        >
          {p}
        </pre>
      ))}

      {/* <a
        href={devDiaryUrl || FULL_DIARY}
        target="_blank"
        rel="noopener noreferrer"
        className="self-start flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
        style={{ background: 'linear-gradient(to right, #FF6B8A, #E84393)' }}
      >
        전체 개발일지 보기 →
      </a> */}
    </div>
  )
}
