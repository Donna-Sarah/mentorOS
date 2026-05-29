'use client'

import Link from 'next/link'
import { useLanguage } from '@/hooks/useLanguage'
import { cn } from '@/lib/utils/cn'

const primaryButtonClassName =
  'inline-flex min-h-[48px] items-center justify-center rounded-md bg-[#111111] px-7 py-3.5 font-body text-[15px] font-semibold text-white transition-colors hover:bg-[#333333] md:min-h-[52px] md:px-8 md:py-4 md:text-[16px]'

const ghostButtonClassName =
  'inline-flex min-h-[48px] items-center justify-center rounded-md border border-[#D1D5DB] px-7 py-3.5 font-body text-[15px] font-semibold text-[#111111] transition-colors hover:bg-[#F9FAFB] md:min-h-[52px] md:px-8 md:py-4 md:text-[16px]'

const productCtaClassName =
  'inline-flex min-h-[48px] items-center gap-2 rounded-md bg-[#111111] px-7 py-3.5 font-body text-[15px] font-semibold text-white transition-colors hover:bg-[#333333] md:min-h-[52px] md:px-8 md:text-[16px]'

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

interface ProductVisualBlockProps extends ProductBlockProps {
  imageAlign?: 'start' | 'end'
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
          <span className="font-body text-[11px] font-bold uppercase tracking-widest text-[#9CA3AF]">
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

      <h3 className="mb-4 font-display text-[28px] font-bold leading-[1.15] tracking-[-0.025em] whitespace-pre-line text-[#111111] md:mb-5 md:text-[32px] md:leading-[1.12] lg:text-[36px] xl:text-[38px]">
        {product.heading}
      </h3>

