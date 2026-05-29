'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils/cn'

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect y="3" width="20" height="2" rx="1" fill="currentColor" />
      <rect y="9" width="20" height="2" rx="1" fill="currentColor" />
      <rect y="15" width="20" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4 4L16 16M16 4L4 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface NavLinkItem {
  label: string
  href: string
  external?: boolean
}

interface NavLinkProps {
  link: NavLinkItem
  className?: string
  onNavigate?: () => void
}

function NavLink({ link, className, onNavigate }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = !link.external && pathname === link.href

  const linkClassName = cn(className, isActive && 'text-midnight-ink')

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName}
        onClick={onNavigate}
      >
        {link.label}
      </a>
    )
  }

  return (
    <Link href={link.href} className={linkClassName} onClick={onNavigate}>
      {link.label}
    </Link>
  )
}

function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'font-display text-xl font-bold tracking-[-0.02em] text-midnight-ink no-underline cursor-pointer md:text-[22px]',
        className,
      )}
    >
      mentorOS
    </Link>
  )
}

export function Navbar() {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const lastScrollY = useRef(0)
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isPMPInput = pathname === '/pmp'

  const closeDrawer = useCallback(() => setIsOpen(false), [])
  const openDrawer = useCallback(() => setIsOpen(true), [])

  const navLinks = useMemo<NavLinkItem[]>(
    () => [
      { label: t.nav.home, href: '/' },
      { label: t.nav.askbetter, href: '/askbetter' },
      { label: t.nav.nextup, href: '/nextup' },
      { label: t.nav.pmp, href: '/pmp' },
      {
        label: t.nav.bidmentor,
        href: 'https://bidmentor.vercel.app',
        external: true,
      },
    ],
    [t],
  )

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const scrollingDown = currentScrollY > lastScrollY.current
      const atTop = currentScrollY < 10

      setScrolled(currentScrollY > 10)

      if (isOpen) {
        lastScrollY.current = currentScrollY
        return
      }

      if (atTop) {
        setIsVisible(true)
      } else if (scrollingDown) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      lastScrollY.current = currentScrollY
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }
    return () => document.body.classList.remove('menu-open')
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, closeDrawer])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-navbar border-b pt-[env(safe-area-inset-top)]',
          'h-navbar-mobile md:h-navbar-desktop',
          'transition-transform duration-300 ease-in-out',
          isVisible ? 'translate-y-0' : '-translate-y-full',
          isHome
            ? 'border-transparent bg-amber-glow hover:border-[#F3F4F6] hover:bg-white'
            : isPMPInput && !scrolled
              ? 'border-black/5 bg-transparent'
              : isPMPInput && scrolled
                ? 'border-[#E8D5BC] bg-amber-glow'
                : 'border-soft-gray bg-white-canvas',
        )}
      >
        <div className="mx-auto flex h-full max-w-content items-center justify-between px-page">
          <Wordmark />

          <nav
            className="hidden items-center gap-1 xl:flex"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                link={link}
                className="px-3 py-2 font-body text-[14px] font-semibold text-slate-text transition-colors hover:text-midnight-ink"
              />
            ))}
          </nav>

          <div className="hidden items-center xl:flex">
            <Button variant="primary" size="sm" href="/askbetter">
              {t.nav.try_free}
            </Button>
          </div>

          <button
            type="button"
            className="ml-auto inline-flex min-h-[48px] min-w-[48px] items-center justify-center text-midnight-ink xl:ml-0 xl:hidden"
            onClick={openDrawer}
            aria-expanded={isOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={t.nav.open_menu}
          >
            <HamburgerIcon />
          </button>
        </div>
      </header>

      <div
        className={cn(
          'fixed inset-0 z-overlay bg-obsidian/40 transition-opacity xl:hidden',
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0',
        )}
        onClick={closeDrawer}
        aria-hidden={!isOpen}
      />

      <aside
        id="mobile-nav-drawer"
        className={cn(
          'fixed top-0 right-0 z-drawer flex h-screen flex-col bg-white-canvas shadow-drawer transition-transform duration-300 xl:hidden',
          '[transition-timing-function:cubic-bezier(0.4,0,0.2,1)]',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ width: 'min(320px, 85vw)' }}
        aria-hidden={!isOpen}
      >
        <div className="flex items-center justify-between border-b border-soft-gray px-4 py-3">
          <Wordmark />
          <button
            type="button"
            className="inline-flex min-h-touch min-w-touch items-center justify-center text-midnight-ink"
            onClick={closeDrawer}
            aria-label={t.nav.close_menu}
          >
            <CloseIcon />
          </button>
        </div>

        <nav
          className="flex flex-1 flex-col px-4 py-2"
          aria-label="Mobile navigation"
        >
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              link={link}
              onNavigate={closeDrawer}
              className="flex min-h-touch items-center font-body text-body font-semibold text-midnight-ink"
            />
          ))}
        </nav>

        <div className="border-t border-soft-gray p-4">
          <Button
            variant="primary"
            href="/askbetter"
            className="w-full"
            onClick={closeDrawer}
          >
            {t.nav.try_free}
          </Button>
        </div>
      </aside>
    </>
  )
}
