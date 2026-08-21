export default function Footer() {
  return (
    <footer className="border-t border-pink-100 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
        <p>
          🍒 CherryPlan — 기획부터 배포까지, AI와 함께 만든 미니앱
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-5">
          <a
            href="mailto:cherrycoding0@gmail.com"
            className="flex items-center gap-1.5 hover:text-[#FF6B8A] transition-colors"
          >
            <span aria-hidden="true">💌</span>
            cherrycoding0@gmail.com
          </a>
          <a
            href="https://cherrycoding0.tistory.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#FF6B8A] transition-colors"
          >
            <span aria-hidden="true">✍️</span>
            개발 블로그
          </a>
          <p>
            Made with{' '}
            <span className="text-[#FF6B8A]">♥</span>
            {' '}by{' '}
            <a
              href="https://github.com/cherrycoding0"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#FF6B8A] transition-colors underline underline-offset-2"
            >
              cherrycoding0
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
