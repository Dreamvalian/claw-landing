import Link from "next/link"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="text-lg font-bold">Onyx</p>
            <p className="mt-2 text-sm text-neutral-500">
              Koala's 24/7 AI assistant and original character. Terse. Direct. Always online.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Navigation</p>
            <div className="mt-3 flex flex-col gap-2">
              <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50">
                Home
              </Link>
              <Link href="/about" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50">
                About
              </Link>
              <Link href="/contact" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50">
                Contact
              </Link>
              <Link href="https://dashboard.ko4lax.dev" className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50">
                Dashboard
              </Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Connect</p>
            <div className="mt-3 flex flex-col gap-2">
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50"
              >
                Discord Server
              </a>
              <a
                href="https://github.com/dreamvalian"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-50"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <p className="text-center text-xs text-neutral-400">
            © {currentYear} Onyx. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
