export default function Footer() {
  return (
    <footer className="border-t border-pink-100 bg-white mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-400">
        <p>
          🍒 CherryPlan — 바이브코딩 포트폴리오
        </p>
        <p>
          Made with{' '}
          <span className="text-[#FF6B8A]">♥</span>
          {' '}by{' '}
          <a
            href="https://github.com/cherrycoding0/cherryplan"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#FF6B8A] transition-colors underline underline-offset-2"
          >
            cherrycoding0
          </a>
        </p>
      </div>
    </footer>
  )
}
