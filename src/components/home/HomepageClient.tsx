'use client'

import Link from 'next/link'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils/cn'

const primaryButtonClassName =
  'inline-flex min-h-[44px] items-center justify-center rounded-md bg-[#111111] px-6 py-3 font-body text-[14px] font-semibold text-white transition-colors hover:bg-[#333333]'

const ghostButtonClassName =
  'inline-flex min-h-[44px] items-center justify-center rounded-md border border-[#D1D5DB] px-6 py-3 font-body text-[14px] font-semibold text-[#111111] transition-colors hover:bg-[#F9FAFB]'

const productCtaClassName =
  'inline-flex min-h-[40px] items-center gap-2 rounded-md bg-[#111111] px-5 py-2.5 font-body text-[14px] font-semibold text-white transition-colors hover:bg-[#333333]'

interface ProductSection {
  id: string
  label: string
  badge: string
  badgeVariant: 'default' | 'product'
  heading: string
  description: string
  cta: string
  href: string
  external?: boolean
  accentColor: string
  surfaceColor: string
  textColor: string
}

interface ProductBlockProps {
  product: ProductSection
}

function ProductTextBlock({ product }: ProductBlockProps) {
  const badgeClassName =
    product.badgeVariant === 'product'
      ? 'bg-[#111111] text-white'
      : 'bg-[#F3F4F6] text-[#6B7280]'

  const ctaContent = (
    <>
      {product.cta}
      <span className="text-[#9CA3AF]">→</span>
    </>
  )

  return (
    <div>
      <div className="mb-4 inline-flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-2">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: product.accentColor }}
            aria-hidden
          />
          <span className="font-body text-[12px] font-bold uppercase tracking-widest text-[#9CA3AF]">
            {product.label}
          </span>
        </span>
        <span
          className={cn(
            'inline-flex items-center rounded-sm px-2 py-0.5 font-body text-[11px] font-semibold uppercase tracking-wide',
            badgeClassName,
          )}
        >
          {product.badge}
        </span>
      </div>

      <h3 className="mt-2 mb-4 font-display text-[32px] font-bold leading-[1.15] tracking-[-0.02em] whitespace-pre-line text-[#111111] md:text-[40px]">
        {product.heading}
      </h3>

      <p className="mb-8 font-body text-[16px] leading-[1.7] text-[#374151]">{product.description}</p>

      {product.external ? (
        <a
          href={product.href}
          target="_blank"
          rel="noopener noreferrer"
          className={productCtaClassName}
        >
          {ctaContent}
        </a>
      ) : (
        <Link href={product.href} className={productCtaClassName}>
          {ctaContent}
        </Link>
      )}
    </div>
  )
}

function ProductVisualBlock({ product }: ProductBlockProps) {
  return (
    <div
      className={cn(
        'relative aspect-[4/3] w-full overflow-hidden rounded-md shadow-[0_20px_60px_-10px_rgba(0,0,0,0.12)]',
        product.surfaceColor,
      )}
    >
      <div className="flex h-full flex-col p-6">
        <div className="mb-4 flex items-center gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </div>

        <div className="flex flex-1 flex-col rounded-md bg-white p-4 shadow-sm">
          <p className={cn('mb-2 font-display text-[18px] font-bold', product.textColor)}>
            {product.label}
          </p>
          <div className="mb-2 h-2 w-full rounded-full bg-[#E5E7EB]" aria-hidden />
          <div className="mb-2 h-2 w-3/4 rounded-full bg-[#E5E7EB]" aria-hidden />
          <div className="mb-2 h-2 w-1/2 rounded-full bg-[#E5E7EB]" aria-hidden />
          <div className="my-3 h-px bg-[#F3F4F6]" aria-hidden />
          <div className="mb-2 h-2 w-full rounded-full bg-[#E5E7EB]" aria-hidden />
          <div className="h-2 w-4/5 rounded-full bg-[#E5E7EB]" aria-hidden />
        </div>
      </div>
    </div>
  )
}