      <p className="mb-8 max-w-reading font-body text-[16px] leading-[1.75] text-[#374151] md:mb-10 md:text-[17px] md:leading-[1.8]">
        {product.description}
      </p>

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

function ProductVisualBlock({ product, imageAlign = 'end' }: ProductVisualBlockProps) {
  return (
    <div
      className={cn(
        'w-full',
        imageAlign === 'end' ? 'md:flex md:justify-end' : 'md:flex md:justify-start',
      )}
    >
      {/* Offset room for Coda-style hard shadow */}
      <div className="relative mx-auto w-full max-w-[520px] pb-2 pr-2 md:mx-0 md:max-w-[480px] lg:max-w-[520px]">
        <div
          className={cn(
            'overflow-hidden rounded-md border border-soft-gray bg-white shadow-block',
            product.surfaceColor,
          )}
        >
          <div className="flex flex-col p-5 md:p-6">
            <div className="mb-4 flex items-center gap-1.5" aria-hidden>
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
            </div>

            <div className="flex min-h-[200px] flex-col rounded-md border border-[#F3F4F6] bg-white p-4 shadow-card md:min-h-[220px]">
              <p className={cn('mb-2 font-display text-[17px] font-bold md:text-[18px]', product.textColor)}>
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
        'Vấn đề không phải AI không giỏi — vấn đề là yêu cầu của bạn quá mơ hồ. AskBetter phân tích yêu cầu thô của bạn, chỉ ra phần còn thiếu, và giúp bạn viết lại để AI hiểu đúng ý. Miễn phí, không cần đăng ký.',
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
        'Bạn không thiếu to-do app — bạn thiếu sự rõ ràng khi đầu óc đang rối. Nhập bất kỳ ghi chú công việc nào bằng ngôn ngữ tự nhiên, NextUp tự tách task, nhận diện deadline, phân loại ưu tiên và gom theo hôm nay / tuần này / tháng này.',
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
        'Đấu thầu có hàng trăm thuật ngữ pháp lý và quy trình phức tạp dễ gây overwhelm. BidMentor giúp bạn học từ đầu theo cách thực dụng: giải thích thuật ngữ theo ngữ cảnh thực tế, phân tích bài học từ cơ bản đến nâng cao, hỗ trợ đọc hiểu hồ sơ mời thầu.',
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
      <section className="bg-amber-glow py-20 md:py-28 lg:py-32 xl:py-[120px]">
        <div className="mx-auto max-w-narrow px-page text-center">
          <p className="mb-5 font-body text-[11px] font-bold uppercase tracking-widest text-[#6B7280] md:mb-6">
            {t.home.hero_badge}
          </p>

          <h1 className="font-display text-[44px] font-bold leading-[1.05] tracking-[-0.035em] text-midnight-ink md:text-[56px] md:leading-[1.02] md:tracking-[-0.04em] lg:text-[64px] lg:leading-[0.96] xl:text-[72px] xl:leading-[0.92] xl:tracking-[-0.045em]">
            <span className="block">{t.home.hero_title}</span>
            <span className="block -mt-0.5 md:-mt-1 lg:-mt-2 xl:-mt-3">{t.home.hero_title_2}</span>
            <span className="block -mt-0.5 text-sunset-orange md:-mt-1 lg:-mt-2 xl:-mt-3">{t.home.hero_title_3}</span>
          </h1>

          <p className="mx-auto mt-8 max-w-reading text-center font-body text-[16px] leading-[1.75] text-[#374151] md:mt-10 md:text-[17px] md:leading-[1.85] xl:text-[18px] xl:leading-[1.7]">
            {t.home.hero_sub}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4 md:mt-14">
            <Link href="/askbetter" className={primaryButtonClassName}>
              {t.home.cta_primary}
            </Link>
            <Link href="/pmp" className={ghostButtonClassName}>
              {t.home.cta_secondary}
            </Link>
          </div>
        </div>
      </section>

      <div className="bg-white-canvas">
        <section className="border-b border-soft-gray py-20 md:py-24">
          <div className="mx-auto max-w-content px-page text-center">
            <h2 className="font-display text-[36px] font-bold tracking-[-0.03em] text-[#111111] md:text-[52px]">
              {t.home.products_title}
            </h2>
            <p className="mx-auto mt-4 max-w-[560px] font-body text-[16px] leading-[1.7] text-[#6B7280]">
              {t.home.products_sub}
            </p>
          </div>
        </section>

        {productSections.map((product, index) => {
          const isEven = index % 2 === 0

          return (
            <section
              key={product.id}
              className="border-b border-soft-gray last:border-b-0"
            >
              <div className="mx-auto max-w-content px-page py-16 md:py-24 lg:py-28">
                <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2 md:gap-x-16 md:gap-y-12 lg:gap-x-20">
                  {isEven ? (
                    <>
                      <div className="order-2 md:order-1 md:pr-4 lg:pr-8">
                        <ProductTextBlock product={product} />
                      </div>
                      <div className="order-1 md:order-2">
                        <ProductVisualBlock product={product} imageAlign="end" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="order-2 md:order-2 md:pl-4 lg:pl-8">
                        <ProductTextBlock product={product} />
                      </div>
                      <div className="order-1 md:order-1">
                        <ProductVisualBlock product={product} imageAlign="start" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <section className="bg-amber-glow py-20 md:py-28 lg:py-32">
        <div className="mx-auto max-w-narrow px-page text-center">
          <p className="mb-5 font-body text-[11px] font-bold uppercase tracking-widest text-sunset-orange md:mb-6">
            {t.home.philosophy_label}
          </p>
          <h2 className="mt-3 font-display text-[36px] font-bold tracking-[-0.03em] text-[#111111] md:text-[44px] md:tracking-[-0.035em] xl:text-[56px] xl:tracking-[-0.04em]">
            {t.home.philosophy_title}
          </h2>
          <p className="mx-auto mt-8 max-w-[560px] font-body text-[16px] leading-[1.75] text-[#374151] md:mt-10 md:text-[17px] md:leading-[1.85] xl:text-[18px] xl:leading-[1.75]">
            {t.home.philosophy_body}
          </p>
        </div>
      </section>

      <section className="border-t border-soft-gray bg-white-canvas py-16 md:py-24 xl:py-20">
        <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-8 px-page md:flex-row md:gap-10">
          <div className="mb-2 text-center md:mb-0 md:text-left">
            <h2 className="font-display text-[26px] font-bold tracking-[-0.02em] text-[#111111] md:text-[28px] xl:text-[32px]">
              {t.home.cta_strip_title}
            </h2>
            <p className="mt-3 font-body text-[15px] leading-[1.65] text-[#6B7280] md:text-[16px] md:leading-[1.75]">
              {t.home.cta_strip_sub}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 md:justify-end">
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
