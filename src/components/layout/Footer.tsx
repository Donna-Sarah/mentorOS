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
  'font-body text-body-sm text-slate-text transition-colors hover:text-midnight-ink'

const sectionLabelClassName =
  'mb-3 font-body text-caption font-bold uppercase tracking-wide text-ash-text'

export function Footer() {
  return (
    <footer className="w-full border-t border-soft-gray bg-amber-glow px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-content">
        <div className="flex flex-col gap-10 md:grid md:grid-cols-3 md:gap-8">
          <div>
            <p className="font-display text-heading-sm font-bold text-midnight-ink">
              {t.footer.company}
            </p>
            <p className="mt-1 font-body text-body-sm text-slate-text">
              {t.footer.tagline}
            </p>
          </div>

          <div>
            <p className={sectionLabelClassName}>{t.footer.products}</p>
            <ul className="flex flex-col gap-2">
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
            <p className="font-body text-body-sm text-slate-text">
              {t.footer.company}
            </p>
          </div>
        </div>

        <div className="mt-10 w-full border-t border-soft-gray pt-6 text-center font-body text-body-sm text-ash-text">
          {t.footer.rights}
        </div>
      </div>
    </footer>
  )
}
