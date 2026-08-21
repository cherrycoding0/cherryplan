import DevDiarySection from '../components/DevDiarySection'

const STEPS = [
  {
    emoji: '📷',
    title: '사진 업로드 & 이미지 분석',
    desc: '사진을 올리면 canvas로 1024px 이하로 리사이징한 뒤 Base64로 전송해요. AI가 분위기·대상·키워드를 읽고 오늘의 MBTI를 판정해요.',
  },
  {
    emoji: '🎙️',
    title: '팟캐스트 스크립트 생성',
    desc: '판정된 MBTI에 맞는 두 MC 캐릭터가 세팅되고, 각자의 말투가 반영된 8줄짜리 대화 스크립트가 자동으로 만들어져요.',
  },
  {
    emoji: '🔊',
    title: '감정 표현 TTS 재생',
    desc: 'MC 두 명의 목소리를 병렬 요청으로 생성하고, MBTI별 톤(밝고 신나게 / 차갑고 낮은 톤...)을 지정해 감정을 실어 재생해요.',
  },
]

const CHALLENGES = [
  {
    problem: '멀티모달 요청에서 LLM이 JSON 형식을 무시함',
    solve: 'FORMAT 태그 + Few-shot 예시를 프롬프트에 추가해 준수율을 끌어올림',
  },
  {
    problem: '베타 기간 일일 10회 호출 제한',
    solve: 'USE_MOCK 환경 변수로 목 데이터 분기 — 레이아웃 작업 중엔 API를 아예 안 씀',
  },
  {
    problem: '대용량 Base64 페이로드로 응답 지연',
    solve: '클라이언트 canvas 리사이징(≤1024px)으로 전송량 축소',
  },
  {
    problem: 'Tailwind가 MBTI별 동적 색상 클래스를 인식 못 함',
    solve: 'safelist에 필요한 컬러 코드를 미리 등록',
  },
  {
    problem: 'API 호출 횟수 과다 (초기 9회)',
    solve: 'TTS를 라인별 호출 → 화자별 묶음 호출로 바꿔 총 5회로 최적화',
  },
]

const MC_EXAMPLES = [
  { mbti: 'ENFP', tone: '터질 것 같은 에너지, 호들갑, 신나는 버라이어티' },
  { mbti: 'INTJ', tone: '냉철한 전략가, 팩폭, 감정 없는 브리핑' },
  { mbti: 'ISFJ', tone: '포근하고 따뜻하게, 엄마처럼' },
  { mbti: 'ISTP', tone: '무뚝뚝하게, 짧고 건조하게' },
]

export default function PicBti() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1A1A2E]">📸 픽BTI</h1>
        <p className="text-gray-400 text-sm mt-1">
          사진 한 장 올리면 AI가 오늘의 MBTI를 분석하고, 두 MC가 30초 팟캐스트로 수다떨어요
        </p>
      </div>

      {/* 링크 버튼 */}
      <div className="flex flex-wrap gap-2">
        <a
          href="https://pic-bti.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-80"
          style={{ background: 'linear-gradient(to right, #FF6B8A, #E84393)' }}
        >
          라이브 데모 →
        </a>
        <a
          href="https://cherrycoding0.tistory.com/19"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-full text-sm font-bold text-[#E84393] bg-[#FFE4EC] hover:bg-[#FF6B8A] hover:text-white transition-colors"
        >
          개발기 블로그 →
        </a>
      </div>

      {/* 소개 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-extrabold text-[#1A1A2E]">어떤 프로젝트예요?</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          카카오의 옴니모달 AI <b>Kanana-o</b>를 활용한 베타 테스트 프로젝트예요. 텍스트·음성·이미지를
          동시에 이해하는 모델의 특성을 살려, 사진 한 장을 <b>이미지 분석 → MBTI 판정 → 캐릭터
          팟캐스트 스크립트 → 감정 표현 TTS</b>까지 하나의 파이프라인으로 이었어요. 한국어 특화
          모델이라 말투·감정 표현이 자연스러운 게 포인트!
        </p>
        <div className="flex flex-wrap gap-1.5">
          {['Kanana-o', '멀티모달 AI', 'Next.js', 'TypeScript', 'TTS', 'OpenAI SDK 호환'].map((t) => (
            <span key={t} className="text-xs bg-[#FFE4EC] text-[#E84393] font-medium px-2 py-0.5 rounded-full">
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* 동작 흐름 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-extrabold text-[#1A1A2E]">어떻게 동작해요?</h2>
        <div className="flex flex-col gap-3">
          {STEPS.map((s, i) => (
            <div key={s.title} className="flex gap-3 bg-white rounded-2xl shadow-md p-4">
              <span className="text-2xl shrink-0">{s.emoji}</span>
              <div>
                <p className="text-sm font-bold text-[#1A1A2E]">
                  {i + 1}단계 — {s.title}
                </p>
                <p className="text-sm text-gray-500 leading-relaxed mt-1">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">
          전체 API 호출은 총 5회 — 처음 9회에서 화자별 묶음 호출로 최적화했어요.
        </p>
      </section>

      {/* MC 캐릭터 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-extrabold text-[#1A1A2E]">MBTI별 MC 캐릭터</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          판정된 MBTI마다 MC의 성격과 TTS 톤이 달라져요. 예를 들면:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {MC_EXAMPLES.map((m) => (
            <div key={m.mbti} className="bg-[#FFE4EC] rounded-2xl px-4 py-3">
              <p className="text-xs font-extrabold text-[#E84393]">{m.mbti}</p>
              <p className="text-sm text-[#1A1A2E] mt-0.5">{m.tone}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 트러블슈팅 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-extrabold text-[#1A1A2E]">막혔던 것 → 푼 방법</h2>
        <div className="flex flex-col gap-2">
          {CHALLENGES.map((c) => (
            <div key={c.problem} className="bg-white rounded-2xl shadow-md p-4">
              <p className="text-sm font-bold text-[#1A1A2E]">🚧 {c.problem}</p>
              <p className="text-sm text-gray-500 leading-relaxed mt-1">✅ {c.solve}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 다음 버전 계획 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-extrabold text-[#1A1A2E]">다음 버전에서는</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          사진 + 글감을 함께 넣어 팟캐스트 만들기, 분석 히스토리, 공유 카드 이미지 자동 생성,
          그리고 ASR + TTS를 동시에 쓰는 실시간 음성 대화까지 계획하고 있어요.
        </p>
      </section>

      <DevDiarySection
        prompts={[
          `사진 한 장으로 MBTI를 판정하는 API를 만들어줘.
Base64 이미지를 받아 분위기/대상/키워드/MBTI/판정 이유를 JSON으로 반환.
멀티모달 요청에서 형식이 자주 깨지니 FORMAT 태그와 Few-shot 예시를 프롬프트에 포함해줘.`,
          `MBTI별 MC 캐릭터 2명이 진행하는 8줄짜리 팟캐스트 스크립트를 생성해줘.
ENFP는 호들갑스러운 버라이어티 톤, INTJ는 감정 없는 브리핑 톤처럼
유형별 말투를 반영하고, TTS 호출은 라인별이 아니라 화자별로 묶어서 최적화해줘.`,
        ]}
      />
    </div>
  )
}