export function HomepageClient() {
  const { t } = useLanguage()

  // TODO: move to i18n when en version is needed
  const productSections: ProductSection[] = [
    {
      id: 'pmp',
      label: 'PMP Thinking Coach',
      badge: t.products.pmp.badge,
      badgeVariant: 'product',
      heading: 'Luyện tư duy PMI,\nkhông chỉ học thuộc lòng.',
      description:
        'Người học PMP thường không sai vì thiếu kiến thức — họ sai vì đọc nhầm intent câu hỏi, bị bẫy bởi cách diễn đạt PMI, hoặc áp dụng kinh nghiệm thực tế thay vì PMI mindset. PMP Thinking Coach giúp bạn nhận ra bẫy tư duy, hiểu vì sao mình chọn sai, và xây Core Rule để không sai lại.',
      cta: t.products.pmp.cta,
      href: '/pmp',
      accentColor: '#7C3AED',
      surfaceColor: 'bg-pmp-surface',
      textColor: 'text-pmp-accent',
    },
    {
      id: 'askbetter',
      label: 'AskBetter',
      badge: t.products.askbetter.badge,
      badgeVariant: 'default',
      heading: 'Hỏi AI rõ hơn.\nNhận kết quả tốt hơn.',
      description:
        'Vấn đề không phải AI không giỏi — vấn đề là yêu cầu của bạn quá mơ hồ. AskBetter phân tích yêu cầu thô của bạn, chỉ ra phần còn thiếu, và giúp bạn viết lại prompt đủ context để AI hiểu đúng ý. Miễn phí, không cần đăng ký.',
      cta: t.products.askbetter.cta,
      href: '/askbetter',
      accentColor: '#2563EB',
      surfaceColor: 'bg-askbetter-surface',
      textColor: 'text-askbetter-primary',
    },
    {
      id: 'nextup',
      label: 'NextUp',
      badge: t.products.nextup.badge,
      badgeVariant: 'default',
      heading: 'Biết việc tiếp theo\ncần làm.',
      description:
        'Bạn không thiếu to-do app — bạn thiếu sự rõ ràng khi đầu óc đang rối. Nhập bất kỳ ghi chú công việc nào bằng ngôn ngữ tự nhiên, NextUp tự động tách task, detect deadline, phân loại ưu tiên và gom lại theo Today / This Week / This Month.',
      cta: t.products.nextup.cta,
      href: '/nextup',
      accentColor: '#06B6D4',
      surfaceColor: 'bg-nextup-surface',
      textColor: 'text-nextup-accent',
    },
    {
      id: 'bidmentor',
      label: 'BidMentor',
      badge: t.products.bidmentor.badge,
      badgeVariant: 'product',
      heading: 'Hiểu đấu thầu\ntừ nền tảng.',
      description:
        'Đấu thầu có hàng trăm thuật ngữ pháp lý và quy trình phức tạp dễ gây overwhelm. BidMentor giúp bạn học từ đầu theo cách thực dụng: giải thích thuật ngữ theo ngữ cảnh thực tế, phân tích bài học theo tier từ cơ bản đến nâng cao, và hỗ trợ đọc hiểu hồ sơ mời thầu.',
      cta: t.products.bidmentor.cta,
      href: 'https://bidmentor.vercel.app',
      external: true,
      accentColor: '#10B981',
      surfaceColor: 'bg-bidmentor-surface',
      textColor: 'text-bidmentor-accent',
    },
  ]

  return (
    <>
      <section className="bg-amber-glow py-16 md:py-[113px]">
        <div className="mx-auto max-w-narrow px-4 text-center md:px-6">
          <p className="mb-4 font-body text-[12px] font-semibold uppercase tracking-widest text-[#6B7280]">
            {t.home.hero_badge}
          </p>

          <h1 className="font-display font-bold tracking-[-0.03em] text-midnight-ink text-[40px] leading-[1.02] md:text-[72px] md:leading-[0.92] md:tracking-[-0.045em]">
            <span className="block">{t.home.hero_title}</span>
            <span className="block -mt-1 md:-mt-3">{t.home.hero_title_2}</span>
            <span className="block -mt-1 text-sunset-orange md:-mt-3">{t.home.hero_title_3}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-reading text-center font-body text-body text-[#374151] leading-[1.7] md:text-subheading">
            {t.home.hero_sub}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/askbetter" className={primaryButtonClassName}>
              {t.home.cta_primary}
            </Link>
            <Link href="/pmp" className={ghostButtonClassName}>
              {t.home.cta_secondary}
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white-canvas py-16 md:py-20">
        <div className="mx-auto mb-0 max-w-content px-4 text-center md:px-6">
          <h2 className="font-display text-[32px] font-bold tracking-[-0.025em] text-[#111111] md:text-[48px]">
            {t.home.products_title}
          </h2>
          <p className="mx-auto mt-3 max-w-[560px] font-body text-[15px] text-[#6B7280]">
            {t.home.products_sub}
          </p>
        </div>
      </section>

      {productSections.map((product, index) => {
        const isEven = index % 2 === 0

        return (
          <section
            key={product.id}
            className={isEven ? 'bg-white' : 'bg-[#FAFAFA]'}
          >
            <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-8 md:py-24">
              <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
                {isEven ? (
                  <>
                    <div>
                      <ProductTextBlock product={product} />
                    </div>
                    <div>
                      <ProductVisualBlock product={product} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="md:order-2">
                      <ProductTextBlock product={product} />
                    </div>
                    <div className="md:order-1">
                      <ProductVisualBlock product={product} />
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        )
      })}

      <section className="bg-amber-glow py-16 md:py-20">
        <div className="mx-auto max-w-narrow px-4 text-center md:px-6">
          <p className="mb-4 font-body text-caption font-bold uppercase tracking-widest text-sunset-orange">
            {t.home.philosophy_label}
          </p>
          <h2 className="mt-2 font-display text-[32px] font-bold tracking-[-0.025em] text-[#111111] md:text-[52px] md:tracking-[-0.035em]">
            {t.home.philosophy_title}
          </h2>
          <p className="mx-auto mt-6 max-w-[560px] font-body text-body leading-[1.7] text-[#374151] md:text-subheading">
            {t.home.philosophy_body}
          </p>
        </div>
      </section>

      <section className="border-t border-soft-gray bg-white-canvas py-12 md:py-16">
        <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-6">
          <div className="mb-6 text-center md:mb-0 md:text-left">
            <h2 className="font-display text-[22px] font-bold tracking-[-0.01em] text-[#111111] md:text-[28px]">
              {t.home.cta_strip_title}
            </h2>
            <p className="mt-1 font-body text-[14px] text-[#6B7280]">
              {t.home.cta_strip_sub}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
            <Link href="/askbetter" className={primaryButtonClassName}>
              {t.home.cta_primary}
            </Link>
            <Link href="/pmp" className={ghostButtonClassName}>
              {t.home.cta_secondary}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
