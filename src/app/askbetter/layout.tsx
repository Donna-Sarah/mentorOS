import { DM_Sans, Plus_Jakarta_Sans } from 'next/font/google'
import type { Metadata } from 'next'

const plusJakarta = Plus_Jakarta_Sans({
  weight: ['700', '800'],
  subsets: ['latin'],
  variable: '--font-askbetter-display',
})

const dmSans = DM_Sans({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-askbetter-body',
})

export const metadata: Metadata = {
  title: 'AskBetter — mentorOS',
  description: 'Hỏi AI rõ hơn. Nhận kết quả tốt hơn.',
}

export default function AskBetterLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div
      className={`askbetter-shell ${plusJakarta.variable} ${dmSans.variable} px-page pb-16 pt-6 md:pt-8`}
    >
      {children}
    </div>
  )
}
