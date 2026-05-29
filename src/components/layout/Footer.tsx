import Link from 'next/link'
import { vi } from '@/lib/i18n/vi'

// TODO: wire lang from cookie/header when server-side i18n is implemented
const t = vi

interface FooterProductLink {
  label: string
  href: string
  external?: boolean
}

const productLinks: FooterProductLink[] = [
  { label: t.nav.askbetter, href: '/askbetter' },
  { label: t.nav.nextup, href: '/nextup' },
  { label: t.nav.pmp, href: '/pmp' },
  {
    label: t.nav.bidmentor,
    href: 'https://bidmentor.vercel.app',
    external: true,
  },
]

const linkClassName =
  'inline-flex min-h-[44px] items-center font-body text-[15px] leading-relaxed text-slate-text transition-colors hover:text-midnight-ink'

const sectionLabelClassName =
  'mb-4 font-body text-[11px] font-bold uppercase tracking-widest text-ash-text'

export function Footer() {
  return (
    <footer className="w-full border-t border-soft-gray bg-amber-glow px-page py-20 md:py-24">
      <div className="mx-auto max-w-content">
        <div className="flex flex-col gap-12 md:grid md:grid-cols-3 md:gap-10">
          <div>
            <p className="font-display text-[22px] font-bold tracking-[-0.02em] text-midnight-ink md:text-[24px]">
              {t.footer.company}
            </p>
            <p className="mt-3 font-body text-[15px] leading-[1.65] text-slate-text">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <p className={sectionLabelClassName}>{t.footer.products}</p>
            <ul className="flex flex-col gap-1">
              {productLinks.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkClassName}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className={linkClassName}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className={sectionLabelClassName}>{t.footer.company}</p>
            <p className="font-body text-[15px] leading-[1.65] text-slate-text">
              {t.footer.company}
            </p>
          </div>
        </div>

        <div className="mt-12 w-full border-t border-soft-gray pt-8 text-center font-body text-[14px] leading-relaxed text-ash-text">
          {t.footer.rights}
        </div>
      </div>
    </footer>
  )
}
